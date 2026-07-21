import { prisma } from "@events/db";
import { mapEvent } from "../../../../lib/event-mapper";
import { eventPayloadSchema } from "../../../../lib/event-schema";
import { fail, ok } from "../../../../lib/http";

import { NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:3001",
  "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export const dynamic = "force-dynamic";
const json = (value: unknown) =>
  value === null || value === undefined ? undefined : (value as never);
async function findEvent(id: number) {
  return prisma.event.findUnique({ where: { id }, include: { tickets: true } });
}
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const event = await findEvent(Number((await params).id));
    return event
      ? ok(mapEvent(event))
      : fail(new Error("EVENT_NOT_FOUND"), 404);
  } catch (error) {
    return fail(error);
  }
}
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const id = Number((await params).id);
    
    // 1. Fetch the existing event and its tickets, including booking counts
    const existingEvent = await prisma.event.findUnique({
      where: { id },
      include: { 
        tickets: {
          include: {
            _count: {
              select: { bookings: true }
            }
          }
        } 
      }
    });

    if (!existingEvent) return fail(new Error("EVENT_NOT_FOUND"), 404);
    
    const payload = eventPayloadSchema.parse(await request.json());

    // 2. Separate tickets into create, update, and delete buckets
    const incomingTicketIds = payload.tickets
      .map((ticket: any) => (ticket.id ? String(ticket.id) : undefined))
      .filter((ticketId): ticketId is string => Boolean(ticketId));
    
    const ticketsToCreate = payload.tickets.filter((t: any) => !t.id);
    const ticketsToUpdate = payload.tickets.filter((ticket: any) => ticket.id);
    
    // Any existing ticket ID that is NOT in the payload is considered deleted
    const ticketsToDelete = existingEvent.tickets.filter(
      (t) => !incomingTicketIds.includes(t.id)
    );

    // 3. Safety Check: Prevent deletion of tickets that have bookings
    const unsafeDeletes = ticketsToDelete.filter(t => t._count.bookings > 0);
    if (unsafeDeletes.length > 0) {
      const unsafeNames = unsafeDeletes.map(t => t.name).join(", ");
      return fail(new Error(`Cannot delete tickets with existing bookings: ${unsafeNames}`), 400);
    }

    const idsToDelete = ticketsToDelete.map(t => t.id);

    // 4. Perform the safe update
    const event = await prisma.$transaction(async (tx) => {
      await tx.event.update({
        where: { id },
        data: {
          name: payload.name,
          type: payload.type,
          startDate: payload.startDate,
          endDate: payload.endDate,
          startTime: payload.startTime,
          endTime: payload.endTime,
          location: payload.location,
          image: payload.image,
          galleryImages: json(payload.galleryImages),
          galleryVideos: json(payload.galleryVideos),
          status: payload.status,
          agenda: json(payload.agenda),
          book: json(payload.book),
          contactUs: json(payload.contactUs),
          info: json(payload.info),
          mediaKit: json(payload.mediaKit),
          overview: json(payload.overview),
          speakers: json(payload.speakers),
          sponsors: json(payload.sponsors),
          venue: json(payload.venue),
          guestPrice: payload.guestPrice,
          memberPrice: payload.memberPrice,
        },
      });

      if (idsToDelete.length > 0) {
        await tx.eventTicket.deleteMany({
          where: {
            eventId: id,
            id: { in: idsToDelete },
          },
        });
      }

      for (const ticket of ticketsToUpdate as Array<any>) {
        const ticketId = String(ticket.id);
        const updated = await tx.eventTicket.updateMany({
          where: { id: ticketId, eventId: id },
          data: {
            name: ticket.name,
            price: ticket.price,
            description: ticket.description,
            quantity: ticket.quantity,
            isFree: ticket.isFree ?? ticket.price === 0,
            requiresApproval: ticket.requiresApproval ?? false,
          },
        });

        if (updated.count === 0) {
          await tx.eventTicket.create({
            data: {
              eventId: id,
              name: ticket.name,
              price: ticket.price,
              description: ticket.description,
              quantity: ticket.quantity,
              sold: ticket.sold ?? 0,
              isFree: ticket.isFree ?? ticket.price === 0,
              requiresApproval: ticket.requiresApproval ?? false,
            },
          });
        }
      }

      if (ticketsToCreate.length > 0) {
        await tx.eventTicket.createMany({
          data: ticketsToCreate.map((ticket: any) => ({
            eventId: id,
            name: ticket.name,
            price: ticket.price,
            description: ticket.description,
            quantity: ticket.quantity,
            sold: ticket.sold ?? 0,
            isFree: ticket.isFree ?? ticket.price === 0,
            requiresApproval: ticket.requiresApproval ?? false,
          })),
        });
      }

      return tx.event.findUnique({
        where: { id },
        include: { tickets: true },
      });
    });

    if (!event) return fail(new Error("EVENT_NOT_FOUND"), 404);

    return ok(mapEvent(event));
  } catch (error) {
    return fail(error);
  }
}
export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const id = Number((await params).id);
    await prisma.event.delete({ where: { id } });
    return ok({ deleted: true });
  } catch (error) {
    return fail(error);
  }
}
