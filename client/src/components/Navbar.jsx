import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Leaf } from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => setOpen(false));
    return () => cancelAnimationFrame(id);
  }, [location.pathname]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isActive = (p) => location.pathname === p;

  const navLinks = [
    ["Home", "/"],
    ...(!user || user.role === "user" ? [["Temples", "/temples"]] : []),
    ...(user?.role === "user" ? [["My Bookings", "/my-bookings"]] : []),
    ...(user?.role === "admin" ? [["Dashboard", "/admin"]] : []),
    ...(user?.role === "gate" ? [["Gate Panel", "/gate"]] : []),
  ];

  return (
    <>
      <Motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed left-3 right-3 top-3 z-50 mx-auto max-w-6xl rounded-[1.65rem] border transition-all duration-300 md:left-6 md:right-6 ${
          scrolled
            ? "border-white/80 bg-white/86 shadow-glass backdrop-blur-2xl"
            : "border-white/70 bg-white/68 shadow-sm backdrop-blur-xl"
        }`}
      >
        <div className="mx-auto flex h-[62px] items-center justify-between px-4 md:h-[68px] md:px-6">
          <div onClick={() => navigate("/")} className="flex items-center gap-2.5 cursor-pointer group">
            <div
              className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/80 bg-sacred-100/80 text-sacred-700 shadow-sm transition-transform duration-300 group-hover:-translate-y-0.5"
            >
              <Leaf className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden />
            </div>
            <span className="font-serif text-xl font-medium text-stone-800 transition-colors duration-200">
              Seva<span className="text-sacred-600">Track</span>
            </span>
          </div>

          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map(([label, path]) => (
              <Link
                key={path}
                to={path}
                className={`relative rounded-full px-4 py-2 text-[13px] font-medium tracking-[0.01em] transition-all duration-200 ${
                  isActive(path)
                    ? "bg-white/90 text-sacred-700 shadow-xs"
                    : "text-stone-500 hover:bg-white/70 hover:text-sacred-800"
                }`}
              >
                {label}
                {isActive(path) && (
                  <Motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-1 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-sacred-400/80"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2.5">
            {!token ? (
              <>
                <Link
                  to="/login"
                  className="rounded-full border border-sacred-200/80 px-5 py-2 text-sm font-medium text-sacred-800 transition-all duration-200 hover:bg-white"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 rounded-full bg-sacred-700 px-5 py-2 text-sm font-semibold text-white shadow-accent transition-all duration-200 hover:-translate-y-0.5 hover:bg-sacred-800"
                >
                  <Leaf size={14} />
                  Get Started
                </Link>
              </>
            ) : (
              <button
                onClick={logout}
                className="rounded-full border border-sacred-200/80 px-5 py-2 text-sm font-medium text-sacred-800 transition-all duration-200 hover:bg-white"
              >
                Logout
              </button>
            )}
          </div>

          <button
            className="rounded-xl p-2 text-stone-700 transition-colors hover:bg-white/80 md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </Motion.nav>

      <AnimatePresence>
        {open && (
          <>
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-stone-900/10 backdrop-blur-sm md:hidden"
              onClick={() => setOpen(false)}
            />
            <Motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-0 right-0 top-0 z-50 flex w-72 flex-col border-l border-sacred-100 bg-sacred-25 shadow-2xl md:hidden"
            >
              <div className="flex items-center justify-between px-5 h-[70px] border-b border-sacred-100">
                <span className="font-serif text-lg font-bold text-stone-800">
                  Seva<span className="text-sacred-600">Track</span>
                </span>
                <button onClick={() => setOpen(false)} className="p-2 rounded-lg text-stone-500 hover:bg-sacred-50">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                {navLinks.map(([label, path], i) => (
                  <Motion.div
                    key={path}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      to={path}
                      onClick={() => setOpen(false)}
                      className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        isActive(path)
                          ? "bg-sacred-100 text-sacred-800 font-semibold"
                          : "text-stone-700 hover:bg-sacred-50"
                      }`}
                    >
                      {label}
                    </Link>
                  </Motion.div>
                ))}
              </div>

              <div className="px-4 py-5 border-t border-sacred-100 space-y-2">
                {!token ? (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setOpen(false)}
                      className="block w-full text-center px-4 py-2.5 rounded-xl text-sm font-medium border border-sacred-200 text-sacred-800 hover:bg-sacred-50 transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setOpen(false)}
                  className="block w-full rounded-xl bg-sacred-700 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-accent transition-all"
                    >
                      Get Started
                    </Link>
                  </>
                ) : (
                  <button
                    onClick={logout}
                    className="w-full px-4 py-2.5 rounded-xl text-sm font-medium border border-sacred-200 text-sacred-800 hover:bg-sacred-50 transition-colors"
                  >
                    Logout
                  </button>
                )}
              </div>
            </Motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
