import Link from "next/link";
import { Building2, Handshake, Mail, Megaphone } from "lucide-react";

export const metadata = { title: "Partner With Us | SME Events", description: "Partner with SME Events to build meaningful business connections." };

export default function PartnerWithUsPage() {
  return <main className="min-h-screen bg-slate-50 pb-20 pt-32 mt-14">
    <section className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8">
      <div className="rounded-3xl bg-[#0a0a0a] px-8 py-16 text-white sm:px-14">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#e31837]">Partner with us</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-extrabold sm:text-6xl">Create bigger business conversations together.</h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">Connect your brand with decision-makers, founders, and business leaders through curated SME Events programs.</p>
        <Link href="mailto:events@smeevents.in?subject=Partnership%20enquiry" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[#e31837] px-6 py-3 font-bold hover:bg-[#c8102e]"><Mail size={18} /> Start a conversation</Link>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {[{ icon: Building2, title: "Brand visibility", copy: "Place your brand in front of an engaged business audience." }, { icon: Handshake, title: "Meaningful access", copy: "Build relationships through premium networking opportunities." }, { icon: Megaphone, title: "Custom activations", copy: "Create experiences designed around your goals." }].map(({ icon: Icon, title, copy }) => <article key={title} className="rounded-2xl border border-slate-200 bg-white p-7"><Icon className="text-[#e31837]" size={28} /><h2 className="mt-5 text-xl font-bold">{title}</h2><p className="mt-2 text-slate-600">{copy}</p></article>)}
      </div>
    </section>
  </main>;
}
