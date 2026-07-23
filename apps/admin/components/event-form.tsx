"use client";

import { Save, Info, ImageIcon, Calendar, MapPin, DollarSign, Settings, Check, Plus, Layout, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { EventSections, TicketTier } from "@events/types";
import { saveEvent, type AdminEvent, type EventFormPayload } from "../lib/api";
import ImageUpload from "./ImageUpload";
import MultiImageUpload from "./MultiImageUpload";
import MultiVideoUpload from "./MultiVideoUpload";

// Form Components
import OverviewForm from "../components/event-sections/Overview";
import AgendaForm from "../components/event-sections/Agenda";
import SpeakersForm from "../components/event-sections/Speakers";
import SponsorsForm from "../components/event-sections/Sponsors";
import MediaKitForm from "../components/event-sections/MediaKit";
import VenueForm from "../components/event-sections/Venue";
import InfoForm from "../components/event-sections/Info";
import ContactUsForm from "../components/event-sections/ContactUs";
import BookForm from "../components/event-sections/BookNow";

const AVAILABLE_SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "mediaKit", label: "Media Kit" },
  { id: "agenda", label: "Agenda" },
  { id: "speakers", label: "Speakers" },
  { id: "sponsors", label: "Sponsors" },
  { id: "venue", label: "Venue" },
  { id: "contactUs", label: "Contact Us" },
  { id: "info", label: "Info" },
  { id: "book", label: "Book" },
] as const;

// Treat sections with existing event data as added.
function activeSectionsFrom(event?: AdminEvent | null): string[] {
  if (!event) return [];
  const active: string[] = [];
  if (event.overview && Object.keys(event.overview).length) active.push("overview");
  if (event.mediaKit && Object.keys(event.mediaKit).length) active.push("mediaKit");
  if (event.agenda && event.agenda.length) active.push("agenda");
  if (event.speakers && event.speakers.length) active.push("speakers");
  if (event.sponsors && event.sponsors.length) active.push("sponsors");
  if (event.venue && Object.keys(event.venue).length) active.push("venue");
  if (event.contactUs && Object.keys(event.contactUs).length) active.push("contactUs");
  if (event.info && (Array.isArray(event.info) ? event.info.length : Object.keys(event.info).length)) active.push("info");
  if (event.book?.enabled) active.push("book");
  return active;
}

const sectionsFrom = (event?: AdminEvent | null): EventSections => ({
  agenda: event?.agenda ?? [],
  book: event?.book ?? { enabled: true, instructions: "" },
  contactUs: event?.contactUs ?? {},
  info: event?.info ?? [],
  mediaKit: event?.mediaKit ?? {},
  overview: event?.overview ?? {},
  speakers: event?.speakers ?? [],
  sponsors: event?.sponsors ?? [],
  venue: event?.venue ?? {},
});

const date = (value?: string) =>
  value ? new Date(value).toISOString().slice(0, 10) : "";

export function EventForm({ event }: { event?: AdminEvent | null }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: event?.name ?? "",
    type: event?.type ?? "",
    startDate: date(event?.startDate),
    endDate: date(event?.endDate),
    startTime: event?.startTime ?? "",
    endTime: event?.endTime ?? "",
    location: event?.location ?? "",
    image: event?.image ?? "",
    galleryImages: event?.galleryImages ?? [],
    galleryVideos: event?.galleryVideos ?? [],
    status: event?.status ?? "DRAFT",
    guestPrice: event?.guestPrice ?? 0,
    memberPrice: event?.memberPrice ?? 0,
  });

  const [sections, setSections] = useState<EventSections>(sectionsFrom(event));
  const [tickets, setTickets] = useState<TicketTier[]>(event?.tickets ?? []);

  // Horizontal tabs state
  const [activeSections, setActiveSections] = useState<string[]>(activeSectionsFrom(event));
  const [activeTab, setActiveTab] = useState<string>(activeSectionsFrom(event)[0] || "");

  const set = (key: keyof typeof form, value: string | string[] | number) =>
    setForm((current) => ({ ...current, [key]: value }));

  const setSectionData = (sectionId: keyof EventSections, data: any) => {
    setSections((prev) => ({ ...prev, [sectionId]: data }));
  };

  const toggleSection = (sectionId: string) => {
    if (activeSections.includes(sectionId)) {
      // Logic for selecting an already active tab is handled in onClick of the button below.
      // This function is mainly used to ADD a new section now.
      const newActive = [...activeSections, sectionId];
      setActiveSections(newActive);
      setActiveTab(sectionId);
    } else {
      // Adding section
      const newActive = [...activeSections, sectionId];
      setActiveSections(newActive);
      setActiveTab(sectionId);
    }
  };

  const removeSection = (sectionId: string) => {
    const label = AVAILABLE_SECTIONS.find((s) => s.id === sectionId)?.label || "Section";
    if (!window.confirm(`Are you sure you want to delete the ${label} section?`)) return;

    const newActive = activeSections.filter((id) => id !== sectionId);
    setActiveSections(newActive);

    // Clear data so it saves as empty
    setSections((prev) => ({
      ...prev,
      [sectionId]: Array.isArray((prev as any)[sectionId]) ? [] : {},
    }));

    if (activeTab === sectionId) setActiveTab(newActive[0] || "");
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    // Only send data for active sections
    const cleanedSections: EventSections = {
      overview: activeSections.includes("overview") ? sections.overview : {},
      mediaKit: activeSections.includes("mediaKit") ? sections.mediaKit : {},
      agenda: activeSections.includes("agenda") ? sections.agenda : [],
      speakers: activeSections.includes("speakers") ? sections.speakers : [],
      sponsors: activeSections.includes("sponsors") ? sections.sponsors : [],
      venue: activeSections.includes("venue") ? sections.venue : {},
      contactUs: activeSections.includes("contactUs") ? sections.contactUs : {},
      info: activeSections.includes("info") ? sections.info : [],
      book: activeSections.includes("book")
        ? { ...sections.book, enabled: true }
        : { ...sections.book, enabled: false },
    };

    const payload: EventFormPayload = {
      ...form,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
      startTime: form.startTime || undefined,
      endTime: form.endTime || undefined,
      ...cleanedSections,
      tickets: activeSections.includes("book") ? tickets : [],
    };

    try {
      await saveEvent(payload, event?.id?.toString());
      router.push("/events");
      router.refresh();
    } catch {
      setError("Event save nahi hua. Check required fields or try again.");
      setSaving(false);
    }
  }

  const inputClass = "w-full border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md px-3 py-2 text-sm outline-none transition-all bg-white shadow-sm";

  return (
    <form className="relative max-w-[1400px] mx-auto pb-32" onSubmit={submit}>
      {error && (
        <div className="mb-6 bg-red-50 text-red-600 border border-red-200 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm">
          <Info size={18} /> {error}
        </div>
      )}

      <div className="space-y-8">
        
        {/* 1. EVENT SETUP */}
        <section className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-slate-200">
          <div className="border-b border-slate-100 pb-4 mb-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Settings className="text-blue-600" size={22} /> Event Setup
            </h2>
            <p className="text-sm text-slate-500 mt-1">Configure the core details of your event.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Event Name *</label>
              <input required value={form.name} onChange={(e) => set("name", e.target.value)} className={inputClass} placeholder="e.g. Annual Tech Conference 2026" />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Event Type *</label>
              <input required value={form.type} onChange={(e) => set("type", e.target.value)} className={inputClass} placeholder="e.g. Conference, Webinar, Meetup" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1"><Calendar size={14} /> Start Date</label>
              <input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} className={inputClass} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1"><Calendar size={14} /> End Date</label>
              <input type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} className={inputClass} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Status *</label>
              <select required value={form.status} onChange={(e) => set("status", e.target.value)} className={inputClass}>
                <option value="DRAFT">DRAFT</option>
                <option value="PUBLISHED">PUBLISHED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Start Time</label>
              <input type="time" value={form.startTime} onChange={(e) => set("startTime", e.target.value)} className={inputClass} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">End Time</label>
              <input type="time" value={form.endTime} onChange={(e) => set("endTime", e.target.value)} className={inputClass} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1"><MapPin size={14} /> Main Location *</label>
              <input required value={form.location} onChange={(e) => set("location", e.target.value)} className={inputClass} placeholder="e.g. New York, NY or Online" />
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-6 mt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1"><DollarSign size={14} /> Guest Price</label>
                <input type="number" min="0" value={form.guestPrice} onChange={(e) => set("guestPrice", Number(e.target.value))} className={inputClass} placeholder="0 for Free" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1"><DollarSign size={14} /> Member Price</label>
                <input type="number" min="0" value={form.memberPrice} onChange={(e) => set("memberPrice", Number(e.target.value))} className={inputClass} placeholder="0 for Free" />
              </div>
            </div>
          </div>
        </section>

        {/* 2. MEDIA & ASSETS */}
        <section className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-slate-200">
          <div className="border-b border-slate-100 pb-4 mb-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <ImageIcon className="text-blue-600" size={22} /> Media & Assets
            </h2>
            <p className="text-sm text-slate-500 mt-1">Upload hero images and gallery content.</p>
          </div>

          <div className="space-y-8">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Main Event Image (Hero)</label>
              <ImageUpload value={form.image} onChange={(url) => set("image", url)} />
            </div>
            <hr className="border-slate-100" />
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Image Gallery</label>
              <MultiImageUpload value={form.galleryImages} onChange={(urls) => set("galleryImages", urls)} />
            </div>
            <hr className="border-slate-100" />
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Video Gallery</label>
              <MultiVideoUpload value={form.galleryVideos} onChange={(urls) => set("galleryVideos", urls)} />
            </div>
          </div>
        </section>

        {/* 3. EVENT SECTIONS MANAGER */}
        <section className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-slate-200">
          <div className="border-b border-slate-100 pb-4 mb-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Layout className="text-blue-600" size={22} /> Event Sections
            </h2>
            <p className="text-sm text-slate-500 mt-1">Add, remove, and edit sections for your event page.</p>
          </div>

          {/* Horizontal Tabs / Pills */}
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
            {AVAILABLE_SECTIONS.map((section) => {
              const isActive = activeSections.includes(section.id);
              const isSelected = activeTab === section.id;

              return (
                <div
                  key={section.id}
                  onClick={() => {
                    if (!isActive) {
                      toggleSection(section.id);
                    } else {
                      setActiveTab(section.id);
                    }
                  }}
                  className={`flex items-center gap-2 rounded-full border px-4 py-2 cursor-pointer whitespace-nowrap transition-all ${
                    isActive
                      ? isSelected
                        ? "bg-blue-600 text-white border-blue-600 shadow-md"
                        : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                      : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  {isActive && isSelected && <Check size={14} className="text-white" />}
                  <span className="text-sm font-medium">{section.label}</span>
                  
                  {isActive ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSection(section.id);
                      }}
                      className={`ml-1 rounded-full p-0.5 transition-colors ${isSelected ? 'hover:bg-blue-700 text-white' : 'hover:bg-blue-200 text-blue-600'}`}
                      title={`Remove ${section.label}`}
                    >
                      <X size={14} />
                    </button>
                  ) : (
                    <Plus size={14} className="ml-1 text-slate-400" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Render Active Tab Form */}
          {activeTab ? (
            <div className="mt-6 border border-slate-100 rounded-lg p-6 bg-slate-50/50 min-h-[400px]">
              {activeTab === "overview" && (
                <OverviewForm data={sections.overview} onChange={(d: any) => setSectionData("overview", d)} />
              )}
              {activeTab === "mediaKit" && (
                <MediaKitForm data={sections.mediaKit} onChange={(d: any) => setSectionData("mediaKit", d)} />
              )}
              {activeTab === "agenda" && (
                <AgendaForm data={sections.agenda ?? []} onChange={(d: any) => setSectionData("agenda", d)} availableSpeakers={sections.speakers || []} />
              )}
              {activeTab === "speakers" && (
                <SpeakersForm data={sections.speakers ?? []} onChange={(d: any) => setSectionData("speakers", d)} />
              )}
              {activeTab === "sponsors" && (
                <SponsorsForm data={sections.sponsors ?? []} onChange={(d: any) => setSectionData("sponsors", d)} />
              )}
              {activeTab === "venue" && (
                <VenueForm data={sections.venue} onChange={(d: any) => setSectionData("venue", d)} />
              )}
              {activeTab === "contactUs" && (
                <ContactUsForm data={sections.contactUs} onChange={(d: any) => setSectionData("contactUs", d)} />
              )}
              {activeTab === "info" && (
                <InfoForm data={sections.info} onChange={(d: any) => setSectionData("info", d)} />
              )}
              {activeTab === "book" && (
                <BookForm
                  data={sections.book}
                  onChange={(d: any) => setSectionData("book", d)}
                  tickets={tickets}
                  onTicketsChange={setTickets}
                />
              )}
            </div>
          ) : (
            <div className="mt-6 text-center py-16 bg-slate-50 rounded-lg border border-dashed border-slate-200">
              <Layout className="mx-auto text-slate-300 mb-3" size={32} />
              <p className="text-slate-500 font-medium">Select or add a section from above to edit its content.</p>
              <p className="text-slate-400 text-sm mt-1">Unused sections will not be shown on the event page.</p>
            </div>
          )}
        </section>

      </div>

      {/* 4. BOTTOM SAVE BAR */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-[250px] bg-white/80 backdrop-blur-md border-t border-slate-200 p-4 sm:px-8 z-50 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)] flex flex-col sm:flex-row justify-between items-center gap-4 transition-all">
        <span className="text-sm text-slate-500 font-medium">
          Only added sections will be visible on the event page.
        </span>
        <button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-2.5 px-8 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          <Save size={18} /> {saving ? "Saving Event..." : "Save Event"}
        </button>
      </div>
    </form>
  );
}
