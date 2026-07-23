import Link from "next/link";
import "./globals.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="admin-shell">
          <aside className="admin-sidebar">
            <h2>Events Admin</h2>
            <Link href="/">Dashboard</Link>
            <Link href="/events">Events</Link>
            <Link href="/events/add">Add Event</Link>
            <Link href="/past-events">Past Events</Link>
            <Link href="/event-bookings">Bookings</Link>
          </aside>
          <main className="admin-main">{children}</main>
        </div>
      </body>
    </html>
  );
}
