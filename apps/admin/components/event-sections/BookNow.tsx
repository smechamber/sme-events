"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import type { TicketTier } from "@events/types"; // Ensure this path is correct for your project

type Ticket = {
  id?: string;
  type: "PAID" | "FREE";
  audience: "ALL" | "MEMBER" | "GUEST";
  name: string;
  quantity: number;
  price: number;
  originalPrice?: number; 
  currency: "INR";
  description: string;
  features: string[];
  groupName: string;
  requiresApproval: boolean;
};

const emptyTicket: Ticket = {
  type: "PAID",
  audience: "ALL",
  name: "",
  quantity: 1,
  price: 0,
  originalPrice: undefined,
  currency: "INR",
  description: "",
  features: [],
  groupName: "",
  requiresApproval: false,
};

const currentLocalDateTime = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
};

export default function BookNow({
  data,
  onChange,
  tickets,
  onTicketsChange,
}: {
  data: any;
  onChange: (value: any) => void;
  tickets: any[]; // Using any[] here to support the new advanced ticket fields without TS errors
  onTicketsChange: (value: any[]) => void;
}) {
  // Safe default mapping (supporting both legacy 'instructions' and new 'bookingClosesAt')
  const current = data ?? { enabled: true, instructions: "", bookingClosesAt: "" };
  
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState<Ticket>(emptyTicket);
  const [newFeature, setNewFeature] = useState("");

  // --- Modal Handlers ---
  const openNew = () => {
    setDraft({ ...emptyTicket });
    setNewFeature("");
    setEditing(-1);
  };
  
  const openEdit = (index: number) => {
    setDraft({ ...tickets[index], features: tickets[index].features || [] });
    setNewFeature("");
    setEditing(index);
  };
  
  const close = () => {
    setEditing(null);
    setNewFeature("");
  };

  const save = () => {
    if (
      !draft.name.trim() ||
      draft.quantity < 1 ||
      (draft.type === "PAID" && draft.price < 1)
    )
      return;
    
    const next = [...tickets];
    const clean = {
      ...draft,
      name: draft.name.trim(),
      price: draft.type === "PAID" ? Number(draft.price) : 0,
      originalPrice: draft.originalPrice ? Number(draft.originalPrice) : undefined, 
      features: draft.features || [],
    };
    
    if (editing === -1) next.push(clean);
    else next[editing!] = clean;
    
    onTicketsChange(next);
    close();
  };

  // --- Feature Bullet Points Handlers ---
  const addFeature = () => {
    if (!newFeature.trim()) return;
    setDraft({ ...draft, features: [...(draft.features || []), newFeature.trim()] });
    setNewFeature("");
  };

  const removeFeature = (index: number) => {
    const updatedFeatures = [...(draft.features || [])];
    updatedFeatures.splice(index, 1);
    setDraft({ ...draft, features: updatedFeatures });
  };

  return (
    <div className="p-4 sm:p-6 border border-rose-200 bg-rose-50/40 rounded-xl space-y-6 shadow-sm">
      
      {/* Header & Main Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-rose-200 pb-4 gap-4">
        <div>
          <h3 className="text-xl font-bold text-rose-800">Booking & Ticketing</h3>
          <p className="text-sm text-gray-500 mt-1">
            Create multiple tickets, set pricing, and manage booking rules.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center justify-start lg:justify-end gap-4">
          
          {/* Legacy Enable/Disable Toggle */}
          <label className="flex items-center gap-2 text-sm font-semibold text-rose-800 cursor-pointer bg-white px-3 py-2 rounded-lg border border-rose-100 shadow-sm">
            <input
              type="checkbox"
              checked={current.enabled ?? true}
              onChange={(e) => onChange({ ...current, enabled: e.target.checked })}
              className="h-4 w-4 accent-rose-700"
            />
            Enable Booking
          </label>

          <button
            type="button"
            onClick={openNew}
            className="flex items-center gap-2 rounded-lg bg-rose-700 hover:bg-rose-800 transition-colors px-4 py-2 text-sm font-bold text-white shadow-sm"
          >
            <Plus size={17} /> Add Ticket
          </button>
        </div>
      </div>

      {/* Advanced Booking Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-white p-4 rounded-xl border border-rose-100 shadow-sm">
        
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-rose-800 cursor-pointer mb-3">
            <input
              type="checkbox"
              checked={Boolean(current.bookingClosesAt)}
              onChange={(e) => onChange({ ...current, bookingClosesAt: e.target.checked ? currentLocalDateTime() : "" })}
              className="h-4 w-4 accent-rose-700"
            />
            Close booking at a specific date & time
          </label>
          
          {current.bookingClosesAt && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <input
                type="datetime-local"
                value={current.bookingClosesAt}
                onChange={(e) => onChange({ ...current, bookingClosesAt: e.target.value })}
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm outline-none focus:border-rose-500 shadow-sm"
                required
              />
              <p className="mt-1.5 text-xs text-slate-500 font-medium">At this exact time, tickets will display as 'Booking Closed'.</p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold text-rose-800 mb-2">Booking Instructions</label>
          <textarea
            value={current.instructions || ""}
            onChange={(e) => onChange({ ...current, instructions: e.target.value })}
            placeholder="Add any specific instructions, pass benefits, or terms..."
            className="w-full h-24 border border-slate-200 focus:border-rose-500 outline-none rounded-lg p-3 text-sm shadow-sm transition-all"
          />
        </div>
      </div>
      
      {/* Tickets List */}
      {tickets.length === 0 ? (
        <div className="py-12 text-center border-2 border-dashed border-rose-200 bg-white/50 rounded-xl text-gray-400 font-medium">
          No tickets added yet. Click 'Add Ticket' to create one.
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket, index) => (
            <div
              key={ticket.id || index}
              className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between gap-4 shadow-sm hover:border-rose-300 transition-colors"
            >
              <div>
                <div className="flex flex-wrap gap-2 items-center mb-1.5">
                  <b className="text-lg text-gray-900">{ticket.name}</b>
                  <Badge>{ticket.type}</Badge>
                  <Badge>{ticket.audience}</Badge>
                  {ticket.requiresApproval && <Badge>APPROVAL</Badge>}
                </div>
                <p className="text-sm text-gray-600 flex items-center gap-2 font-medium">
                  {ticket.type === "FREE" ? (
                    <span className="text-emerald-600">Free</span>
                  ) : (
                    <>
                      {ticket.originalPrice && ticket.originalPrice > ticket.price && (
                        <span className="line-through text-gray-400 text-xs">
                          ₹{ticket.originalPrice.toLocaleString("en-IN")}
                        </span>
                      )}
                      <span className="text-gray-900">₹{ticket.price.toLocaleString("en-IN")}</span>
                    </>
                  )}
                  <span className="text-gray-300">|</span>
                  <span>{ticket.quantity} ticket(s) total</span>
                </p>
                {ticket.description && (
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2 max-w-2xl">{ticket.description}</p>
                )}
              </div>

              <div className="flex gap-2 items-start shrink-0">
                <button
                  type="button"
                  onClick={() => openEdit(index)}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit Ticket"
                >
                  <Pencil size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => onTicketsChange(tickets.filter((_, i) => i !== index))}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Ticket"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================== */}
      {/* TICKET CREATION MODAL (SLIDE OVER / POPUP) */}
      {/* ========================================== */}
      {editing !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex justify-end transition-all"
          onMouseDown={close}
        >
          <div
            className="bg-white h-full w-full max-w-xl overflow-y-auto shadow-2xl animate-in slide-in-from-right-8 duration-300"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 bg-white border-b border-slate-100 p-6 flex justify-between items-center shadow-sm">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {editing === -1 ? "Create New Ticket" : "Edit Ticket"}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Configure pricing, rules, and benefits.</p>
              </div>
              <button 
                aria-label="Close" 
                type="button" 
                onClick={close}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <Field label="Ticket Type *">
                <div className="grid grid-cols-2 gap-3">
                  {(["PAID", "FREE"] as const).map((type) => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setDraft({ ...draft, type })}
                      className={`p-3 border rounded-xl text-sm font-bold transition-all ${
                        draft.type === type 
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm" 
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {type === "PAID" ? "Paid Ticket" : "Free Ticket"}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Ticket Name *">
                <input
                  maxLength={60}
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  placeholder="e.g. VIP Pass, Early Bird, General Admission..."
                  className="input"
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Field label="Available For *">
                  <select
                    value={draft.audience}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        audience: e.target.value as Ticket["audience"],
                      })
                    }
                    className="input bg-white cursor-pointer"
                  >
                    <option value="ALL">Everyone (Public)</option>
                    <option value="MEMBER">Members Only</option>
                    <option value="GUEST">Guests Only</option>
                  </select>
                </Field>

                <Field label="Total Quantity *">
                  <input
                    type="number"
                    min={1}
                    value={draft.quantity}
                    onChange={(e) =>
                      setDraft({ ...draft, quantity: Number(e.target.value) })
                    }
                    className="input"
                  />
                </Field>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                {draft.type === "PAID" ? (
                  <Field label="Selling Price *">
                    <div className="flex border border-slate-300 rounded-lg overflow-hidden focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all bg-white shadow-sm">
                      <span className="p-2.5 px-3 border-r border-slate-200 bg-slate-50 text-slate-500 font-medium text-sm flex items-center">INR (₹)</span>
                      <input
                        type="number"
                        min={1}
                        value={draft.price || ""}
                        onChange={(e) =>
                          setDraft({ ...draft, price: Number(e.target.value) })
                        }
                        className="p-2.5 flex-1 outline-none w-full text-sm font-semibold"
                        placeholder="e.g. 999"
                      />
                    </div>
                  </Field>
                ) : (
                  <Field label="Selling Price *">
                    <div className="flex border border-slate-200 rounded-lg overflow-hidden bg-slate-100 shadow-sm opacity-70">
                      <span className="p-2.5 px-3 border-r border-slate-200 bg-slate-100 text-slate-500 font-medium text-sm flex items-center">INR (₹)</span>
                      <input value="FREE" disabled className="p-2.5 flex-1 outline-none w-full text-sm font-bold text-emerald-600 bg-slate-100" />
                    </div>
                  </Field>
                )}

                <Field label="Strike-through Price (Optional)">
                  <div className="flex border border-slate-300 rounded-lg overflow-hidden focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all bg-white shadow-sm">
                    <span className="p-2.5 px-3 border-r border-slate-200 bg-slate-50 text-slate-500 font-medium text-sm flex items-center">INR (₹)</span>
                    <input
                      type="number"
                      min={1}
                      value={draft.originalPrice || ""}
                      onChange={(e) =>
                        setDraft({ ...draft, originalPrice: Number(e.target.value) })
                      }
                      placeholder="e.g. 1500"
                      className="p-2.5 flex-1 outline-none w-full text-sm"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 leading-tight">Shows a fake higher price slashed out to indicate a discount.</p>
                </Field>
              </div>
              
              <Field label="Short Description (Optional)">
                <textarea
                  maxLength={250}
                  value={draft.description || "" }
                  onChange={(e) =>
                    setDraft({ ...draft, description: e.target.value })
                  }
                  className="input h-20 resize-y"
                  placeholder="Briefly describe who this ticket is for..."
                />
              </Field>

              <Field label="Ticket Benefits (Bullet Points)">
                <div className="space-y-3">
                  {(draft.features || []).map((feature, i) => (
                    <div key={i} className="flex items-center justify-between bg-slate-50 border border-slate-200 p-2.5 rounded-lg shadow-sm group">
                      <span className="text-sm text-slate-700 font-medium flex items-center gap-2">
                         <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {feature}
                      </span>
                      <button 
                        type="button" 
                        onClick={() => removeFeature(i)}
                        className="text-slate-400 p-1 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  
                  <div className="flex gap-2">
                    <input
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addFeature();
                        }
                      }}
                      className="input shadow-sm"
                      placeholder="e.g. Front row seats, Free Lunch, VIP Access..."
                    />
                    <button
                      type="button"
                      onClick={addFeature}
                      disabled={!newFeature.trim()}
                      className="bg-slate-800 text-white font-bold px-4 py-2 rounded-lg disabled:opacity-40 hover:bg-slate-700 transition-colors shadow-sm"
                    >
                      Add
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Press <kbd className="bg-slate-100 border border-slate-200 rounded px-1 text-[10px]">Enter</kbd> to add a benefit to the list.</p>
                </div>
              </Field>

              <div className="pt-2 border-t border-slate-100">
                <Toggle
                  label="Requires Admin Approval"
                  checked={draft.requiresApproval}
                  onChange={(value) =>
                    setDraft({ ...draft, requiresApproval: value })
                  }
                  help="If enabled, attendees must be approved by an admin before they get the ticket."
                />
              </div>
            </div>
            
            {/* Modal Footer Actions */}
            <div className="sticky bottom-0 bg-white border-t border-slate-200 p-5 grid grid-cols-2 gap-3 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
              <button   
                type="button"
                onClick={() => {
                  setDraft({ ...emptyTicket });
                  setNewFeature("");
                }}
                className="border border-slate-300 rounded-lg p-3 font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Reset Fields
              </button>
              <button
                type="button"
                onClick={save}
                className="rounded-lg p-3 font-bold text-white bg-rose-700 disabled:bg-rose-300 hover:bg-rose-800 transition-colors shadow-sm"
                disabled={
                  !draft.name.trim() ||
                  draft.quantity < 1 ||
                  (draft.type === "PAID" && draft.price < 1)
                }
              >
                Save Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Internal Styles for inputs */}
      <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid #cbd5e1;
          border-radius: 0.5rem;
          padding: 0.625rem 0.75rem;
          outline: none;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        .input:focus {
          border-color: #10b981;
          box-shadow: 0 0 0 1px #10b981;
        }
      `}</style>
    </div>
  );
}

// --- Helper Components ---

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">{label}</span>
      {children}
    </label>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 rounded-md px-2 py-0.5 border border-slate-200">
      {children}
    </span>
  );
}

function Toggle({
  label,
  checked,
  onChange,
  help,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  help: string;
}) {
  return (
    <div>
      <label className="flex items-center gap-3 font-bold text-slate-800 cursor-pointer w-fit">
        <button
          type="button"
          onClick={() => onChange(!checked)}
          className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 ${checked ? "bg-emerald-500" : "bg-slate-300"}`}
        >
          <span
            className={`block bg-white w-4 h-4 rounded-full transition-transform duration-300 shadow-sm ${checked ? "translate-x-5" : ""}`}
          />
        </button>
        {label}
      </label>
      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{help}</p>
    </div>
  );
}