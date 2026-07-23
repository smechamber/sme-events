import Link from "next/link";
import { ImageIcon, Pencil, Video } from "lucide-react";
import { listAdminEvents } from "../../lib/api";

function isPast(event: { startDate?: string; endDate?: string; endTime?: string }) {
  const lastDate = event.endDate ?? event.startDate;
  if (!lastDate) return false;
  const datePart = lastDate.slice(0, 10);
  const completedAt = event.endTime ? new Date(`${datePart}T${event.endTime}:00+05:30`) : new Date(`${datePart}T23:59:59.999+05:30`);
  return completedAt.getTime() < Date.now();
}

export default async function AdminPastEventsPage() {
  const events = (await listAdminEvents())
    .filter(isPast)
    .sort(
      (a, b) =>
        new Date(b.endDate ?? b.startDate ?? 0).getTime() -
        new Date(a.endDate ?? a.startDate ?? 0).getTime(),
    );
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Media archive</p>
          <h1>Past Events</h1>
          <p>
            Completed events appear here automatically. Open one to upload its
            photos and videos.
          </p>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Event</th>
              <th>Date</th>
              <th>Images</th>
              <th>Videos</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td>
                  <strong>{event.name}</strong>
                  <br />
                  <small>{event.location}</small>
                </td>
                <td>
                  {event.endDate || event.startDate
                    ? new Date(
                        event.endDate ?? event.startDate!,
                      ).toLocaleDateString("en-IN")
                    : "—"}
                </td>
                <td>
                  <span className="inline-flex items-center gap-1">
                    <ImageIcon size={15} /> {event.galleryImages?.length ?? 0}
                  </span>
                </td>
                <td>
                  <span className="inline-flex items-center gap-1">
                    <Video size={15} /> {event.galleryVideos?.length ?? 0}
                  </span>
                </td>
                <td>
                  <Link
                    className="btn secondary"
                    href={`/events/edit/${event.id}`}
                  >
                    <Pencil size={15} /> Upload media
                  </Link>
                </td>
              </tr>
            ))}
            {!events.length && (
              <tr>
                <td colSpan={5}>
                  No completed events yet. Events move here automatically once
                  their end date has passed.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
