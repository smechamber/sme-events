import { EventCard } from "../../../components/event-card"; 
import { getUpcomingEvents } from "../../../lib/events"; 
import { SectionHeading } from "../../../components/section-heading";

export const metadata = {
  title: "Upcoming Events | SME Events",
  description: "Browse our upcoming business summits and networking events.",
};

export default async function UpcomingEventsPage() {
  // Fetch data in the server component.
  const events = await getUpcomingEvents();
  
  const upcoming = events;

  return (
    <main className="min-h-screen bg-gray-50 pt-32 pb-20 mt-14">
      <div className="max-w-[1630px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Title */}
        <div className="mb-12">
           <SectionHeading
                      eyebrow="Upcoming Events"
                      title="Upcoming Events"
                      copy="Discover business summits, leadership forums, and conversations that matter."
                    />
        </div>

        {/* Events Grid */}
        {upcoming.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcoming.map((event) => (
              <EventCard event={event} key={event.id} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-xl">
            <h2 className="text-xl text-gray-400">No events found.</h2>
            <p className="text-gray-500">Check back later for new event listings.</p>
          </div>
        )}
      </div>
    </main>
  );
}
