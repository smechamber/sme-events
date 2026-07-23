import type { PlatformEvent } from "@events/types";

const fallbackImage =
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=2200&q=85";

export const demoEvents: PlatformEvent[] = [
  {
    id: 1,
    name: "Global Growth Summit 2026",
    type: "Leadership", // Replaced 'category'
    status: "PUBLISHED",
    startDate: "2026-09-18T00:00:00.000Z",
    startTime: "09:00", // Extracted from 'time'
    endTime: "18:30",
    location: "Mumbai, India",
    image: fallbackImage, // Replaced 'heroImage'
    galleryImages: [      // Replaced 'gallery'
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80"
    ],
    galleryVideos: [],
    
    // Flattened sections
    overview: {
      heading: "A premium room for business leaders.",
      content:
        "A gathering of founders, CXOs, investors, public leaders, and ecosystem builders shaping the next decade of business growth."
    },
    mediaKit: {
      title: "Media Kit",
      description: "Press releases, speaker portraits, brand assets, and venue media are available for approved partners.",
      files: [{ label: "Download Media Kit", url: "#" }],
      videos: []
    },
    agenda: [
      {
        time: "09:00",
        title: "Executive Registration",
        description: "Badge pickup, hosted networking breakfast, and partner lounge access."
      },
      {
        time: "10:00",
        title: "Opening Keynote",
        description: "The enterprise growth playbook for resilient global expansion."
      }
    ],
    speakers: [
      {
        name: "Aarav Mehta",
        role: "Managing Partner",
        company: "Northstar Ventures",
        image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80"
      },
      {
        name: "Naina Kapoor",
        role: "Chief Strategy Officer",
        company: "Atlas Group",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80"
      }
    ],
    sponsors: [{ name: "Atlas" }, { name: "Northstar" }, { name: "FinEdge" }],
    venue: {
      name: "Jio World Convention Centre",
      address: "Mumbai, India",
      notes: "Doors open at 8:30 AM."
    },
    contactUs: {
      email: "events@company.com",
      phone: "+91 22 4000 2026",
      person: "Events Desk"
    },
    info: ["Government ID is required at check-in.", "Smart casual attire."],
    book: { enabled: true, instructions: "Select a ticket and continue to checkout." },
    
    guestPrice: 14900,
    memberPrice: 12000,
    tickets: [
      { id: "1", name: "Delegate Pass", price: 14900, description: "Main stage, expo, lunch, and networking.", quantity: 120, sold: 0 },
      { id: "2", name: "Executive Pass", price: 29900, description: "Delegate access plus VIP lounge and dinner.", quantity: 42, sold: 0 }
    ]
  }
];

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;


async function apiFetch<T>(path: string, fallback: T): Promise<T> {
  if (!apiBaseUrl) {
    console.error("NEXT_PUBLIC_API_URL is not configured");
    return fallback;
  }
  try {
    const response = await fetch(`${apiBaseUrl}${path}`, { cache: "no-store" });

    if (!response.ok) {
      return fallback;
    }

    const json = (await response.json()) as { data: T };
    return json.data ?? fallback;
  } catch {
    return fallback;
  }
}

export async function listEvents(admin = false) {
  return apiFetch<PlatformEvent[]>(`/events${admin ? "?admin=true" : ""}`, demoEvents);
}

// Updated from getEventBySlug to getEventById
export async function getEventById(id: number) {
  const fallback = demoEvents.find((event) => event.id === id) ?? null;
  return apiFetch<PlatformEvent | null>(`/events/${id}`, fallback);
}

export async function getFeaturedEvent() {
  const events = await listEvents();
  return getUpcomingEventsFrom(events)[0] ?? events.find((event) => event.status === "PUBLISHED") ?? events[0] ?? demoEvents[0];
}

export function isPastEvent(event: PlatformEvent, referenceDate = new Date()) {
  const lastEventDate = event.endDate ?? event.startDate;
  if (!lastEventDate) return false;

  const datePart = lastEventDate.slice(0, 10);
  // Admin date fields are calendar dates. Keep them upcoming through the end
  // of that date in India unless a specific event end time was supplied.
  const date = event.endTime
    ? new Date(`${datePart}T${event.endTime}:00+05:30`)
    : new Date(`${datePart}T23:59:59.999+05:30`);
  return date.getTime() < referenceDate.getTime();
}

export function getUpcomingEventsFrom(events: PlatformEvent[]) {
  return events.filter(
    (event) => event.status === "PUBLISHED" && !isPastEvent(event),
  );
}

export async function getUpcomingEvents() {
  return getUpcomingEventsFrom(await listEvents());
}

export async function getPastEvents() {
  const events = await listEvents();
  return events.filter((event) => isPastEvent(event)).sort((a, b) => {
    const aDate = new Date(a.endDate ?? a.startDate ?? 0).getTime();
    const bDate = new Date(b.endDate ?? b.startDate ?? 0).getTime();
    return bDate - aDate;
  });
}
