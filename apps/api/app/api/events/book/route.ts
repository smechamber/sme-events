import { NextResponse } from "next/server";
import { prisma } from "@events/db";
import { bookingPayloadSchema } from "../../../../lib/event-schema";
import { fail, ok } from "../../../../lib/http";

export const dynamic = "force-dynamic";

const GST_RATE = 0.18;

// --- CORS HEADERS FIX ---
const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:3000", // Tera frontend URL
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
};

// 1. OPTIONS METHOD EXPORT (CORS Preflight Fix)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// Helper Function
async function createRazorpayOrder(amount: number, receipt: string) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) throw new Error("RAZORPAY_NOT_CONFIGURED");

  const authorization = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${authorization}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ amount, currency: "INR", receipt }),
    cache: "no-store",
  });

  if (!response.ok) throw new Error("RAZORPAY_ORDER_CREATION_FAILED");
  return (await response.json()) as { id: string; amount: number; currency: string };
}

// Helper: Response me headers add karne ke liye
function withCors(response: Response) {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

// 2. POST METHOD EXPORT (Main Booking API)
export async function POST(request: Request) {
  try {
    const payload = bookingPayloadSchema.parse(await request.json());

    const ticket = await prisma.eventTicket.findFirst({
      where: { id: payload.ticketId, eventId: payload.eventId },
    });

    if (!ticket) return withCors(fail(new Error("TICKET_NOT_FOUND"), 404));
    if (ticket.sold + payload.quantity > ticket.quantity) {
      return withCors(fail(new Error("TICKET_SOLD_OUT"), 409));
    }

    const isFree = ticket.isFree || ticket.price === 0;
    const needsApproval =
      (ticket as typeof ticket & { requiresApproval?: boolean }).requiresApproval ?? false;

    const baseAmount = ticket.price * payload.quantity;
    const paymentAmountPaise = isFree
      ? 0
      : Math.round(baseAmount * (1 + GST_RATE) * 100);

  
    const booking = await prisma.eventBooking.create({
      data: {
        eventId: payload.eventId,
        ticketId: ticket.id,
        attendeeName: payload.attendeeName,
        email: payload.attendeeEmail,
        phone: payload.attendeePhone,
        quantity: payload.quantity,
        amount: baseAmount,
        paymentAmountPaise,
        registrationData: {
          companyName: payload.companyName,
          designation: payload.designation,
          ...payload.registrationData,
        },
        status: isFree
          ? (needsApproval ? "PENDING_APPROVAL" : "PAID")
          : "PENDING_PAYMENT",
      },
    });

   
    if (isFree) {
      if (needsApproval) {
        return withCors(
          ok({ bookingId: booking.id, free: true, approvalStatus: "PENDING_APPROVAL" })
        );
      }

      
      await prisma.eventTicket.update({
        where: { id: ticket.id },
        data: { sold: { increment: payload.quantity } },
      });

      return withCors(ok({ bookingId: booking.id, free: true }));
    }

  
    const order = await createRazorpayOrder(paymentAmountPaise, booking.id);

    await prisma.eventBooking.update({
      where: { id: booking.id },
      data: { razorpayOrderId: order.id },
    });

    return withCors(
      ok({
        bookingId: booking.id,
        free: false,
        keyId: process.env.RAZORPAY_KEY_ID,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        requiresApproval: needsApproval, 
      })
    );
  } catch (error) {
    return withCors(fail(error));
  }
}