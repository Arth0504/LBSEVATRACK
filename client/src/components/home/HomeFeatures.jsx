import { motion as Motion } from "framer-motion";
import {
  CalendarDays,
  LayoutDashboard,
  Mail,
  QrCode,
  Users,
  BellRing,
} from "lucide-react";
import SectionHeader from "./SectionHeader";

const features = [
  {
    icon: CalendarDays,
    title: "Slot intelligence",
    desc: "Capacity-aware windows reduce crowding and keep darshan dignified for every family.",
  },
  {
    icon: QrCode,
    title: "Gate-ready verification",
    desc: "Scan-on-arrival flows help staff validate bookings in seconds without paper chaos.",
  },
  {
    icon: Users,
    title: "Roles that fit reality",
    desc: "Devotees, admins, and gate teams each get focused tools — no feature overload.",
  },
  {
    icon: LayoutDashboard,
    title: "Operational clarity",
    desc: "Temple leadership sees bookings and activity in one calm, structured workspace.",
  },
  {
    icon: BellRing,
    title: "Announcements",
    desc: "Publish notices devotees actually see — tied to the same journey as booking.",
  },
  {
    icon: Mail,
    title: "Receipts & comms",
    desc: "Keep confirmations and receipts consistent so visitors trust every touchpoint.",
  },
];

export default function HomeFeatures() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-sacred-25 py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-mesh-1 opacity-80" />
      <div className="pointer-events-none absolute inset-0 bg-line-grid opacity-40" />

      <div className="section-container relative">
        <SectionHeader
          eyebrow="Platform"
          title="Everything devotees expect from a premium booking experience"
          subtitle="Purpose-built flows for sacred spaces — not a generic events widget dressed up as darshan."
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => {
            const FeatureIcon = f.icon;
            return (
            <Motion.article
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.06, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="card-glass group relative flex flex-col rounded-[1.5rem] border border-white/80 bg-white/70 p-6 shadow-card backdrop-blur-xl ring-1 ring-white/80 transition-shadow duration-300 hover:border-sacred-200 hover:shadow-card-hover md:p-7"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-sacred-100 bg-sacred-50 text-sacred-700 shadow-sm transition-transform duration-300 group-hover:scale-105">
                <FeatureIcon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
              </div>
              <h3 className="font-sans text-lg font-semibold text-stone-800">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">{f.desc}</p>
            </Motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
