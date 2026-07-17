import Image from "next/image";
import Link from "next/link";
import type { PlatformEvent } from "@events/types";

export function EventCard({ event }: { event: PlatformEvent }) {
  const image =
    event.image ||
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=85";

  const date = event.startDate ? new Date(event.startDate) : null;

  return (
    // 'group' add kiya taaki hover effects baad mein use kar sako
    <article className="event-card bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
    <Link
  href={`/events/${event.id}`}
  className="relative block aspect-video w-full overflow-hidden bg-gray-100"
  aria-label={`View ${event.name}`}
>
  {/* 1. Blur Background Layer (Side ki jagah bharne ke liye) */}
  <Image 
    src={image} 
    alt="" 
    fill 
    className="absolute inset-0 object-cover blur-md scale-110 opacity-60" 
    sizes="(max-width: 768px) 100vw, 33vw"
  />

  {/* 2. Main Image (Contain mode mein, taaki puri dikhe) */}
  <Image 
    src={image} 
    alt={event.name} 
    fill 
    className="relative object-contain group-hover:scale-105 transition-transform duration-500" 
    sizes="(max-width: 768px) 100vw, 33vw"
  />
</Link>

      <div className="event-card-body p-5">
        <p className="event-label text-xs font-bold text-orange-500 uppercase tracking-wider mb-2">{event.type}</p>

        <h3 className="text-lg font-bold text-gray-900 mb-4 line-clamp-2">{event.name}</h3>

        <div className="event-card-info flex items-center gap-4 border-t border-gray-50 pt-4">
          <div className="event-day flex flex-col items-center bg-gray-50 px-3 py-1 rounded-lg">
            <strong className="text-lg text-gray-800 leading-none">{date?.getDate()}</strong>
            <span className="text-[10px] uppercase font-bold text-gray-500">
              {date?.toLocaleDateString("en-IN", {
                month: "short",
              })}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-600 truncate">{event.location}</p>
            <Link 
              href={`/events/${event.id}`}
              className="text-sm font-semibold text-blue-600 hover:underline mt-1 block"
            >
              Know More
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}