import { listBookings } from "../../lib/api";
import { BookingManagement } from "../../components/BookingManagement";

export const dynamic = "force-dynamic";

export default async function EventBookingsPage() {
  const bookings = await listBookings();

  return (
    <>
      <div className="admin-header">
        <div>
          <p style={{ textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 800 }}>Bookings</p>
          <h1>Event Bookings</h1>
        </div>
      </div>

      <BookingManagement bookings={bookings} />
    </>
  );
}
