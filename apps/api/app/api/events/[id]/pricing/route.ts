import { prisma } from "@events/db";
import type { EventTicket } from "@prisma/client";
import { fail, ok, options } from "../../../../../lib/http";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return options();
}

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: Params) {
  try {
    const id = Number((await params).id);
    if (!Number.isInteger(id)) return fail(new Error("EVENT_NOT_FOUND"), 404);
    const event = await prisma.event.findUnique({
      where: { id },
      include: { tickets: true }
    });

    if (!event) {
      return fail(new Error("EVENT_NOT_FOUND"), 404);
    }

    return ok(
      event.tickets.map((ticket: EventTicket) => ({
        id: ticket.id,
        name: ticket.name,
        price: ticket.price,
        description: ticket.description,
        type: ticket.isFree || ticket.price === 0 ? "FREE" : "PAID",
        audience: "ALL",
        currency: "INR",
        requiresApproval: ticket.requiresApproval,
        remaining: Math.max(ticket.quantity - ticket.sold, 0),
      }))
    );
  } catch (error) {
    return fail(error);
  }
}
