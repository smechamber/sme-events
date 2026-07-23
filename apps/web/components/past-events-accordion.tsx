"use client";

import Image from "next/image";
import { ImageIcon, Minus, PlayCircle, Plus } from "lucide-react";
import { useState } from "react";
import type { PlatformEvent } from "@events/types";

function eventDate(event: PlatformEvent) {
  const start = event.startDate ? new Date(event.startDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Date to be announced";
  const end = event.endDate ? new Date(event.endDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "";
  return end && end !== start ? `${start} – ${end}` : start;
}

export function PastEventsAccordion({ events }: { events: PlatformEvent[] }) {
  const [openId, setOpenId] = useState<number | null>(null);

  return <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/60">
    {events.map((event, index) => {
      const open = openId === event.id;
      const images = [event.image, ...(event.galleryImages ?? [])].filter(Boolean);
      return <article key={event.id} className={index ? "border-t border-slate-200" : ""}>
        <button type="button" onClick={() => setOpenId(open ? null : event.id)} aria-expanded={open} className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-slate-50 sm:px-8">
          <span className="text-base font-bold text-slate-800 sm:text-xl">{eventDate(event)} | {event.name}</span>
          {open ? <Minus className="shrink-0 text-slate-800" size={24} /> : <Plus className="shrink-0 text-slate-800" size={24} />}
        </button>
        {open && <div className="border-t border-slate-100 bg-slate-50 px-6 py-7 sm:px-8">
          <p className="mb-6 text-sm text-slate-600">{event.location}{event.type ? ` · ${event.type}` : ""}</p>
          {images.length > 0 && <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {images.map((src, imageIndex) => <div key={`${src}-${imageIndex}`} className="relative aspect-video overflow-hidden rounded-xl bg-slate-200">
              <Image src={src} alt={`${event.name} highlight ${imageIndex + 1}`} fill className="object-cover" sizes="(max-width: 768px) 50vw, 33vw" />
            </div>)}
          </div>}
          {!images.length && <p className="flex items-center gap-2 text-sm text-slate-500"><ImageIcon size={18} /> Gallery will be added soon.</p>}
          {event.galleryVideos?.length > 0 && <div className="mt-6 grid gap-4 md:grid-cols-2">
            {event.galleryVideos.map((src, videoIndex) => <video key={`${src}-${videoIndex}`} controls preload="metadata" className="w-full rounded-xl bg-black"><source src={src} /></video>)}
          </div>}
          {event.galleryVideos?.length > 0 && <p className="mt-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500"><PlayCircle size={16} /> Event videos</p>}
        </div>}
      </article>;
    })}
  </div>;
}
