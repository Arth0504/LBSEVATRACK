import { createElement } from "react";
import { motion as Motion } from "framer-motion";
import { Building2, Clock, QrCode, Activity } from "lucide-react";

function StatCard({ icon, label, value, suffix, loading, delay }) {
  return (
    <Motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-[1.5rem] border border-white/80 bg-white/70 p-6 shadow-card backdrop-blur-xl transition-shadow duration-300 hover:shadow-card-hover md:p-8"
    >
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-sacred-100/80 blur-2xl transition-opacity group-hover:opacity-100" />
      <div className="relative flex flex-col gap-1">
        <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 text-sacred-600 shadow-sm ring-1 ring-sacred-200/80">
          {createElement(icon, { className: "h-5 w-5", "aria-hidden": true })}
        </div>
        {loading ? (
          <div className="h-10 w-28 rounded-lg shimmer-bg" />
        ) : (
          <p className="font-sans text-3xl font-bold tracking-tight text-stone-800 md:text-4xl">
            {value}
            {suffix != null && suffix !== "" ? (
              <span className="text-xl font-semibold text-stone-400 md:text-2xl">{suffix}</span>
            ) : null}
          </p>
        )}
        <p className="text-sm font-medium text-stone-500">{label}</p>
      </div>
    </Motion.div>
  );
}

export default function HomeStats({ templeCount, loading }) {
  const countDisplay = loading ? null : templeCount > 0 ? String(templeCount) : "—";

  return (
    <section className="relative z-20 border-b border-sacred-200/50 bg-gradient-to-b from-sacred-25 to-white pb-8 pt-4">
      <div className="section-container">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Building2}
            label="Temples on platform"
            value={countDisplay}
            suffix=""
            loading={loading}
            delay={0}
          />
          <StatCard icon={Clock} label="Booking window" value="24/7" suffix="" loading={false} delay={0.06} />
          <StatCard icon={QrCode} label="Gate verification" value="QR" suffix="" loading={false} delay={0.12} />
          <StatCard icon={Activity} label="Target uptime" value="99.9" suffix="%" loading={false} delay={0.18} />
        </div>
        <p className="mt-4 text-center text-xs text-stone-500">
          Live temple count syncs from your directory. Other figures describe platform capabilities.
        </p>
      </div>
    </section>
  );
}
