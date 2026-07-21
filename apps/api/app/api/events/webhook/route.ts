import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@events/db";
import { fail, ok } from "../../../../lib/http";

export const dynamic = "force-dynamic";

/**
 * Razorpay's server-to-server confirmation. This covers the case where a
 * customer completes payment but closes the checkout before the browser can
 * call `/events/verify`.
 */
export async function POST(request: Request) {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = request.headers.get("x-razorpay-signature");
    if (!secret || !signature) return fail(new Error("INVALID_WEBHOOK"), 400);

    const rawBody = await request.text();
    const expected = Buffer.from(
      createHmac("sha256", secret).update(rawBody).digest("hex"),
    );
    const received = Buffer.from(signature);
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
      return fail(new Error("INVALID_WEBHOOK_SIGNATURE"), 400);
    }

    const body = JSON.parse(rawBody) as {
      event?: string;
      payload?: { payment?: { entity?: { id?: string; order_id?: string } } };
    };
    if (body.event !== "payment.captured") return ok({ received: true });

    const payment = body.payload?.payment?.entity;
    if (!payment?.id || !payment.order_id) return fail(new Error("INVALID_WEBHOOK"), 400);

    await prisma.$transaction(async (tx) => {
      const booking = await tx.eventBooking.findUnique({
        where: { razorpayOrderId: payment.order_id },
        include: { ticket: true },
      });
      if (!booking || booking.status === "PAID") return;
      if (!booking.ticket || booking.ticket.sold + booking.quantity > booking.ticket.quantity) {
        throw new Error("TICKET_SOLD_OUT");
      }
      await tx.eventTicket.update({
        where: { id: booking.ticket.id },
        data: { sold: { increment: booking.quantity } },
      });
      await tx.eventBooking.update({
        where: { id: booking.id },
        data: { status: "PAID", paymentId: payment.id },
      });
    });
    return ok({ received: true });
  } catch (error) {
    return fail(error);
  }
}
