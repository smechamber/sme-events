import type { EventBooking, EventSections, TicketTier } from "@events/types";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002/api";

type ApiResponse<T> = {
  data: T;
  error?: string;
};

export async function apiGet<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${apiBaseUrl}${path}`, { cache: "no-store" });
    if (!response.ok) return fallback;
    const json = (await response.json()) as ApiResponse<T>;
    return json.data ?? fallback;
  } catch {
    return fallback;
  }
}

export async function listAdminEvents() {
  return apiGet<AdminEvent[]>("/events", []);
}

export async function getAdminEvent(id: string) {
  return apiGet<AdminEvent | null>(`/events/${id}`, null);
}

export async function listBookings() {
  return apiGet<Array<EventBooking & { event?: AdminEvent; ticket?: TicketTier }>>("/admin/event-bookings", []);
}

export type AdminEvent = {
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
  status: string;
  agenda?: EventSections["agenda"];
  book?: EventSections["book"];
  contactUs?: EventSections["contactUs"];
  info?: EventSections["info"];
  mediaKit?: EventSections["mediaKit"];
  overview?: EventSections["overview"];
  speakers?: EventSections["speakers"];
  sponsors?: EventSections["sponsors"];
  venue?: EventSections["venue"];
  guestPrice: number;
  memberPrice: number;
  tickets: TicketTier[];
};

export type EventFormPayload = Omit<AdminEvent, "id">;

export async function saveEvent(payload: EventFormPayload, id?: string) {
  const response = await fetch(`${apiBaseUrl}/events${id ? `/${id}` : ""}`, {
    method: id ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("EVENT_SAVE_FAILED");
  }

  return response.json();
}
