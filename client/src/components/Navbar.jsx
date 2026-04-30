import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) =>
    `font-sans text-sm font-medium transition-colors duration-200 pb-0.5 border-b-2 ${
      isActive(path)
        ? "text-blush-500 border-blush-300"
        : "text-warm-500 border-transparent hover:text-blush-400 hover:border-rose-200"
    }`;

  return (
    <nav className="sticky top-0 z-50 glass-rose shadow-warm border-b border-rose-100">
      <div className="max-w-7xl mx-auto px-5 md:px-8 h-[70px] flex items-center justify-between">

        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          className="cursor-pointer flex items-center gap-1.5"
        >
          <span className="font-serif text-xl font-semibold text-blush-500">Seva</span>
          <span className="font-serif text-xl font-semibold text-warm-700">Track</span>
          <span className="ml-1 text-lg">🪷</span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-7">
          <Link className={linkClass("/")} to="/">Home</Link>

          {(!user || user.role === "user") && (
            <Link className={linkClass("/temples")} to="/temples">Temples</Link>
          )}

          {user?.role === "user" && (
            <Link className={linkClass("/my-bookings")} to="/my-bookings">My Bookings</Link>
          )}

          {user?.role === "admin" && (
            <Link className={linkClass("/admin")} to="/admin">Dashboard</Link>
          )}

          {user?.role === "gate" && (
            <Link className={linkClass("/gate")} to="/gate">Gate Panel</Link>
          )}
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {!token ? (
            <>
              <Link
                to="/login"
                className="btn-ghost text-sm px-5 py-2"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="btn-primary text-sm px-5 py-2"
              >
                Register
              </Link>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="btn-ghost text-sm px-5 py-2"
            >
              Logout
            </button>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 rounded-xl text-warm-500 hover:bg-rose-100 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-rose-100 px-5 py-4 flex flex-col gap-3 animate-fade-in">
          <Link className="text-sm font-medium text-warm-600 py-2 border-b border-rose-50" to="/" onClick={() => setMobileOpen(false)}>Home</Link>
          {(!user || user.role === "user") && (
            <Link className="text-sm font-medium text-warm-600 py-2 border-b border-rose-50" to="/temples" onClick={() => setMobileOpen(false)}>Temples</Link>
          )}
          {user?.role === "user" && (
            <Link className="text-sm font-medium text-warm-600 py-2 border-b border-rose-50" to="/my-bookings" onClick={() => setMobileOpen(false)}>My Bookings</Link>
          )}
          {!token ? (
            <div className="flex gap-3 pt-2">
              <Link to="/login" className="btn-ghost flex-1 text-center text-sm" onClick={() => setMobileOpen(false)}>Login</Link>
              <Link to="/register" className="btn-primary flex-1 text-center text-sm" onClick={() => setMobileOpen(false)}>Register</Link>
            </div>
          ) : (
            <button onClick={handleLogout} className="btn-ghost text-sm w-full">Logout</button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
