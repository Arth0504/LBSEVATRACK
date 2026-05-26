import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";

export default function HomeFooter({ temples, templesLoading, onTempleClick }) {
  const token = localStorage.getItem("token");
  const quick = [
    ["Home", "/"],
    ["Temples", "/temples"],
    ...(token ? [["My Bookings", "/my-bookings"]] : []),
    ...(token ? [] : [["Login", "/login"]]),
  ];

  return (
    <footer className="relative border-t border-sacred-200/70 bg-footer-bg text-stone-600">
      <div className="pointer-events-none absolute inset-0 bg-serene-waves opacity-35" />
      <div className="section-container relative py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/80 bg-sacred-100 text-lg font-semibold text-sacred-700 shadow-sm">
                S
              </div>
              <span className="font-serif text-xl font-medium text-stone-800">
                Seva<span className="text-sacred-600">Track</span>
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-stone-600">
              A digital darshan management layer for peaceful, organized temple visits - bookings, notices, and gate
              verification in one gentle experience.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 lg:col-span-7 lg:grid-cols-3">
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sacred-700/80">Quick links</h4>
              <ul className="mt-4 space-y-2.5">
                {quick.map(([label, path]) => (
                  <li key={path}>
                    <Link to={path} className="text-sm text-stone-600 transition-colors hover:text-sacred-700">
                      {label}
                    </Link>
                  </li>
                ))}
                {!token && (
                  <li>
                    <Link to="/register" className="text-sm text-stone-600 transition-colors hover:text-sacred-700">
                      Register
                    </Link>
                  </li>
                )}
              </ul>
            </div>

            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sacred-700/80">Temples</h4>
              <ul className="mt-4 space-y-2.5">
                {templesLoading && <li className="text-sm text-stone-500">Loading directory...</li>}
                {!templesLoading &&
                  temples.slice(0, 5).map((t) => (
                    <li key={t._id}>
                      <button
                        type="button"
                        onClick={() => onTempleClick(t._id)}
                        className="text-left text-sm text-stone-600 transition-colors hover:text-sacred-700"
                      >
                        {t.name}
                      </button>
                    </li>
                  ))}
                {!templesLoading && temples.length === 0 && (
                  <li className="text-sm text-stone-500">No public listings yet</li>
                )}
              </ul>
            </div>

            <div className="col-span-2 lg:col-span-1">
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sacred-700/80">Product</h4>
              <p className="mt-4 text-sm leading-relaxed text-stone-600">
                Built for real mandir workflows - not generic ticketing. Bookings, notices, and gate verification stay
                connected in one calm operating flow.
              </p>
            </div>
          </div>
        </div>

        <Motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-sacred-200/60 pt-8 text-xs text-stone-500 sm:flex-row"
        >
          <span>Copyright {new Date().getFullYear()} SevaTrack. All rights reserved.</span>
          <span>
            Crafted with care by <span className="font-medium text-sacred-700">LB INFOTECH</span>
          </span>
        </Motion.div>
      </div>
    </footer>
  );
}
