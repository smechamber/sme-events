import { prisma } from "@events/db";
import { mapEvent } from "../../../lib/event-mapper";
import { eventPayloadSchema } from "../../../lib/event-schema";
import { fail, ok } from "../../../lib/http";

import { NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin":
    process.env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:3001",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export const dynamic = "force-dynamic";
const json = (value: unknown) =>
  value === null || value === undefined ? undefined : (value as never);

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      include: { tickets: true },
      orderBy: { startDate: "asc" },
    });
    return ok(events.map(mapEvent));
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = eventPayloadSchema.parse(await request.json());
    const event = await prisma.event.create({
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
            isFree: ticket.isFree ?? ticket.price === 0,
          })),
        },
      },
      include: { tickets: true },
    });
    return ok(mapEvent(event), 201);
  } catch (error) {
    return fail(error);
  }
}
