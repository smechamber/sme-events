import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { listAdminEvents } from "../../lib/api";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const events = await listAdminEvents();

  return (
    <>
      <div className="admin-header">
        <div>
          <p style={{ textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 800 }}>Events</p>
          <h1>Manage Events</h1>
        </div>
        <Link className="btn" href="/events/add">
          <Plus size={16} aria-hidden /> Add Event
        </Link>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Date</th>
              <th>Location</th>
              <th>Tickets</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td>{event.name}</td>
                <td>{event.status}</td>
                <td>{event.startDate ? new Date(event.startDate).toLocaleDateString("en-IN") : "—"}</td>
                <td>{event.location}</td>
                <td>{event.tickets.length}</td>
                <td>
                  <Link className="btn secondary" href={`/events/edit/${event.id}`}>
                    <Pencil size={15} aria-hidden /> Edit
                  </Link>
                </td>
              </tr>
            ))}
            {!events.length ? (
              <tr>
                <td colSpan={6}>No events found. API/database connect karke first event add karo.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </>
  );
}
