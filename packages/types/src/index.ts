export type EventStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED" | "SOLD_OUT";

export type EventCategory =
  | "Leadership"
  | "Technology"
  | "Startup"
  | "Culture"
  | "Policy"
  | "Design";

export type Speaker = {
  name: string;
  role: string;
  company: string;
  image: string;
};

export type AgendaItem = {
  time: string;
  title: string;
  description: string;
};

export type TicketTier = {
  id?: string;
  name: string;
  price: number;
  description: string;
  quantity: number;
  sold?: number;
  isFree?: boolean;
};

export type MediaKit = {
  title?: string;
  description?: string;
  files?: Array<{
    label: string;
    url: string;
  }>;
  videos?: string[];
};

export type Venue = {
  name?: string;
  address?: string;
  mapUrl?: string;
  notes?: string;
};

export type ContactUs = {
  email?: string;
  phone?: string;
  person?: string;
};

export type Book = {
  enabled?: boolean;
  instructions?: string;
};

export type Overview = {
  heading?: string;
  content?: string;
};

export type Sponsor = {
  name: string;
  logo?: string;
  website?: string;
};

export type PlatformEvent = {
  id: number;
  name: string;
  type: string;

  startDate?: string;
  endDate?: string;

  startTime?: string;
  endTime?: string;

  location: string;

  image: string;
  galleryImages: string[];
  galleryVideos: string[];

  status: EventStatus | string;

  overview?: Overview;
  mediaKit?: MediaKit;
  agenda: AgendaItem[];
  speakers: Speaker[];
  sponsors: Sponsor[];
  venue?: Venue;
  contactUs?: ContactUs;
  info: string[];
  book?: Book;

  guestPrice: number;
  memberPrice: number;

  tickets: TicketTier[];
};

export type EventBooking = {
  id: string;
  eventId: number;
  ticketId?: string;

  attendeeName: string;
  email: string;
  phone?: string;

  quantity: number;
  amount: number;

  paymentId?: string;

  status:
    | "PENDING"
    | "PAID"
    | "FAILED"
    | "FREE"
    | "CANCELLED";

  createdAt: string;
};