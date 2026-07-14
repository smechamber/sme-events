type DbEvent = {
  id: number;
  name: string;
  type: string;
  startDate: Date | null;
  endDate: Date | null;
  startTime: string | null;
  endTime: string | null;
  location: string;
  image: string;
  galleryImages: unknown;
  galleryVideos: unknown;
  status: string;
  agenda: unknown;
  book: unknown;
  contactUs: unknown;
  info: unknown;
  mediaKit: unknown;
  overview: unknown;
  speakers: unknown;
  sponsors: unknown;
  venue: unknown;
  guestPrice: number;
  memberPrice: number;
  tickets?: Array<{
    id: string;
    name: string;
    price: number;
    description: string;
    quantity: number;
    sold: number;
    isFree: boolean;
  }>;
};
const array = <T>(value: unknown): T[] =>
  Array.isArray(value) ? (value as T[]) : [];
const object = <T extends Record<string, unknown>>(
  value: unknown,
): T | undefined =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as T)
    : undefined;

export function mapEvent(event: DbEvent) {
  return {
    id: event.id,
    name: event.name,
    type: event.type,
    startDate: event.startDate?.toISOString(),
    endDate: event.endDate?.toISOString(),
    startTime: event.startTime ?? undefined,
    endTime: event.endTime ?? undefined,
    location: event.location,
    image: event.image,
    galleryImages: array<string>(event.galleryImages),
    galleryVideos: array<string>(event.galleryVideos),
    status: event.status,
    agenda: array(event.agenda),
    book: object(event.book),
    contactUs: object(event.contactUs),
    info: array<string>(event.info),
    mediaKit: object(event.mediaKit),
    overview: object(event.overview),
    speakers: array(event.speakers),
    sponsors: array(event.sponsors),
    venue: object(event.venue),
    guestPrice: event.guestPrice,
    memberPrice: event.memberPrice,
    tickets: event.tickets ?? [],
  };
}
