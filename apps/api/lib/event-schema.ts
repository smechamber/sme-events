import { z } from "zod";

const jsonObject = z.record(z.unknown());
const jsonRecord = jsonObject.optional().nullable();

export const eventTicketSchema = z.object({
  id: z.string().optional(), name: z.string().min(1), price: z.coerce.number().int().min(0), description: z.string().default(""), quantity: z.coerce.number().int().min(0), sold: z.coerce.number().int().min(0).optional(), isFree: z.boolean().optional(), requiresApproval: z.boolean().optional()
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
  // Supports legacy string lists as well as the rich-text editor's
  // `{ content: "<p>...</p>" }` structure.
  info: z.union([z.array(z.string()), jsonObject]).optional().nullable(),
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
  eventId: z.coerce.number().int().positive(),
  ticketId: z.string().min(1),
  attendeeName: z.string().trim().min(1),
  attendeeEmail: z.string().trim().email(),
  attendeePhone: z.string().trim().min(6).max(25),
  companyName: z.string().trim().max(200).optional(),
  designation: z.string().trim().max(200).optional(),
  registrationData: z.record(z.unknown()).optional(),
  quantity: z.coerce.number().int().min(1).max(10).default(1),
});

export const paymentVerificationSchema = z.object({
  bookingId: z.string().min(1),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});
