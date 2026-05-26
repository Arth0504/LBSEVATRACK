import { motion as Motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function HomeCTA() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-sacred-50/80 py-20 md:py-24">
      <div className="pointer-events-none absolute inset-0 bg-serene-waves opacity-45" />
      <div className="section-container">
        <Motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/68 px-8 py-14 text-center shadow-glass backdrop-blur-2xl md:px-16 md:py-16"
        >
          <div className="pointer-events-none absolute inset-0 bg-mesh-3 opacity-80" />

          <div className="relative z-[1] mx-auto max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sacred-600/80">Ready when you are</p>
            <h2 className="mt-3 font-serif text-4xl font-medium tracking-normal text-stone-800 md:text-5xl">
              Bring calm operations to your next darshan season
            </h2>
            <p className="mt-4 text-base text-stone-600 md:text-lg">
              Sign in to reserve a slot, or browse the directory to plan your visit — the same routes and APIs as
              always.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-sacred-800 px-7 py-3.5 text-sm font-semibold text-white shadow-accent-lg transition-all hover:bg-sacred-900 hover:shadow-glow"
                >
                  Create account
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </Motion.div>
              <Motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-full border border-sacred-200 bg-white/72 px-7 py-3.5 text-sm font-medium text-sacred-800 shadow-sm backdrop-blur-xl transition-all hover:border-sacred-300 hover:bg-white hover:shadow-md"
                >
                  Sign in
                </Link>
              </Motion.div>
            </div>
          </div>
        </Motion.div>
      </div>
    </section>
  );
}
