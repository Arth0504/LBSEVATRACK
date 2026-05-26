import { motion as Motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CalendarDays } from "lucide-react";

export default function HomeHero({
  slides,
  current,
  setCurrent,
  onBook,
  onExplore,
}) {
  return (
    <section className="relative isolate min-h-screen overflow-hidden bg-sacred-25 pt-24 md:pt-28">
      <div className="pointer-events-none absolute inset-0 bg-serene-waves opacity-80" />
      <div className="pointer-events-none absolute inset-0 bg-mesh-1 opacity-90" />
      <div className="pointer-events-none absolute inset-0 bg-mesh-2 opacity-70" />

      <div className="section-container relative z-10 flex min-h-[calc(100svh-7rem)] flex-col items-center justify-center pb-16 pt-12 text-center md:pb-20">
        <AnimatePresence mode="wait">
          <Motion.p
            key={current}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="mb-6 rounded-full border border-white/80 bg-white/58 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-sacred-700 shadow-sm backdrop-blur-xl md:text-[13px]"
          >
            {slides[current].shlok}
          </Motion.p>
        </AnimatePresence>

        <Motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-5xl"
        >
          <h1 className="font-serif text-[clamp(3.1rem,8vw,7.4rem)] font-medium leading-[0.95] text-stone-800">
            Serene Temple
            <span className="block italic text-sacred-600">Retreat</span>
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-[1.1rem] md:text-xl font-medium leading-9 text-stone-600 tracking-wide">
            श्रद्धा से शुरू होती है हर यात्रा,<br className="hidden md:block"/>
            दर्शन तक साथ चलता है विश्वास।
          </p>
        </Motion.div>

        <Motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.55 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <Motion.button
            type="button"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onBook}
            className="inline-flex items-center gap-2 rounded-full bg-sacred-800 px-7 py-3.5 text-sm font-semibold text-white shadow-accent-lg transition-all hover:bg-sacred-900 hover:shadow-glow"
          >
            Reserve darshan
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Motion.button>
          <Motion.button
            type="button"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onExplore}
            className="inline-flex items-center gap-2 rounded-full border border-sacred-200 bg-white/70 px-7 py-3.5 text-sm font-medium text-sacred-800 shadow-sm backdrop-blur-xl transition-all hover:border-sacred-300 hover:bg-white"
          >
            <CalendarDays className="h-4 w-4" aria-hidden />
            Explore temples
          </Motion.button>
        </Motion.div>

        <Motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.65 }}
          className="relative mt-14 w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/80 bg-white/55 p-2 shadow-glass backdrop-blur-2xl md:rounded-[2.5rem]"
        >
          <div className="relative aspect-[16/8.5] min-h-[260px] overflow-hidden rounded-[1.5rem] md:min-h-[380px] md:rounded-[2rem]">
            {slides.map((s, i) => (
              <img
                key={s.image}
                src={s.image}
                alt=""
                aria-hidden={i !== current}
                className={`absolute inset-0 h-full w-full object-cover transition-all duration-[1400ms] ease-out ${
                  i === current ? "scale-100 opacity-100" : "scale-[1.03] opacity-0"
                }`}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-sacred-900/20 via-white/6 to-white/20" />
          </div>
        </Motion.div>

        <div className="mt-6 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              aria-label={`Slide ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? "w-9 bg-sacred-600" : "w-2 bg-sacred-200 hover:bg-sacred-300"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
