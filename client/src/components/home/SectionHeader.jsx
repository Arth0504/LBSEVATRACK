import { motion as Motion } from "framer-motion";

export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "center",
  dark = false,
  className = "",
}) {
  const alignClass =
    align === "center"
      ? "text-center mx-auto"
      : align === "left"
        ? "text-left"
        : "text-right ml-auto";

  return (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`max-w-3xl mb-12 md:mb-16 ${alignClass} ${className}`}
    >
      {eyebrow && (
        <span
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.14em] mb-4 border ${
            dark
              ? "bg-white/[0.06] text-white/90 border-white/10"
              : "badge-accent"
          }`}
        >
          {eyebrow}
        </span>
      )}
      <h2
        className={`font-serif font-medium tracking-normal ${
          dark ? "text-white" : "text-gray-900"
        }`}
        style={{ fontSize: "clamp(2.1rem, 4.2vw, 3.75rem)", lineHeight: 1.04 }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-3 text-base md:text-lg leading-relaxed ${
            dark ? "text-white/60" : "text-gray-500"
          }`}
        >
          {subtitle}
        </p>
      )}
      <div className={`mt-5 h-px w-12 ${align === "center" ? "mx-auto" : ""} bg-sacred-300`} />
    </Motion.div>
  );
}
