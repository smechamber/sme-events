"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import EventRegistrationForm from "./EventRegistrationForm";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const GST_RATE = 0.18;

const addGst = (amount: number) =>
  Math.round(amount * (1 + GST_RATE) * 100) / 100;

export type EventTicket = {
  id: string;
  name: string;
  type: "PAID" | "FREE";
  audience: "ALL" | "MEMBER" | "GUEST";
  price: number;
  originalPrice?: number;
  currency: string;
  description?: string;
  features?: string[];
  requiresApproval: boolean;
  remaining: number;
};

export default function EventBookingSection({ event }: { event: any }) {
  const [tickets, setTickets] = useState<EventTicket[]>([]);
  const [selected, setSelected] = useState<EventTicket | null>(null);
  
  const [showForm, setShowForm] = useState(false);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [error, setError] = useState("");

  const bookingClosed = Boolean(
    event.bookingClosesAt && new Date(event.bookingClosesAt) <= new Date()
  );

  useEffect(() => {
    setTicketsLoading(true);
    setError("");

    fetch(`${API_URL}/events/${event.id}/pricing`, { cache: "no-store" })
      .then(async (r) => {
        const x = await r.json();
        if (!r.ok) throw Error(x.error);
        return x.data;
      })
      .then(setTickets)
      .catch((e) => setError(e.message || "Unable to load tickets"))
      .finally(() => setTicketsLoading(false));
  }, [event.id]);

  const unavailable = (ticket: EventTicket) => bookingClosed || ticket.remaining < 1;

  const proceed = (targetTicket: EventTicket) => {
    setSelected(targetTicket);
    setShowForm(true); // Form khulega
  };

  // ==========================================
  // REGISTRATION FORM RENDER
  // ==========================================
  if (showForm && selected && !bookingClosed) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto md:px-8 lg:px-16 xl:px-24 scroll-mt-24" id="booking-form">
        <button
          onClick={() => setShowForm(false)}
          className="text-sm font-bold text-[#008DD2] hover:text-[#007ab8] transition-colors inline-flex items-center gap-1"
        >
          ← Back to ticket selection
        </button>
        <EventRegistrationForm
          eventId={event.id}
          eventName={event.name}
          ticket={selected}
        />
      </div>
    );
  }

  // ==========================================
  // SKELETON LOADER
  // ==========================================
  const TicketSkeleton = () => (
    <div className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-sm animate-pulse">
      <div className="flex flex-col items-center text-center w-full mb-5">
        <div className="h-6 w-32 rounded-full bg-slate-200 mb-5" />
        <div className="h-10 w-24 rounded-full bg-slate-200 mb-2" />
        <div className="h-4 w-40 rounded-full bg-slate-100 mt-2" />
      </div>
      <div className="space-y-2.5 mb-4">
        <div className="h-3 w-full rounded-full bg-slate-100" />
        <div className="h-3 w-11/12 rounded-full bg-slate-100" />
      </div>
      <div className="rounded-[20px] bg-slate-50 border border-slate-100 px-5 py-3 space-y-3">
        <div className="flex justify-between items-center">
          <div className="h-3 w-16 rounded-full bg-slate-200" />
          <div className="h-3 w-20 rounded-full bg-slate-200" />
        </div>
        <div className="border-t border-slate-200 my-2" />
        <div className="flex justify-between items-center">
          <div className="h-4 w-16 rounded-full bg-slate-200" />
          <div className="h-4 w-20 rounded-full bg-slate-200" />
        </div>
      </div>
      <div className="mt-5 flex justify-center">
        <div className="h-11 w-full max-w-sm rounded-[10px] bg-slate-200" />
      </div>
    </div>
  );

  return (
    <div className="w-full relative">
      {ticketsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
          <TicketSkeleton />
          <TicketSkeleton />
          <TicketSkeleton />
        </div>
      ) : error && tickets.length === 0 ? (
        <div className="bg-red-50 border border-red-200 p-6 rounded-xl text-center text-red-600 font-medium">
          {error}
        </div>
      ) : tickets.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 p-8 rounded-xl text-center text-slate-500 font-medium">
          No tickets are currently available for this event.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
          {tickets.map((ticket) => {
            const disabled = unavailable(ticket);
            const isSelected = selected?.id === ticket.id;

            const tAmount = ticket.type === "FREE" ? 0 : ticket.price || 0;
            const tPayableAmount = ticket.type === "FREE" ? 0 : addGst(tAmount);

            return (
              <div
                key={ticket.id}
                onClick={() => {
                  if (!disabled) {
                    setSelected(ticket);
                    setError("");
                  }
                }}
                className={`bg-white rounded-[24px] border p-6 flex flex-col transition-all duration-300 ${
                  isSelected
                    ? "border-[#008DD2] ring-4 ring-blue-50 shadow-lg scale-[1.02]"
                    : "border-slate-200 hover:border-slate-300 hover:shadow-md cursor-pointer"
                } ${disabled ? "opacity-60 bg-slate-50 cursor-not-allowed saturate-50" : ""}`}
              >
                {/* ── TOP SECTION ──────────────── */}
                <div className="flex flex-col items-center text-center w-full mb-5">
                  <h3 className="font-bold text-xl text-[#0b1c2e] relative inline-block pb-2 mb-4">
                    {ticket.name}
                    <span className="absolute bottom-0 left-[10%] right-[10%] h-[2px] bg-[#008DD2] rounded-full"></span>
                  </h3>

                  <div className="flex flex-col items-center justify-center mb-2">
                    {ticket.originalPrice && ticket.originalPrice > tAmount ? (
                      <span className="text-sm font-semibold text-slate-400 line-through decoration-slate-400 mb-0.5">
                        ₹{ticket.originalPrice.toLocaleString("en-IN")}
                      </span>
                    ) : null}

                    <div className="font-extrabold text-[#008DD2] text-3xl leading-none tracking-tight">
                      {ticket.type === "FREE" ? "FREE" : `₹${ticket.price.toLocaleString("en-IN")}`}
                    </div>
                  </div>

                  {ticket.description && (
                    <p className="text-xs text-slate-500 font-medium mt-2 max-w-[90%] mx-auto leading-relaxed">
                      {ticket.description}
                    </p>
                  )}
                </div>

                {/* ── FEATURES SECTION ──────────────── */}
                {ticket.features && ticket.features.length > 0 && (
                  <div className="w-full space-y-2 mb-5 px-2">
                    {ticket.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-sm text-slate-600 text-left font-medium">
                        <CheckCircle2 size={16} className="text-[#008DD2] shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── STATUS & PRICE ──────────────── */}
                <div className="mt-auto flex flex-col gap-4 w-full">
                  {bookingClosed ? (
                    <div className="text-center text-xs font-bold text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">
                      Booking Closed
                    </div>
                  ) : disabled && ticket.remaining < 1 ? (
                    <div className="text-center text-xs font-bold text-slate-500 bg-slate-100 p-3 rounded-xl">
                      Sold Out
                    </div>
                  ) : null}

                  <div className="rounded-[16px] bg-[#f8f9fa] border border-slate-100 p-4">
                    <div className="space-y-2 text-xs font-medium text-slate-600">
                      <div className="flex justify-between items-center">
                        <span>Subtotal</span>
                        <span className="font-bold text-slate-700">
                          {tAmount === 0 ? "FREE" : `₹${tAmount.toLocaleString("en-IN")}`}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>
                          GST (18%) <span className="text-[10px] text-slate-400 font-normal">govt. fees</span>
                        </span>
                        <span className="font-bold text-rose-500">
                          +{tPayableAmount > tAmount ? `₹${(tPayableAmount - tAmount).toLocaleString("en-IN")}` : "₹0"}
                        </span>
                      </div>
                    </div>
                    <div className="border-t border-slate-200 my-2.5"></div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm text-[#0b1c2e]">Total Payable</span>
                      <span className="font-extrabold text-sm text-[#0b1c2e]">
                        {tPayableAmount === 0 ? "FREE" : `₹${tPayableAmount.toLocaleString("en-IN")}`}
                      </span>
                    </div>
                  </div>

                  {/* ── ACTION BUTTON ──────────────── */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isSelected) setSelected(ticket);
                      else proceed(ticket);
                    }}
                    disabled={disabled}
                    className={`w-full py-3 font-bold text-sm rounded-[10px] transition-all shadow-sm ${
                      isSelected 
                        ? "bg-[#008DD2] hover:bg-[#007ab8] text-white active:scale-[0.98]" 
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    } disabled:opacity-50 disabled:active:scale-100`}
                  >
                    {!isSelected 
                      ? "Select Ticket" 
                      : bookingClosed
                      ? "Booking Closed"
                      : "Fill Details & Pay"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}