import Image from "next/image";
import Link from "next/link";
import type { PlatformEvent } from "@events/types";

export function EventCard({ event }: { event: PlatformEvent }) {
  const image =
    event.image ||
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=85";

  const date = event.startDate ? new Date(event.startDate) : null;

  return (
    <article className="event-card">
      <Link
        href={`/events/${event.id}`}
        className="event-card-media"
        aria-label={`View ${event.name}`}
      >
        <Image src={image} alt={event.name} fill sizes="(max-width: 700px) 100vw, 33vw" />
      </Link>

      <div className="event-card-body">
        <p className="event-label">SME EVENTS</p>

        <h3>{event.name}</h3>

        <div className="event-card-info">
          <div className="event-day">
            <strong>{date?.getDate()}</strong>
            <span>
              {date?.toLocaleDateString("en-IN", {
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>

          <div>
            <p>{event.location}</p>

            <Link href={`/events/${event.id}`}>Know More</Link>
          </div>
        </div>
      </div>
    </article>
  );
}