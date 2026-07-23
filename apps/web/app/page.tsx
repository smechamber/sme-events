import Link from "next/link";
import { ArrowRight, BadgeCheck, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import { EventCard } from "../components/event-card";
import { Hero } from "../components/hero";
import { SectionHeading } from "../components/section-heading";
import { getFeaturedEvent, getUpcomingEvents, listEvents } from "../lib/events";
import type { LucideIcon } from "lucide-react";

type HomeSpeaker = { name: string; image?: string; description?: string; role?: string; company?: string; roles?: Array<{ designation?: string; company?: string }> };
type HomeSponsor = { name: string; logo?: string; website?: string; websiteUrl?: string };

function speakersFromEvents(events: Array<{ speakers?: unknown }>): HomeSpeaker[] {
  return events.flatMap((event) => Array.isArray(event.speakers) ? event.speakers.flatMap((item: any) => Array.isArray(item?.speakers) ? item.speakers : item?.name ? [item] : []) : []).filter((speaker: HomeSpeaker) => Boolean(speaker.name?.trim()));
}

function sponsorsFromEvents(events: Array<{ sponsors?: unknown }>): HomeSponsor[] {
  return events.flatMap((event) => Array.isArray(event.sponsors) ? event.sponsors.flatMap((item: any) => Array.isArray(item?.sponsors) ? item.sponsors : item?.name ? [item] : []) : []).filter((sponsor: HomeSponsor) => Boolean(sponsor.name?.trim() || sponsor.logo));
}

export const revalidate = 300;

const categories = ["Leadership", "Technology", "Startup", "Culture", "Policy", "Design"];
const valueProps: Array<{ Icon: LucideIcon; title: string; copy: string }> = [
  {
    Icon: BadgeCheck,
    title: "Verified programming",
    copy: "Editorially curated agendas, real speakers, and complete venue information."
  },
  {
    Icon: UsersRound,
    title: "High-value networking",
    copy: "Events designed around attendee quality, private lounges, and meaningful introductions."
  },
  {
    Icon: ShieldCheck,
    title: "Reliable operations",
    copy: "Ticketing, payment, booking, and support flows built for production readiness."
  }
];

export default async function HomePage() {
  const [featured, upcoming, allEvents] = await Promise.all([
    getFeaturedEvent(),
    getUpcomingEvents(),
    listEvents()
  ]);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: featured.name,
    startDate: featured.startDate,
    location: {
      "@type": "Place",
      name: featured.venue?.name ?? featured.location,
      address: featured.location
    },
    image: featured.image,
    description: featured.overview?.content ?? featured.overview?.heading ?? featured.name
  };
  const speakers = speakersFromEvents(allEvents);
  const sponsors = sponsorsFromEvents(allEvents);

  return (
    <main className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      
      {/* Hero Section */}
      <Hero />

      {/* Upcoming Events */}
  <section className="py-20" id="upcoming">
  <div className="max-w-[1630px] mx-auto px-4 sm:px-6 lg:px-8">
    <SectionHeading
      eyebrow="Upcoming Events"
      title="Upcoming Events"
      copy="Discover business summits, leadership forums, and conversations that matter."
    />
    
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mt-12">
      {upcoming.slice(0, 6).map((event) => (
        <EventCard event={event} key={event.id} />
      ))}
    </div>

    {/* View More Button */}
    <div className="flex justify-center mt-16">
      <Link 
        href="events/upcoming-events"
        className="group flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-gray-600 hover:text-[#e31837] transition-all duration-300 border-b-2 border-transparent hover:border-[#e31837] pb-1"
      >
        View All Events
        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  </div>
</section>

      {/* <section className="py-20 bg-gray-50 border-y border-gray-100" id="past-events">
        <div className="max-w-[1630px] mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Past Events" title="Moments worth revisiting." copy="Browse event highlights, galleries, and videos from our completed programs." />
          <Link href="/events/past-events" className="inline-flex items-center gap-2 text-sm font-semibold text-[#e31837] hover:underline">Explore past events <ArrowRight size={16} /></Link>
        </div>
      </section> */}

      {/* Categories */}
      <section className="py-20 lg:py-28" id="categories">
        <div className="max-w-[1630px] mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Categories"
            title="Designed around audience intent."
            copy="The public website separates discovery paths so mobile visitors, executives, founders, and sponsors can find the right event quickly."
          />
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6 mt-12">
            {categories.map((category, index) => (
              <div className="group flex flex-col items-center justify-center p-8 bg-white border border-gray-200 rounded-2xl hover:border-[#e31837] hover:shadow-lg transition-all duration-300 cursor-pointer" key={category}>
                <Sparkles size={28} className="text-[#e31837] mb-4 group-hover:scale-110 transition-transform" aria-hidden />
                <strong className="text-gray-900 text-lg font-bold">{category}</strong>
                <span className="text-sm text-gray-500 mt-1">{index + 2} programs</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About / Why Attend */}
      <section className="py-20 lg:py-28 bg-[#0a0a0a] text-white" id="about">
        <div className="max-w-[1630px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="text-[#e31837] font-bold tracking-widest uppercase text-sm mb-4 block">Why Attend</span>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6">Premium from first click to final check-in.</h2>
            <p className="text-lg text-gray-400">The experience focuses on trust: sharp content hierarchy, clear event data, responsive booking, accessible controls, and enterprise-grade polish.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {valueProps.map(({ Icon, title, copy }) => (
              <article className="p-8 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors" key={title}>
                <div className="w-14 h-14 bg-[#e31837]/20 text-[#e31837] rounded-xl flex items-center justify-center mb-6">
                  <Icon size={28} aria-hidden />
                </div>
                <h3 className="text-2xl font-bold mb-3">{title}</h3>
                <p className="text-gray-400 leading-relaxed">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>


{/* Speakers */}
<section className="py-20 lg:py-28" id="speakers">
  <div className="max-w-[1630px] mx-auto px-4 sm:px-6 lg:px-8">
    <SectionHeading
      eyebrow="Featured Speakers"
      title="Leaders attendees already trust."
      copy="Meet every speaker added to our upcoming and completed events."
    />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
      {speakers.map((speaker, index) => (
        <article className="flex flex-col items-center text-center group" key={`${speaker.name}-${index}`}>
          {/* Added bg-gray-100 and flex center for the fallback */}
          <div className="relative flex items-center justify-center w-32 h-32 mb-5 overflow-hidden rounded-full border-4 border-gray-100 bg-gray-100 group-hover:border-[#f39c12] transition-colors">
            
            {/* CONDITIONALLY RENDER THE IMAGE 👇 */}
            {speaker.image && speaker.image.trim() !== "" ? (
              <img src={speaker.image} alt={speaker.name} className="h-full w-full object-cover" />
            ) : (
              // Fallback if no image exists (Shows the first letter of their name)
              <span className="text-gray-400 font-bold text-4xl uppercase">
                {speaker.name ? speaker.name.charAt(0) : "S"}
              </span>
            )}
            
          </div>
          <h3 className="text-xl font-bold text-gray-900">{speaker.name}</h3>
          {speaker.roles?.map((role, roleIndex) => <p className="text-sm text-gray-600 mt-1 font-medium" key={roleIndex}>{role.designation}{role.company ? <>, <span className="text-[#e31837]">{role.company}</span></> : null}</p>)}
          {!speaker.roles?.length && <p className="text-sm text-gray-600 mt-1 font-medium">{speaker.role}{speaker.company ? <>, <span className="text-[#e31837]">{speaker.company}</span></> : null}</p>}
          {speaker.description ? <p className="mt-3 max-w-xs text-sm leading-relaxed text-gray-500">{speaker.description}</p> : null}
        </article>
      ))}
      {!speakers.length && <p className="col-span-full text-center text-gray-500">Speakers added from admin event pages will appear here.</p>}
    </div>
  </div>
</section>

     {/* Sponsors */}
<section className="py-20 lg:py-28 bg-gray-50 border-y border-gray-200" id="partners">
  <div className="max-w-[1630px] mx-auto px-4 sm:px-6 lg:px-8">
    <SectionHeading
      eyebrow="Sponsors"
      title="Sponsors and Partners"
      copy="Our partners help create bigger conversations and stronger communities."
    />
    <div className="grid grid-cols-2 gap-5 mt-12 sm:grid-cols-3 lg:grid-cols-5">
      {sponsors.map((sponsor, index) => {
        const content = <div className="flex h-28 items-center justify-center rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md">{sponsor.logo ? <img src={sponsor.logo} alt={sponsor.name || "Sponsor"} className="h-full w-full object-contain" /> : <span className="text-center text-sm font-bold uppercase tracking-wide text-gray-600">{sponsor.name}</span>}</div>;
        const website = sponsor.website ?? sponsor.websiteUrl;
        return website ? <a key={`${sponsor.name}-${index}`} href={website.startsWith("http") ? website : `https://${website}`} target="_blank" rel="noreferrer">{content}</a> : <div key={`${sponsor.name}-${index}`}>{content}</div>;
      })}
      {!sponsors.length && <p className="col-span-full text-center text-gray-500">Sponsors added from admin event pages will appear here.</p>}
    </div>
  </div>
</section>

      {/* FAQ */}
      <section className="py-20 lg:py-28" id="faq">
        <div className="max-w-[1630px] mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="FAQ"
            title="Clear answers before checkout."
            copy="Frequently asked questions reduce support load and increase booking confidence."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            {[
              ["Can visitors book tickets online?", "Yes. The public flow is event, ticket selection, checkout, payment, success, and ticket download."],
              ["Can admins upload hero videos?", "Yes. Event detail supports hero video first, with image fallback when no video is available."],
              ["Will sections hide if empty?", "Yes. Detail pages conditionally render optional data such as agenda, media kit, speakers, and sponsors."]
            ].map(([question, answer]) => (
              <article className="p-8 bg-gray-50 rounded-2xl border border-gray-100" key={question}>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{question}</h3>
                <p className="text-gray-600 leading-relaxed">{answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
