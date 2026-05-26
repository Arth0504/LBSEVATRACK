import { motion as Motion } from "framer-motion";
import { MapPin, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import SectionHeader from "./SectionHeader";

function TempleSkeleton() {
  return (
    <div className="rounded-[1.75rem] border border-white/80 bg-white/68 p-3 shadow-card backdrop-blur-xl md:flex md:gap-5">
      <div className="h-48 rounded-[1.25rem] shimmer-bg md:h-auto md:w-64" />
      <div className="flex-1 space-y-4 p-4">
        <div className="h-7 w-[55%] rounded-lg bg-sacred-100" />
        <div className="h-4 w-[40%] rounded bg-sacred-100" />
        <div className="h-16 w-full rounded-xl bg-sacred-50" />
      </div>
    </div>
  );
}

export default function HomeTemplesSection({
  temples,
  loading,
  getImg,
  onTempleNavigate,
}) {
  const slice = temples.slice(0, 4);

  return (
    <section className="relative overflow-hidden bg-sacred-25 py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-serene-waves opacity-50" />
      <div className="pointer-events-none absolute inset-0 bg-mesh-3 opacity-80" />
      <div className="section-container relative">
        <SectionHeader
          eyebrow="Retreat directory"
          title="Featured temples"
          subtitle="Horizontal booking cards with quiet details, soft imagery, and a direct path into the live booking journey."
        />

        <div className="mx-auto flex max-w-5xl snap-x gap-5 overflow-x-auto pb-3 md:grid md:grid-cols-1 md:overflow-visible md:pb-0">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <TempleSkeleton key={i} />)
            : slice.map((t, i) => (
                <Motion.article
                  key={t._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.45, delay: i * 0.06 }}
                  whileHover={{ y: -4 }}
                  className="group flex min-w-[86vw] cursor-pointer snap-center flex-col overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/72 p-3 shadow-card backdrop-blur-xl transition-all duration-300 hover:border-sacred-200 hover:bg-white/82 hover:shadow-card-hover md:min-w-0 md:flex-row md:items-stretch md:gap-5"
                  onClick={() => onTempleNavigate(t._id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onTempleNavigate(t._id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open ${t.name}`}
                >
                  <div className="relative h-56 overflow-hidden rounded-[1.25rem] md:h-auto md:w-72 md:shrink-0">
                    <img
                      src={getImg(t.name)}
                      alt={t.name}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-card-overlay" />
                  </div>

                  <div className="flex flex-1 flex-col justify-center p-5 md:px-3 md:py-7">
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-sacred-500">
                      Curated darshan
                    </p>
                    <h3 className="font-serif text-3xl font-medium text-stone-800 md:text-4xl">{t.name}</h3>
                    <p className="mt-2 flex items-center gap-1.5 text-sm text-stone-500">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-sacred-500" aria-hidden />
                      {t.location}
                    </p>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600">
                      {t.description || "A peaceful temple visit experience with simple digital booking and verified entry."}
                    </p>

                    <div className="mt-6">
                      <Motion.button
                        type="button"
                        whileHover={{ x: 3 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onTempleNavigate(t._id);
                        }}
                        className="inline-flex items-center gap-2 rounded-full bg-sacred-800 px-5 py-2.5 text-sm font-semibold text-white shadow-accent transition-all hover:bg-sacred-900 hover:shadow-glow-sm"
                      >
                        Book darshan
                        <ChevronRight className="h-4 w-4" aria-hidden />
                      </Motion.button>
                    </div>
                  </div>
                </Motion.article>
              ))}
        </div>

        {!loading && slice.length === 0 && (
          <p className="rounded-[1.5rem] border border-dashed border-sacred-200 bg-white/70 py-12 text-center text-sm text-stone-600">
            No temples are listed yet. Add venues from the admin dashboard to populate this section.
          </p>
        )}

        <div className="mt-12 flex justify-center">
          <Link
            to="/temples"
            className="group inline-flex items-center gap-2 rounded-full border border-sacred-200 bg-white/72 px-6 py-3 text-sm font-semibold text-sacred-700 shadow-sm backdrop-blur-xl transition-all duration-200 hover:border-sacred-300 hover:bg-white hover:shadow-md"
          >
            View all temples
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
