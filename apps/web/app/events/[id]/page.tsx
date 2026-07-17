import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Download, Mail } from "lucide-react";
import { formatMoney } from "@events/utils";
import { Hero } from "../../../components/hero";
import { SectionHeading } from "../../../components/section-heading";
import { getEventById } from "../../../lib/events"; 

export const revalidate = 300;

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const event = await getEventById(Number(id));

  if (!event) {
    return {};
  }

  const pageTitle = event.name;
  const pageDescription = event.overview?.content?.replace(/<[^>]+>/g, '') ?? `Join us for ${event.name} at ${event.location}.`;

  return {
    title: pageTitle,
    description: pageDescription,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      images: event.image ? [event.image] : [],
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: event.image ? [event.image] : []
    }
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;
  const event = await getEventById(Number(id));

  if (!event) {
    notFound();
  }

  const tabs = [
    { label: "Overview", id: "overview", exists: event.overview },
    { label: "Media Kit", id: "media-kit", exists: event.mediaKit },
    { label: "Agenda", id: "agenda", exists: event.agenda?.length },
    { label: "Speakers", id: "speakers", exists: event.speakers?.length },
    { label: "Sponsors", id: "sponsors", exists: event.sponsors?.length },
    { label: "Venue", id: "venue", exists: event.venue },
    { label: "General Info", id: "general-info", exists: event.info?.length },
    { label: "Contact Us", id: "contact", exists: event.contactUs },
  ].filter((tab) => Boolean(tab.exists));

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.name,
    startDate: event.startDate,
    endDate: event.endDate,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: event.venue?.name ?? event.location,
      address: event.location
    },
    image: event.image, 
    description: event.overview?.content?.replace(/<[^>]+>/g, '') ?? event.name, 
    offers: (event.tickets ?? []).map((ticket) => ({
      "@type": "Offer",
      name: ticket.name,
      price: ticket.price,
      priceCurrency: "INR",
      availability: (ticket.quantity - (ticket.sold ?? 0)) > 0 ? "https://schema.org/InStock" : "https://schema.org/SoldOut"
    }))
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      
{/* Container: mt-20 ya mt-24 se header ke niche space mil jayega */}
<div className="relative w-full bg-[#0b1c2e] overflow-hidden mt-20 md:mt-28">
  {event.image && (
    <>
      {/* 1. BACKGROUND BLUR LAYER */}
      <div className="absolute inset-0 z-0">
        <Image
          src={event.image}
          alt="Background blur layer"
          fill
          priority
          className="object-cover object-center blur-md scale-110 opacity-40"
        />
      </div>
      
      {/* 2. MAIN IMAGE CONTAINER */}
      {/* aspect-auto aur min-h set kiya hai taaki image jitni badi ho utni jagah le */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="relative w-full max-h-[600px] flex items-center justify-center">
          <Image
            src={event.image}
            alt={event.name}
            width={1200}
            height={600}
            priority
            className="w-full h-auto object-contain drop-shadow-2xl"
          />
        </div>
      </div>
    </>
  )}
</div>
      {/* MOBILE Navigation (Hidden on Desktop) */}
      <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <nav className="px-4 sm:px-6 flex overflow-x-auto hide-scrollbar gap-6 py-4" aria-label="Event sections">
          {tabs.map((tab) => (
            <a 
              key={tab.id} 
              href={`#${tab.id}`}
              className="text-sm font-semibold text-gray-600 hover:text-black whitespace-nowrap transition-colors"
            >
              {tab.label}
            </a>
          ))}
        </nav>
      </div>

      {/* Main Layout: 3 Columns on Desktop (Left Tabs, Center Content, Right Tickets) */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 flex flex-col lg:flex-row gap-6 xl:gap-4 items-start">
        
        {/* COLUMN 1: LEFT SIDEBAR (Desktop Navigation - Ek ke niche ek) */}
        <aside className="hidden lg:flex flex-col sticky top-28 w-48 shrink-0 space-y-1 py-2">
       
          {tabs.map((tab) => (
            <a
              key={tab.id}
              href={`#${tab.id}`}
              className="block px-3 py-2.5 text-sm font-semibold text-gray-600 rounded-md hover:bg-white hover:text-black hover:shadow-sm transition-all"
            >
              {tab.label}
            </a>
          ))}
        </aside>

        {/* COLUMN 2: CENTER (Main Content) */}
        <div className="flex-1 w-full min-w-0 space-y-12">
          
          {/* OVERVIEW SECTION */}
          {event.overview && (
            <section id="overview" className="scroll-mt-32 bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <p className="text-xs font-bold tracking-wider text-orange-500 uppercase mb-4">Overview</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 uppercase">
                {event.overview.heading ?? event.name}
              </h2>
              
              {/* HTML FIX & text wrap fix */}
              <div 
                className="prose prose-gray max-w-none text-gray-700 leading-relaxed break-words whitespace-normal [&_p]:mb-4 [&_strong]:font-bold [&_ul]:list-disc [&_ul]:pl-5 [&_a]:text-blue-600 hover:[&_a]:underline text-justify"
                dangerouslySetInnerHTML={{ __html: event.overview.content?.replace(/&nbsp;/g, ' ') ?? "" }}
              />
            </section>
          )}

          {/* MEDIA KIT */}
          {event.mediaKit && (
            <section id="media-kit" className="scroll-mt-32 bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-gray-100">
              <SectionHeading
                eyebrow="Media Kit"
                title={event.mediaKit.title ?? "Press-ready event assets."}
                copy={event.mediaKit.description ?? "Give journalists, partners, and sponsors approved event material."}
              />
              <div className="mt-8">
                {(event.mediaKit.files ?? [{ label: "Download Media Kit", url: "#" }]).map((file) => (
                  <Link 
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors" 
                    href={file.url} 
                    key={file.label}
                  >
                    <Download size={16} /> {file.label}
                  </Link>
                ))}
              </div>
              {event.mediaKit.videos?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                  {event.mediaKit.videos.map((video) => (
                    <video key={video} src={video} controls preload="metadata" className="w-full h-auto rounded border border-gray-200" />
                  ))}
                </div>
              ) : null}
            </section>
          )}

          {/* AGENDA */}
          {event.agenda?.length ? (
            <section id="agenda" className="scroll-mt-32 bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-gray-100">
              <SectionHeading
                eyebrow="Agenda"
                title="A polished program with clear timing."
                copy="Agenda data is shown only when the event builder contains agenda items."
              />
              <div className="mt-8 space-y-6">
                {event.agenda.map((item) => (
                  <article className="flex flex-col sm:flex-row gap-2 sm:gap-6 pb-6 border-b border-gray-100 last:border-0 last:pb-0" key={`${item.time}-${item.title}`}>
                    <strong className="text-gray-900 min-w-[120px] shrink-0 mt-1">{item.time}</strong>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {/* SPEAKERS */}
          {event.speakers?.length ? (
            <section id="speakers" className="scroll-mt-32 bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-gray-100">
              <SectionHeading
                eyebrow="Speakers"
                title="Featured voices."
                copy="Speaker cards use optimized images and compact credentials for quick scanning."
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mt-8">
                {event.speakers.map((speaker) => (
                  <article className="flex flex-col items-center text-center group" key={speaker.name}>
                    <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border border-gray-200">
                      <Image src={speaker.image} alt={speaker.name} width={96} height={96} className="object-cover w-full h-full" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm">{speaker.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {speaker.role}, <br/>{speaker.company}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {/* SPONSORS */}
          {event.sponsors?.length ? (
            <section id="sponsors" className="scroll-mt-32 bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-gray-100">
              <SectionHeading
                eyebrow="Sponsors"
                title="Partner recognition."
                copy="Sponsors are presented with restrained enterprise styling."
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8">
                {event.sponsors.map((sponsor) => (
                  <div key={sponsor.name} className="h-24 flex items-center justify-center p-4 border border-gray-200 rounded-md">
                    <span className="font-bold text-gray-700 text-center text-sm">{sponsor.name}</span>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {/* VENUE */}
          <section id="venue" className="scroll-mt-32 bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-gray-100">
            <SectionHeading
              eyebrow="Venue"
              title={event.venue?.name ?? event.location}
              copy={`${event.venue?.address ?? event.location}. ${event.venue?.notes ?? ""}`}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              {(event.galleryImages ?? []).map((imgUrl) => (
                <div key={imgUrl} className="relative h-64 rounded-md overflow-hidden border border-gray-200">
                  <Image src={imgUrl} alt="Venue" fill className="object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          </section>

          {/* GENERAL INFO */}
          {event.info?.length ? (
            <section id="general-info" className="scroll-mt-32 bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-gray-100">
              <SectionHeading
                eyebrow="General Information"
                title="Everything attendees should know."
                copy="Operational notes stay separate from marketing copy."
              />
              <div className="space-y-4 mt-8">
                {event.info.map((item) => (
                  <article className="p-4 bg-gray-50 border border-gray-100 rounded-md" key={item}>
                    <p className="text-gray-700 text-sm">{item}</p>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {/* CONTACT US */}
          {event.contactUs ? (
            <section id="contact" className="scroll-mt-32 bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-gray-100">
              <p className="text-xs font-bold tracking-wider text-orange-500 uppercase mb-4">Contact Us</p>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Need help with this event?</h2>
              <p className="text-gray-600 mb-6">Our support team can help with ticketing, sponsor requests, media access, and venue questions.</p>
              <a className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white font-medium rounded-md hover:bg-gray-800 transition-colors" href={`mailto:${event.contactUs.email ?? "events@company.com"}`}>
                <Mail size={18} /> Email Us
              </a>
            </section>
          ) : null}

        </div>

        {/* COLUMN 3: RIGHT SIDEBAR (Tickets Booking) */}
        <aside className="w-full lg:w-[320px] xl:w-[350px] shrink-0 sticky top-28 bg-white p-6 rounded-lg shadow-sm border border-gray-200" id="book" aria-label="Book event">
          <p className="text-xs font-bold tracking-wider text-orange-500 uppercase mb-4">Book Event</p>
          <h2 className="text-lg font-bold text-gray-900 mb-6">Select Ticket</h2>
          
          <div className="space-y-6 mb-8">
            {(event.tickets ?? []).map((ticket) => (
              <div className="flex flex-col border-b border-gray-100 pb-4 last:border-0 last:pb-0" key={ticket.name}>
                <div className="flex justify-between items-start mb-1">
                  <strong className="text-gray-900 text-sm leading-tight pr-2">{ticket.name}</strong>
                  <strong className="text-gray-900 text-sm whitespace-nowrap">{formatMoney(ticket.price)}</strong>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed break-words">{ticket.description}</p>
              </div>
            ))}
          </div>

          <Link 
            className="w-full flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white font-medium py-3 rounded-md transition-colors" 
            href={`/book/${event.id}`}
          >
            Continue to Checkout <ArrowRight size={16} />
          </Link>
        </aside>

      </div>
    </div>
  );
}