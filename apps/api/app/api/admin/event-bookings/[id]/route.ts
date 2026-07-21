import { prisma } from "@events/db";
import { z } from "zod";
import { fail, ok, options } from "../../../../../lib/http";

export const dynamic = "force-dynamic";

const approvalSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
});

export async function OPTIONS() {
  return options();
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { action } = approvalSchema.parse(await request.json());
    const id = (await params).id;
    const booking = await prisma.eventBooking.findUnique({
      where: { id },
      include: { ticket: true },
    });
    if (!booking) return fail(new Error("BOOKING_NOT_FOUND"), 404);
    if (booking.status !== "PENDING_APPROVAL") {
      return fail(new Error("BOOKING_ALREADY_DECIDED"), 409);
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (action === "REJECT") {
        return tx.eventBooking.update({
          where: { id },
          data: { status: "REJECTED" },
        });
      }
      if (!booking.ticket || booking.ticket.sold + booking.quantity > booking.ticket.quantity) {
        throw new Error("TICKET_SOLD_OUT");
      }
      await tx.eventTicket.update({
        where: { id: booking.ticket.id },
        data: { sold: { increment: booking.quantity } },
      });
      return tx.eventBooking.update({
        where: { id },
        data: { status: "APPROVED" },
      });
    });
    return ok(updated);
  } catch (error) {
    return fail(error);
  }
}
