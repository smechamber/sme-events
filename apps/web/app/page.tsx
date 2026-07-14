import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Building2, Globe2, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import { EventCard } from "../components/event-card";
import { Hero } from "../components/hero";
import { SectionHeading } from "../components/section-heading";
import { getFeaturedEvent, getPastEvents, getUpcomingEvents, listEvents } from "../lib/events";
import type { LucideIcon } from "lucide-react";

const Newsletter = dynamic(() => import("../components/newsletter").then((mod) => mod.Newsletter), {
  loading: () => <div className="newsletter">Loading newsletter...</div>
});

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
  const [featured, upcoming, past, allEvents] = await Promise.all([
    getFeaturedEvent(),
    getUpcomingEvents(),
    getPastEvents(),
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
    description: featured.shortDescription
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <Hero event={featured} />

      <section className="section" id="upcoming">
        <div className="site-shell">
          <SectionHeading
            eyebrow="Upcoming Events"
            title="Upcoming Events"
            copy="Discover business summits, leadership forums, and conversations that matter."
          />
          <div className="event-grid">
            {allEvents.map((event) => (
              <EventCard event={event} key={event.id} />
            ))}
          </div>
        </div>
      </section>

      <section className="section alt" id="past-events">
        <div className="site-shell">
          <SectionHeading
            eyebrow="Past Events"
            title="More events, more ideas."
            copy="Explore our events calendar and find the right room for your next big conversation."
          />
          <div className="event-grid">
            {upcoming.map((event) => (
              <EventCard event={event} key={event.id} />
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="categories">
        <div className="site-shell">
          <SectionHeading
            eyebrow="Categories"
            title="Designed around audience intent."
            copy="The public website separates discovery paths so mobile visitors, executives, founders, and sponsors can find the right event quickly."
          />
          <div className="category-grid">
            {categories.map((category, index) => (
              <div className="category-tile" key={category}>
                <Sparkles size={22} aria-hidden />
                <strong>{category}</strong>
                <span>{index + 2} programs</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section alt" id="about">
        <div className="site-shell">
          <SectionHeading
            eyebrow="Why Attend"
            title="Premium from first click to final check-in."
            copy="The experience focuses on trust: sharp content hierarchy, clear event data, responsive booking, accessible controls, and enterprise-grade polish."
          />
          <div className="testimonial-grid">
            {valueProps.map(({ Icon, title, copy }) => (
              <article className="testimonial-card" key={title}>
                <Icon size={28} aria-hidden />
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="speakers">
        <div className="site-shell">
          <SectionHeading
            eyebrow="Featured Speakers"
            title="Leaders attendees already trust."
            copy="Only render speaker sections when speaker data exists on an event detail page; the homepage highlights marquee speakers from the featured event."
          />
          <div className="speaker-grid">
            {(featured.speakers ?? []).map((speaker) => (
              <article className="speaker-card" key={speaker.name}>
                <Image src={speaker.image} alt={speaker.name} width={96} height={96} />
                <h3>{speaker.name}</h3>
                <p>
                  {speaker.role}, {speaker.company}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section alt" id="partners">
        <div className="site-shell">
          <SectionHeading
            eyebrow="Sponsors"
            title="Sponsors and Partners"
            copy="Our partners help create bigger conversations and stronger communities."
          />
          <div className="sponsor-grid">
           {(featured.sponsors ?? []).map((sponsor) => (
              <span key={sponsor.name}>{sponsor.name}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="site-shell">
          <SectionHeading
            eyebrow="Gallery"
            title="A visual record of premium rooms."
            copy="Optimized Next.js images keep the experience fast while making the platform feel media-rich and credible."
          />
          <div className="gallery-grid">
            {(featured.galleryImages ?? []).map((image) => (
              <Image key={image} src={image} alt="" width={900} height={620} loading="lazy" />
            ))}
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="site-shell">
          <SectionHeading
            eyebrow="Past Events"
            title="Proof that the platform can carry a portfolio."
            copy="Past events remain discoverable without competing with registration-focused upcoming events."
          />
          <div className="event-grid">
            {past.map((event) => (
              <EventCard event={event} key={event.id} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="site-shell">
          <SectionHeading
            eyebrow="Testimonials"
            title="Designed for confidence."
            copy="Enterprise users should feel the platform is trustworthy, fast, polished, and operationally mature."
          />
          <div className="testimonial-grid">
            <article className="testimonial-card">
              <p>"The registration flow felt premium and the event information was exactly where our team expected it."</p>
              <strong>Corporate Delegate</strong>
            </article>
            <article className="testimonial-card">
              <p>"Sponsor visibility, agenda clarity, and mobile performance made the event easy to promote."</p>
              <strong>Brand Partner</strong>
            </article>
            <article className="testimonial-card">
              <p>"A clean platform that can scale across multiple websites without feeling generic."</p>
              <strong>Platform Admin</strong>
            </article>
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="site-shell">
          <SectionHeading
            eyebrow="Latest Updates"
            title="Event intelligence without clutter."
            copy="Updates can later be driven from the API while the frontend keeps the same editorial component system."
          />
          <div className="testimonial-grid">
            <article className="info-panel">
              <Globe2 aria-hidden />
              <h3>Global speaker batch announced</h3>
              <p>New CXO and investor sessions added to the flagship summit agenda.</p>
            </article>
            <article className="info-panel">
              <Building2 aria-hidden />
              <h3>Venue partners expanded</h3>
              <p>Premium venues across Mumbai, Bengaluru, Dubai, and Jaipur are being onboarded.</p>
            </article>
            <article className="info-panel">
              <ArrowRight aria-hidden />
              <h3>Sync-ready schema</h3>
              <p>The event model is structured for future distribution to company websites.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section" id="newsletter">
        <div className="site-shell">
          <Newsletter />
        </div>
      </section>

      <section className="section alt" id="faq">
        <div className="site-shell">
          <SectionHeading
            eyebrow="FAQ"
            title="Clear answers before checkout."
            copy="Frequently asked questions reduce support load and increase booking confidence."
          />
          <div className="faq-grid">
            {[
              ["Can visitors book tickets online?", "Yes. The public flow is event, ticket selection, checkout, payment, success, and ticket download."],
              ["Can admins upload hero videos?", "Yes. Event detail supports hero video first, with image fallback when no video is available."],
              ["Will sections hide if empty?", "Yes. Detail pages conditionally render optional data such as agenda, media kit, speakers, and sponsors."]
            ].map(([question, answer]) => (
              <article className="faq-card" key={question}>
                <h3>{question}</h3>
                <p>{answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
