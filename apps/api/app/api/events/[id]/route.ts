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
    console.log("PUT START");
    const id = Number((await params).id);
    if (!(await findEvent(id))) return fail(new Error("EVENT_NOT_FOUND"), 404);
    const payload = eventPayloadSchema.parse(await request.json());
        console.log(payload);
    await prisma.eventTicket.deleteMany({ where: { eventId: id } });
    const event = await prisma.event.update({
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
        tickets: {
          create: payload.tickets.map((ticket) => ({
            name: ticket.name,
            price: ticket.price,
            description: ticket.description,
            quantity: ticket.quantity,
            sold: ticket.sold ?? 0,
            isFree: ticket.isFree ?? ticket.price === 0,
          })),
        },
      },
      include: { tickets: true },
    });
    return ok(mapEvent(event));
  } catch (error) {
     console.error("PUT ERROR:", error);
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
