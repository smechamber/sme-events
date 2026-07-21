import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@events/db";
import { paymentVerificationSchema } from "../../../../lib/event-schema";
import { fail, ok } from "../../../../lib/http";

export const dynamic = "force-dynamic";

// --- CORS HEADERS FIX (Same as book route) ---
const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:3000",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
};

// Helper: Response me headers add karne ke liye
function withCors(response: Response) {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

// 1. OPTIONS METHOD EXPORT (CORS Preflight Fix)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// 2. POST METHOD EXPORT (Payment Verification API)
export async function POST(request: Request) {
  try {
    const payload = paymentVerificationSchema.parse(await request.json());

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) return withCors(fail(new Error("RAZORPAY_NOT_CONFIGURED"), 503));

    // Razorpay Signature Verification
    const expected = createHmac("sha256", secret)
      .update(`${payload.razorpayOrderId}|${payload.razorpayPaymentId}`)
      .digest("hex");

    const expectedBuffer = Buffer.from(expected);
    const signatureBuffer = Buffer.from(payload.razorpaySignature);

    const valid =
      expectedBuffer.length === signatureBuffer.length &&
      timingSafeEqual(expectedBuffer, signatureBuffer);

    if (!valid) return withCors(fail(new Error("INVALID_PAYMENT_SIGNATURE"), 400));

    // Update Database Transaction
    const booking = await prisma.$transaction(async (tx) => {
      const booking = await tx.eventBooking.findUnique({
        where: { id: payload.bookingId },
        include: { ticket: true },
      });

      if (!booking || booking.razorpayOrderId !== payload.razorpayOrderId) {
        throw new Error("BOOKING_NOT_FOUND");
      }

      // Already processed (paid or pending approval) — don't double count stock
      if (booking.status === "PAID" || booking.status === "PENDING_APPROVAL") {
        return booking;
      }

      if (!booking.ticket || booking.ticket.sold + booking.quantity > booking.ticket.quantity) {
        throw new Error("TICKET_SOLD_OUT");
      }

      await tx.eventTicket.update({
        where: { id: booking.ticket.id },
        data: { sold: { increment: booking.quantity } },
      });

      // Payment succeeded. Now decide the final status:
      // if this ticket needs admin approval, park it as PENDING_APPROVAL
      // even though payment is complete; otherwise mark PAID.
      const needsApproval =
        (booking.ticket as typeof booking.ticket & { requiresApproval?: boolean })
          .requiresApproval ?? false;

      const finalStatus = needsApproval ? "PENDING_APPROVAL" : "PAID";

      return tx.eventBooking.update({
        where: { id: booking.id },
        data: { status: finalStatus, paymentId: payload.razorpayPaymentId },
      });
    });

    const requiresApproval = booking.status === "PENDING_APPROVAL";

    return withCors(ok({ verified: true, requiresApproval, booking }));
  } catch (error) {
    return withCors(fail(error));
  }
}