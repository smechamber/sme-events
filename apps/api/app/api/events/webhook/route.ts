import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@events/db";
import { fail, ok } from "../../../../lib/http";
import { safelyNotifyEventBooking } from "../../../../lib/event-booking-notifications";

export const dynamic = "force-dynamic";

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

    let shouldNotify = false;
    const booking = await prisma.$transaction(async (tx:any) => {
      const booking = await tx.eventBooking.findUnique({
        where: { razorpayOrderId: payment.order_id },
        include: { ticket: true },
      });
      if (!booking || booking.status === "PAID" || booking.status === "PENDING_APPROVAL") return booking;
      if (!booking.ticket || booking.ticket.sold + booking.quantity > booking.ticket.quantity) {
        throw new Error("TICKET_SOLD_OUT");
      }
      await tx.eventTicket.update({
        where: { id: booking.ticket.id },
        data: { sold: { increment: booking.quantity } },
      });
      const finalStatus = booking.ticket.requiresApproval ? "PENDING_APPROVAL" : "PAID";
      shouldNotify = true;
      return tx.eventBooking.update({
        where: { id: booking.id },
        data: { status: finalStatus, paymentId: payment.id },
      });
    });
    if (booking && shouldNotify) {
      await safelyNotifyEventBooking(
        booking.id,
        booking.status === "PENDING_APPROVAL" ? "PENDING" : "CONFIRMED",
      );
    }
    return ok({ received: true });
  } catch (error) {
    return fail(error);
  }
}
