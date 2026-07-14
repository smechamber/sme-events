// import Image from "next/image";
// import Link from "next/link";
// import { Calendar, MapPin } from "lucide-react";
// import type { PlatformEvent } from "@events/types";

// export function Hero({
//   event,
//   detail = false,
// }: {
//   event: PlatformEvent;
//   detail?: boolean;
// }) {
//   const image =
//     event.image ||
//     "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=2200&q=85";

//   const overview =
//     event.overview?.content ??
//     event.overview?.heading ??
//     "";

//   return (
//     <section className={`hero ${detail ? "detail-hero" : ""}`}>
//       <div className="site-shell hero-layout">
//         <div className="hero-copy-block">
//           <p className="event-label">SME EVENTS</p>

//           <h1>{event.name}</h1>

//           <p className="hero-date">
//             <Calendar size={16} />{" "}
//             {event.startDate
//               ? new Date(event.startDate).toLocaleDateString("en-IN", {
//                   day: "numeric",
//                   month: "short",
//                   year: "numeric",
//                 })
//               : ""}
//             <span /> <MapPin size={16} /> {event.location}
//           </p>

//           <p className="hero-copy">{overview}</p>

//           <Link className="btn btn-primary" href="#">
//             Register now
//           </Link>
//         </div>

//         <div className="hero-image">
//           <Image
//             src={image}
//             alt={event.name}
//             fill
//             priority
//             sizes="(max-width: 800px) 100vw, 60vw"
//           />
//         </div>
//       </div>
//     </section>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, ArrowRight, Clock } from "lucide-react";
import type { PlatformEvent } from "@events/types";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=2200&q=85";

export function Hero({
  event,
  events,
  detail = false,
}: {
  event?: PlatformEvent;
  events?: PlatformEvent[];
  detail?: boolean;
}) {
  // Agar slider ke liye 'events' array aaya hai toh wo use karo.
  // Nahi toh detail page ka single 'event' use karo.
  const displayEvents = events?.length ? events : event ? [event] : [];

  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide logic (Sirf tab chalega jab 1 se zyada events honge)
  useEffect(() => {
    if (displayEvents.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % displayEvents.length);
    }, 5000); // 5 seconds timer for a calm, readable pace

    return () => clearInterval(interval);
  }, [displayEvents.length]);

  if (displayEvents.length === 0) {
    return null;
  }

  return (
    <section 
      className={`hero-slider-section ${detail ? "detail-hero" : ""}`}
      style={{ 
        position: "relative", 
        width: "100%", 
        height: detail ? "40vh" : "60vh", 
        minHeight: "500px",
        overflow: "hidden",
        backgroundColor: "#111"
      }}
    >
      {displayEvents.map((ev, index) => {
        const image = ev.image || FALLBACK_IMAGE;
        const isActive = currentIndex === index;

        return (
          <div
            key={ev.id}
            style={{
              position: "absolute",
              inset: 0,
              opacity: isActive ? 1 : 0,
              transition: "opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
              zIndex: isActive ? 1 : 0,
            }}
          >
            {/* Full Background Image */}
            <Image
              src={image}
              alt={ev.name}
              fill
              priority={index === 0}
              sizes="100vw"
              style={{ objectFit: "cover" }}
            />

            {/* Dark Gradient Overlay: Left se dark hoga taaki text clear dikhe */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)",
                pointerEvents: "none",
              }}
            />

            {/* Left Aligned Content Block */}
            <div className="site-shell" style={{ height: "100%", position: "relative", zIndex: 2 }}>
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  transform: "translateY(-50%)",
                  maxWidth: "650px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.25rem",
                  color: "#fff",
                }}
              >
                {/* Small Event Label */}
                <span
                  style={{
                    backgroundColor: "var(--brand-color, #e11d48)",
                    color: "white",
                    padding: "0.25rem 0.75rem",
                    borderRadius: "4px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    width: "fit-content",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.3)"
                  }}
                >
                  {ev.type ?? "SME EVENT"}
                </span>

                <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", lineHeight: 1.1, margin: 0, color: "#fff", textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
                  {ev.name}
                </h1>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "1.5rem",
                    alignItems: "center",
                    opacity: 0.9,
                    fontWeight: 500,
                    fontSize: "1.1rem"
                  }}
                >
                  {ev.startDate && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <Calendar size={18} />
                      <span>
                        {new Date(ev.startDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  )}

                  {ev.startTime && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <Clock size={18} />
                      <span>{ev.startTime}</span>
                    </div>
                  )}

                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <MapPin size={18} />
                    <span>{ev.location}</span>
                  </div>
                </div>

                <p style={{ fontSize: "1.125rem", lineHeight: 1.6, opacity: 0.85, margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {ev.overview?.content ?? ev.overview?.heading ?? ""}
                </p>

                <div style={{ marginTop: "1rem" }}>
                  <Link
                    className="btn btn-primary"
                    href={detail ? "#book" : `/events/${ev.id}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.75rem 1.5rem",
                      fontWeight: 600,
                      backgroundColor: "#fff",
                      color: "#000",
                      border: "none",
                      borderRadius: "4px"
                    }}
                  >
                    {detail ? "Book Tickets" : "Know More"} <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Slider Navigation Dots (Only if multiple events) */}
      {displayEvents.length > 1 && (
        <div
          style={{
            position: "absolute",
            bottom: "2rem",
            left: "0",
            right: "0",
            display: "flex",
            justifyContent: "center",
            gap: "0.75rem",
            zIndex: 10,
          }}
        >
          {displayEvents.map((_, index) => (
            <button
              key={`dot-${index}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                border: "none",
                padding: 0,
                cursor: "pointer",
                backgroundColor: currentIndex === index ? "#fff" : "rgba(255,255,255,0.3)",
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}