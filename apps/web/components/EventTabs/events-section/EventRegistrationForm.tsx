"use client";

import { useState } from "react";
import { bookEvent } from "../../../lib/event-payment";
import type { EventTicket } from "./EventBookingSection";
import { CheckCircle2 } from "lucide-react";

// --- Custom Animated Input Component ---
function FieldInput({ label, value, onChange, type = "text", name, required, error }: any) {
  return (
    <div className="flex flex-col w-full">
      <div className="relative w-full">
        <input
          type={type}
          name={name}
          required={required}
          value={value}
          onChange={onChange}
          placeholder=" "
          className={`peer w-full rounded-lg border bg-white px-4 py-3.5 text-sm outline-none transition-all focus:border-[#008DD2] focus:ring-1 focus:ring-[#008DD2] shadow-sm ${
            error ? "border-red-400" : "border-slate-300"
          }`}
        />
        <label
          className="
            pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 bg-white px-1
            text-sm font-medium text-slate-500 transition-all duration-200
            peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-[#008DD2] peer-focus:translate-y-0
            peer-[&:not(:placeholder-shown)]:-top-2.5 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:translate-y-0
          "
        >
          {label}
        </label>
      </div>
      {error && <p className="mt-1 text-xs font-semibold text-red-500 pl-1">{error}</p>}
    </div>
  );
}

// --- Custom Animated Select Component ---
function SelectInput({ label, value, onChange, name, required, options }: any) {
  return (
    <div className="flex flex-col w-full">
      <div className="relative w-full">
        <select
          name={name}
          required={required}
          value={value}
          onChange={onChange}
          className={`peer w-full appearance-none rounded-lg border bg-white px-4 py-3.5 text-sm outline-none transition-all focus:border-[#008DD2] focus:ring-1 focus:ring-[#008DD2] shadow-sm border-slate-300 ${
            value === "" ? "text-transparent" : "text-black"
          }`}
        >
          <option value="" disabled className="text-gray-500">Select option</option>
          {options.map((v: string) => (
            <option key={v} value={v} className="text-black">{v}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs">▼</div>
        <label
          className={`
            pointer-events-none absolute left-3 bg-white px-1 font-medium transition-all duration-200
            ${
              value !== ""
                ? "-top-2.5 text-xs text-slate-500 translate-y-0"
                : "top-1/2 text-sm text-slate-500 -translate-y-1/2 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-[#008DD2] peer-focus:translate-y-0"
            }
          `}
        >
          {label}
        </label>
      </div>
    </div>
  );
}

const GST_RATE = 0.18;
const addGst = (amount: number) => Math.round(amount * (1 + GST_RATE) * 100) / 100;

const initial = {
  companyName: "", firstName: "", lastName: "", designation: "",
  email: "", website: "", mobileNo: "", city: "",
  companyType: "", turnover: "", source: "", consent: false,
};

export default function EventRegistrationForm({ eventId, eventName, ticket }: { eventId: number | string; eventName: string; ticket: EventTicket; }) {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const change = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((x) => ({
      ...x,
      [name]: (type === "checkbox" && (e.target as HTMLInputElement).checked) || (type !== "checkbox" && value),
    }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // YEH FUNCTION RAZORPAY KHOLTA HAI !
      await bookEvent(
        {
          eventId,
          ticketId: ticket.id,
          attendeeName: `${form.firstName} ${form.lastName}`.trim(),
          attendeeEmail: form.email,
          attendeePhone: form.mobileNo,
          companyName: form.companyName,
          designation: form.designation,
          registrationData: {
            firstName: form.firstName,
            lastName: form.lastName,
            website: form.website,
            city: form.city,
            companyType: form.companyType,
            turnover: form.turnover,
            source: form.source,
            consent: form.consent,
          },
        },
        eventName
      );
      
      // Yahan code tabhi aayega jab PAYMENT SUCCESS ho jayegi
      setSuccess(true);
    } catch (e) {
      // Agar user payment modal close kar dega toh error me aayega
      setError(e instanceof Error ? e.message : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 p-10 rounded-2xl text-center shadow-sm animate-in fade-in zoom-in-95 duration-300 flex flex-col items-center">
        <CheckCircle2 size={64} className="text-emerald-500 mb-4" />
        <h3 className="text-2xl sm:text-3xl font-bold text-emerald-900 mb-2">
          {ticket.requiresApproval ? "Request Submitted!" : "Registration Confirmed!"}
        </h3>
        <p className="text-emerald-700 font-medium">
          {ticket.requiresApproval
            ? "Your details have been received. You will be notified once the admin approves your request."
            : "Your payment is successful and your ticket has been confirmed. See you there!"}
        </p>
      </div>
    );
  }

  const payableAmount = ticket.type === "FREE" ? 0 : addGst(ticket.price);

  return (
    <div className="bg-white p-6 md:p-10 rounded-2xl border border-slate-200 shadow-lg shadow-slate-100 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="border-b border-slate-100 pb-5 mb-8">
        <h3 className="text-2xl sm:text-3xl font-bold text-[#0b1c2e]">Attendee Details</h3>
        <p className="text-slate-500 mt-2 text-sm font-medium">
          You have selected the <strong className="text-slate-800">{ticket.name}</strong> ticket. 
          {ticket.type === "FREE"
            ? " Complete the form to confirm your free registration."
            : <span> Proceed to pay <strong className="text-[#008DD2]">₹{payableAmount.toLocaleString("en-IN")}</strong> to secure your spot.</span>}
        </p>
      </div>
      
      <form onSubmit={submit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
          <FieldInput label="First Name *" name="firstName" required value={form.firstName} onChange={change} />
          <FieldInput label="Last Name *" name="lastName" required value={form.lastName} onChange={change} />
          <FieldInput label="Email Address *" type="email" name="email" required value={form.email} onChange={change} />
          <FieldInput label="Mobile No *" type="tel" name="mobileNo" required value={form.mobileNo} onChange={change} />
          <FieldInput label="Company Name *" name="companyName" required value={form.companyName} onChange={change} />
          <FieldInput label="Designation *" name="designation" required value={form.designation} onChange={change} />
          <FieldInput label="Website (Optional)" type="url" name="website" value={form.website} onChange={change} />
          <FieldInput label="City *" name="city" required value={form.city} onChange={change} />
          <SelectInput
            label="Type of Company *" name="companyType" required value={form.companyType} onChange={change}
            options={["Manufacturing", "Exporters", "Importers", "Service Sector", "Consultant", "Other"]}
          />
          <FieldInput label="Turnover for 2025-26 *" name="turnover" required value={form.turnover} onChange={change} />
        </div>

        <fieldset className="bg-slate-50 border border-slate-200 p-5 rounded-xl">
          <legend className="text-sm font-bold text-slate-700 mb-3 px-1">How did you hear about this event? *</legend>
          <div className="flex flex-wrap gap-4 px-1">
            {["Email", "WhatsApp", "Website", "Facebook", "LinkedIn", "Other"].map((v) => (
              <label key={v} className="flex items-center gap-2 text-sm font-medium cursor-pointer text-slate-700 hover:text-[#008DD2] transition-colors">
                <input type="radio" name="source" required value={v} checked={form.source === v} onChange={change} className="w-4 h-4 text-[#008DD2]" />
                {v}
              </label>
            ))}
          </div>
        </fieldset>

        {error && (
          <p className="p-4 bg-red-50 text-red-700 rounded-xl text-sm font-bold border border-red-100 text-center animate-in fade-in">
            ⚠️ {error}
          </p>
        )}

        <div className="flex flex-col items-end border-t border-slate-100 pt-6">
          <button
            disabled={loading}
            className="w-full sm:w-auto px-12 py-4 bg-[#008DD2] hover:bg-[#007ab8] text-white font-bold rounded-xl disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-md active:scale-[0.98] flex items-center justify-center"
          >
            {loading
              ? "Opening Payment Gateway..."
              : ticket.requiresApproval
              ? "Submit Request"
              : ticket.type === "FREE"
              ? "Confirm Free Registration"
              : `Pay ₹${payableAmount.toLocaleString("en-IN")}`}
          </button>
        </div>
      </form>
    </div>
  );
}