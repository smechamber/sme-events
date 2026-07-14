import { z } from "zod";

const jsonRecord = z.record(z.unknown()).optional().nullable();

export const eventTicketSchema = z.object({
  id: z.string().optional(), name: z.string().min(1), price: z.coerce.number().int().min(0), description: z.string().default(""), quantity: z.coerce.number().int().min(0), sold: z.coerce.number().int().min(0).optional(), isFree: z.boolean().optional()
});

export const eventPayloadSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),
  location: z.string().min(1),
  image: z.string().min(1),
  galleryImages: z.array(z.string()).default([]),
  galleryVideos: z.array(z.string()).default([]),
  status: z.string().min(1),
  agenda: z.array(z.record(z.unknown())).optional().nullable(),
  book: jsonRecord,
  contactUs: jsonRecord,
  info: z.array(z.string()).optional().nullable(),
  mediaKit: jsonRecord,
  overview: jsonRecord,
  speakers: z.array(z.record(z.unknown())).optional().nullable(),
  sponsors: z.array(z.record(z.unknown())).optional().nullable(),
  venue: jsonRecord,
  guestPrice: z.coerce.number().int().min(0).default(0),
  memberPrice: z.coerce.number().int().min(0).default(0),
  tickets: z.array(eventTicketSchema).default([])
});

export const bookingPayloadSchema = z.object({
  eventId: z.coerce.number().int(), ticketId: z.string().optional(), attendeeName: z.string().min(1), email: z.string().email(), phone: z.string().optional(), quantity: z.coerce.number().int().min(1).default(1)
});
