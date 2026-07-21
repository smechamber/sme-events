"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { EventBooking } from "@events/types";

type Booking = EventBooking & {
  event?: { name: string };
  ticket?: { name: string; requiresApproval?: boolean };
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002/api";

const label = (key: string) =>
  key.replace(/([A-Z])/g, " $1").replace(/^./, (value) => value.toUpperCase());

const getPaymentStatus = (booking: Booking) => {
  if (booking.paymentId || booking.status === "PAID") return "COMPLETED";
  if (booking.status === "PENDING_APPROVAL") return "NOT REQUIRED";
  return "PENDING";
};

const paymentBadgeClass = (status: string) =>
  status === "COMPLETED"
    ? "bg-emerald-100 text-emerald-800"
    : status === "PENDING"
      ? "bg-amber-100 text-amber-800"
      : "bg-slate-100 text-slate-700";

export function BookingManagement({ bookings }: { bookings: Booking[] }) {
  const router = useRouter();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState("");

  const byEvent = bookings.reduce<Record<string, Booking[]>>((groups, booking) => {
    const key = String(booking.eventId);
    (groups[key] ??= []).push(booking);
    return groups;
  }, {});
  const events = Object.entries(byEvent);
  const activeEventId = selectedEventId ?? events[0]?.[0] ?? null;
  const activeBookings = activeEventId ? byEvent[activeEventId] ?? [] : [];
  const activeEventName = activeBookings[0]?.event?.name ?? (activeEventId ? `Event #${activeEventId}` : "");

  const decide = async (id: string, action: "APPROVE" | "REJECT") => {
    setUpdating(id);
    setError("");
    try {
      const response = await fetch(`${apiBaseUrl}/admin/event-bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Could not update booking");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not update booking");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-8">
      {error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p>}
      {events.length > 0 && <>
        <section>
          <h2 className="mb-4 text-lg font-bold text-slate-900">Events</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {events.map(([eventId, eventBookings]) => {
              const eventName = eventBookings[0]?.event?.name ?? `Event #${eventId}`;
              const pendingCount = eventBookings.filter((booking) => booking.status === "PENDING_APPROVAL").length;
              const selected = activeEventId === eventId;
              return <article key={eventId} className={`rounded-xl border p-5 shadow-sm ${selected ? "border-blue-500 bg-blue-50/40" : "border-slate-200 bg-white"}`}>
                <h3 className="text-lg font-bold text-slate-900">{eventName}</h3>
                <p className="mt-1 text-sm text-slate-500">{eventBookings.length} booking{eventBookings.length === 1 ? "" : "s"}</p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="text-xs font-bold text-amber-700">{pendingCount} pending approval</span>
                  <button onClick={() => setSelectedEventId(eventId)} className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white">View Bookings</button>
                </div>
              </article>;
            })}
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Booking management</p>
              <h2 className="text-lg font-bold text-slate-900">{activeEventName}</h2>
            </div>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">{activeBookings.filter((booking) => booking.status === "PENDING_APPROVAL").length} pending approval</span>
          </div>
          <div className="hidden border-b border-slate-100 bg-white px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 lg:grid lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_120px_140px_180px] lg:gap-4">
            <span>Attendee</span>
            <span>Ticket</span>
            <span>Booking</span>
            <span>Payment</span>
            <span>Actions</span>
          </div>
          <div className="divide-y divide-slate-100">
            {activeBookings.map((booking) => {
              const isOpen = expanded === booking.id;
              const pending = booking.status === "PENDING_APPROVAL";
              const paymentStatus = getPaymentStatus(booking);
              return (
                <article key={booking.id} className="p-5">
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_120px_140px_180px] lg:items-center lg:gap-4">
                    <div>
                      <p className="font-bold text-slate-900">{booking.attendeeName}</p>
                      <p className="text-sm text-slate-600">{booking.email} · {booking.phone || "No phone"}</p>
                    </div>
                    <div className="text-sm text-slate-500">
                      <p className="font-medium text-slate-900">{booking.ticket?.name ?? "Ticket"}</p>
                      <p>{booking.quantity} seat(s) · ₹{booking.amount}</p>
                    </div>
                    <div>
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${pending ? "bg-amber-100 text-amber-800" : booking.status === "APPROVED" || booking.status === "PAID" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>{booking.status.replaceAll("_", " ")}</span>
                    </div>
                    <div>
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${paymentBadgeClass(paymentStatus)}`}>{paymentStatus}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button onClick={() => setExpanded(isOpen ? null : booking.id)} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700">{isOpen ? "Hide details" : "View form"}</button>
                      {pending && <>
                        <button disabled={updating === booking.id} onClick={() => decide(booking.id, "APPROVE")} className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60">Approve</button>
                        <button disabled={updating === booking.id} onClick={() => decide(booking.id, "REJECT")} className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60">Reject</button>
                      </>}
                    </div>
                  </div>
                  {isOpen && <div className="mt-5 grid grid-cols-1 gap-3 rounded-lg bg-slate-50 p-4 text-sm sm:grid-cols-2">
                    <p><b>Booked:</b> {new Date(booking.createdAt).toLocaleString()}</p>
                    <p><b>Payment ID:</b> {booking.paymentId ?? "Awaiting payment"}</p>
                    {Object.entries(booking.registrationData ?? {}).map(([key, value]) => <p key={key}><b>{label(key)}:</b> {typeof value === "boolean" ? (value ? "Yes" : "No") : String(value || "—")}</p>)}
                  </div>}
                </article>
              );
            })}
          </div>
        </section>
      </>}
      {!bookings.length && <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">No bookings yet.</div>}
    </div>
  );
}
