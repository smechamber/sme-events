import { PastEventsAccordion } from "../../../components/past-events-accordion";
import { SectionHeading } from "../../../components/section-heading";
import { getPastEvents } from "../../../lib/events";

export const metadata = { title: "Past Events | SME Events", description: "Explore highlights from completed SME Events programs." };

export default async function PastEventsPage() {
  const events = await getPastEvents();
  return <main className="min-h-screen bg-slate-50 pb-20 pt-32 mt-14">
    <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8">
      <SectionHeading eyebrow="Past Events" title="Our event highlights." copy="Tap the plus icon to view the photos and videos from each completed event." />
      {events.length ? <PastEventsAccordion events={events} /> : <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white py-20 text-center text-slate-500">Completed events will appear here automatically after their end date.</div>}
    </div>
  </main>;
}
