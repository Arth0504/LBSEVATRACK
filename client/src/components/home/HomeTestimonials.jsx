import { motion as Motion } from "framer-motion";
import { Quote } from "lucide-react";
import SectionHeader from "./SectionHeader";

const testimonials = [
  {
    quote:
      "Our gate team finally has a single source of truth. Even peak festival days feel structured instead of frantic.",
    name: "Trustee, coastal mandir",
    role: "Operations",
  },
  {
    quote:
      "Families book from abroad without calling the office ten times. That alone has been worth the switch.",
    name: "Office coordinator",
    role: "Temple admin",
  },
  {
    quote:
      "The QR handoff is instant. Devotees spend less time at the desk and more time in darshan.",
    name: "Lead volunteer",
    role: "Gate desk",
  },
];

export default function HomeTestimonials() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-sacred-25/80 to-white py-20 md:py-28">
      <div className="pointer-events-none absolute right-0 top-24 h-72 w-72 rounded-full bg-gold-200/35 blur-3xl" />
      <div className="pointer-events-none absolute bottom-20 left-0 h-64 w-64 rounded-full bg-sacred-200/25 blur-3xl" />

      <div className="section-container relative">
        <SectionHeader
          eyebrow="Voices"
          title="Trusted where reverence meets logistics"
          subtitle="Representative feedback from teams who run high-attendance darshan programs."
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <Motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4 }}
              className="relative flex h-full flex-col rounded-3xl border border-sacred-200/70 bg-white/95 p-7 shadow-card backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-sacred-300 hover:shadow-card-hover"
            >
              <Quote
                className="absolute right-6 top-6 h-10 w-10 text-sacred-100"
                strokeWidth={1}
                aria-hidden
              />
              <blockquote className="relative z-[1] flex-1 text-[15px] leading-relaxed text-stone-600">
                “{t.quote}”
              </blockquote>
              <figcaption className="relative z-[1] mt-6 border-t border-sacred-100 pt-5">
                <span className="font-semibold text-stone-800">{t.name}</span>
                <span className="mt-0.5 block text-xs font-medium uppercase tracking-wider text-stone-400">
                  {t.role}
                </span>
              </figcaption>
            </Motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
