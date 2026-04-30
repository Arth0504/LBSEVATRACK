import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, BookOpen } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const [open, setOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const active = (p) => location.pathname === p;

  const linkCls = (p) =>
    `text-sm font-medium transition-all duration-200 relative pb-0.5 ${
      active(p)
        ? "text-primary-600 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary-500 after:rounded-full"
        : "text-stone-500 hover:text-stone-800"
    }`;

  return (
    <nav className="sticky top-0 z-50 glass-nav border-b border-stone-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-5 md:px-8 h-[68px] flex items-center justify-between">

        {/* Logo */}
        <div onClick={() => navigate("/")} className="flex items-center gap-2.5 cursor-pointer group">
          <div className="w-8 h-8 rounded-lg bg-primary-grad flex items-center justify-center shadow-primary flex-shrink-0">
            <BookOpen size={16} className="text-white" />
          </div>
          <span className="font-serif text-xl font-bold text-stone-800 group-hover:text-primary-600 transition-colors">
            Seva<span className="text-primary-500">Track</span>
          </span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link className={linkCls("/")} to="/">Home</Link>
          {(!user || user.role === "user") && <Link className={linkCls("/temples")} to="/temples">Temples</Link>}
          {user?.role === "user"  && <Link className={linkCls("/my-bookings")} to="/my-bookings">My Bookings</Link>}
          {user?.role === "admin" && <Link className={linkCls("/admin")} to="/admin">Dashboard</Link>}
          {user?.role === "gate"  && <Link className={linkCls("/gate")} to="/gate">Gate Panel</Link>}
        </div>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-3">
          {!token ? (
            <>
              <Link to="/login" className="btn-ghost text-sm px-5 py-2.5">Login</Link>
              <Link to="/register" className="btn-primary text-sm px-5 py-2.5">Get Started</Link>
            </>
          ) : (
            <button onClick={logout} className="btn-ghost text-sm px-5 py-2.5">Logout</button>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-lg text-stone-500 hover:bg-stone-100 transition-colors"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-stone-100 px-5 py-4 space-y-1 shadow-md animate-fade-in">
          {[
            ["Home", "/"],
            ...(!user || user.role === "user" ? [["Temples", "/temples"]] : []),
            ...(user?.role === "user" ? [["My Bookings", "/my-bookings"]] : []),
            ...(user?.role === "admin" ? [["Dashboard", "/admin"]] : []),
            ...(user?.role === "gate" ? [["Gate Panel", "/gate"]] : []),
          ].map(([label, path]) => (
            <Link
              key={path}
              to={path}
              onClick={() => setOpen(false)}
              className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active(path) ? "bg-primary-50 text-primary-600" : "text-stone-600 hover:bg-stone-50"
              }`}
            >
              {label}
            </Link>
          ))}
          <div className="pt-3 border-t border-stone-100 flex gap-2">
            {!token ? (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="btn-ghost flex-1 text-center text-sm py-2.5">Login</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="btn-primary flex-1 text-center text-sm py-2.5">Register</Link>
              </>
            ) : (
              <button onClick={logout} className="btn-ghost w-full text-sm py-2.5">Logout</button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
