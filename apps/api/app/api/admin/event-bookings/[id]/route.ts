import { prisma } from "@events/db";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { fail, ok, options } from "../../../../../lib/http";
import { safelyNotifyEventBooking } from "../../../../../lib/event-booking-notifications";

export const dynamic = "force-dynamic";

const approvalSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
  rejectionReason: z.string().trim().min(3).max(1000).optional(),
}).superRefine((value, context) => {
  if (value.action === "REJECT" && !value.rejectionReason) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["rejectionReason"], message: "REJECTION_REASON_REQUIRED" });
  }
});

export async function OPTIONS(request: Request) {
  return options(request);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { action, rejectionReason } = approvalSchema.parse(await request.json());
    const id = (await params).id;
    const booking = await prisma.eventBooking.findUnique({
      where: { id },
      include: { ticket: true },
    });
    if (!booking) return fail(new Error("BOOKING_NOT_FOUND"), 404, request);
    if (booking.status !== "PENDING_APPROVAL") {
      return fail(new Error("BOOKING_ALREADY_DECIDED"), 409, request);
    }

    const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      if (action === "REJECT") {
        return tx.eventBooking.update({
          where: { id },
          data: { status: "REJECTED", rejectionReason },
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
    await safelyNotifyEventBooking(id, action === "APPROVE" ? "CONFIRMED" : "REJECTED");
    return ok(updated, 200, request);
  } catch (error) {
    return fail(error, 500, request);
  }
}
