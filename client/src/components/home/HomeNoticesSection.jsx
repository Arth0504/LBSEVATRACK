import { motion as Motion } from "framer-motion";
import { Bell } from "lucide-react";
import SectionHeader from "./SectionHeader";

function NoteSkeleton() {
  return (
    <div className="rounded-3xl border border-gray-200/80 bg-white/60 p-6 shadow-sm backdrop-blur-md">
      <div className="mb-4 h-10 w-10 rounded-xl shimmer-bg" />
      <div className="mb-3 h-5 w-2/3 rounded shimmer-bg" />
      <div className="space-y-2">
        <div className="h-3 w-full rounded shimmer-bg" />
        <div className="h-3 w-5/6 rounded shimmer-bg" />
        <div className="h-3 w-4/6 rounded shimmer-bg" />
      </div>
    </div>
  );
}

export default function HomeNoticesSection({ notes, loading }) {
  if (!loading && (!notes || notes.length === 0)) return null;

  return (
    <section className="relative overflow-hidden border-y border-sacred-200/60 bg-gradient-to-br from-gold-50/80 via-white to-sacred-50/90 py-20 md:py-24">
      <div className="pointer-events-none absolute -left-20 top-10 h-56 w-56 rounded-full bg-gold-100/50 blur-3xl" />

      <div className="section-container relative">
        <SectionHeader
          eyebrow="Announcements"
          title="Notice board"
          subtitle="Live updates from your team — pulled from the same notes API as before."
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <NoteSkeleton key={i} />)
            : notes.map((n, i) => (
                <Motion.article
                  key={n._id || i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  whileHover={{ y: -4 }}
                  className="rounded-3xl border border-sacred-200/70 bg-white/95 p-6 shadow-card backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover md:p-7"
                >
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gold-100 text-sacred-700 ring-1 ring-sacred-200/60">
                    <Bell className="h-5 w-5" aria-hidden />
                  </div>
                  <h4 className="font-serif text-lg font-semibold text-stone-800">{n.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">{n.message}</p>
                </Motion.article>
              ))}
        </div>
      </div>
    </section>
  );
}
