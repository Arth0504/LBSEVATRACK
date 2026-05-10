import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

  useEffect(() => { setOpen(false); }, [location.pathname]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isActive = (p) => location.pathname === p;

  const navLinks = [
    ["Home", "/"],
    ...(!user || user.role === "user" ? [["Temples", "/temples"]] : []),
    ...(user?.role === "user"  ? [["My Bookings", "/my-bookings"]] : []),
    ...(user?.role === "admin" ? [["Dashboard", "/admin"]] : []),
    ...(user?.role === "gate"  ? [["Gate Panel", "/gate"]] : []),
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-xl shadow-lg shadow-black/5 border-b border-gray-100"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-8 h-[70px] flex items-center justify-between">

          {/* Logo */}
          <div onClick={() => navigate("/")} className="flex items-center gap-2.5 cursor-pointer group">
            <div className="relative w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                 style={{ background: "linear-gradient(135deg, #dd2d4a 0%, #ff6b35 100%)" }}>
              <span className="text-white font-bold text-base font-serif z-10">S</span>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                   style={{ background: "linear-gradient(135deg, #ff6b35 0%, #dd2d4a 100%)" }} />
            </div>
            <span className={`font-serif text-xl font-bold transition-colors duration-200 ${scrolled ? "text-gray-900" : "text-white"}`}>
              Seva<span style={{ color: "#dd2d4a" }}>Track</span>
            </span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(([label, path]) => (
              <Link
                key={path}
                to={path}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(path)
                    ? "text-[#dd2d4a]"
                    : scrolled
                      ? "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                {label}
                {isActive(path) && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                    style={{ background: "#dd2d4a" }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-2.5">
            {!token ? (
              <>
                <Link
                  to="/login"
                  className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
                    scrolled
                      ? "border-gray-200 text-gray-700 hover:bg-gray-50"
                      : "border-white/30 text-white hover:bg-white/10"
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg, #dd2d4a, #b8203a)", boxShadow: "0 4px 14px rgba(221,45,74,0.35)" }}
                >
                  <Sparkles size={14} />
                  Get Started
                </Link>
              </>
            ) : (
              <button
                onClick={logout}
                className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
                  scrolled
                    ? "border-gray-200 text-gray-700 hover:bg-gray-50"
                    : "border-white/30 text-white hover:bg-white/10"
                }`}
              >
                Logout
              </button>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className={`md:hidden p-2 rounded-xl transition-colors ${
              scrolled ? "text-gray-700 hover:bg-gray-100" : "text-white hover:bg-white/10"
            }`}
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-white shadow-2xl md:hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-5 h-[70px] border-b border-gray-100">
                <span className="font-serif text-lg font-bold text-gray-900">
                  Seva<span style={{ color: "#dd2d4a" }}>Track</span>
                </span>
                <button onClick={() => setOpen(false)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                {navLinks.map(([label, path], i) => (
                  <motion.div
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
                          ? "bg-red-50 text-[#dd2d4a] font-semibold"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {label}
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="px-4 py-5 border-t border-gray-100 space-y-2">
                {!token ? (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setOpen(false)}
                      className="block w-full text-center px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setOpen(false)}
                      className="block w-full text-center px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                      style={{ background: "linear-gradient(135deg, #dd2d4a, #b8203a)" }}
                    >
                      Get Started
                    </Link>
                  </>
                ) : (
                  <button
                    onClick={logout}
                    className="w-full px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Logout
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
