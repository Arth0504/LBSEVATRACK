import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Building2, Calendar, Users, UserPlus,
  BarChart3, LogOut, Bell, Settings, UserCircle, MessageSquare
} from "lucide-react";
import API from "../api/axios";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [date, setDate] = useState("");
  const [notifs, setNotifs] = useState([]);
  const [showDrop, setShowDrop] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setDate(
        new Date().toLocaleDateString(undefined, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );
    });
    API.get("/admin/activities")
      .then((r) => setNotifs(r.data))
      .catch(() => {
        void 0;
      });
    return () => cancelAnimationFrame(id);
  }, []);

  const menu = [
    { name: "Dashboard",    icon: <LayoutDashboard size={16} />, path: "/admin" },
    { name: "Temples",      icon: <Building2 size={16} />,       path: "/admin/temples" },
    { name: "Slots",        icon: <Calendar size={16} />,        path: "/admin/slots" },
    { name: "Users",        icon: <Users size={16} />,           path: "/admin/users" },
    { name: "Gatekeepers",  icon: <UserPlus size={16} />,        path: "/admin/gatekeepers" },
    { name: "Reports",      icon: <BarChart3 size={16} />,       path: "/admin/reports" },
    { name: "Queries",      icon: <MessageSquare size={16} />,   path: "/admin/queries" },
    { name: "Notice Board", icon: <Bell size={16} />,            path: "/admin/notes" },
  ];

  const isActive = p => p === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(p);
  const logout = () => { localStorage.clear(); navigate("/login"); };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-sacred-25 via-white to-gold-50/30">

      {/* ── Sidebar ── */}
      <aside className="w-[230px] flex-shrink-0 flex flex-col border-r border-sacred-200/80 bg-sidebar-bg shadow-sm">
        {/* Logo */}
        <div
          className="px-5 py-5 cursor-pointer flex items-center gap-3 border-b border-sacred-200/60"
          onClick={() => navigate("/admin")}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-accent"
            style={{ background: "linear-gradient(135deg, #9f766d, #654a45)" }}
          >
            <span className="text-white font-bold font-serif text-base">S</span>
          </div>
          <div>
            <p className="font-serif text-base font-bold text-stone-800 leading-tight">SevaTrack</p>
            <p className="text-xs text-stone-500 leading-tight">Admin Panel</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {menu.map(item => (
            <div
              key={item.name}
              onClick={() => navigate(item.path)}
              className={isActive(item.path) ? "nav-item-active" : "nav-item"}
            >
              {item.icon}
              <span>{item.name}</span>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-sacred-200/60">
          <div onClick={logout} className="nav-item text-stone-600 hover:text-sacred-800">
            <LogOut size={16} />
            <span>Logout</span>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className="h-[62px] bg-white border-b border-gray-150 flex items-center justify-between px-6 flex-shrink-0 shadow-xs">
          <div>
            <h2 className="font-serif text-base font-semibold text-gray-800">Welcome Back, Admin 👋</h2>
            <p className="text-xs text-gray-400">{date}</p>
          </div>

          <div className="flex items-center gap-2 relative">
            {/* Bell */}
            <button
              onClick={() => setShowDrop(!showDrop)}
              className="relative w-9 h-9 rounded-xl bg-gray-50 border border-gray-150 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            >
              <Bell size={16} />
              {notifs.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-sacred-500 ring-2 ring-white" />
              )}
            </button>

            {showDrop && (
              <div className="absolute top-11 right-0 w-72 bg-white rounded-2xl shadow-xl border border-gray-150 overflow-hidden z-50 animate-fade-in">
                <div className="px-4 py-3 border-b border-sacred-100 flex items-center justify-between bg-gold-50/80">
                  <h4 className="font-semibold text-sm text-sacred-800">Notifications</h4>
                  {notifs.length > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full text-white bg-sacred-600">
                      {notifs.length}
                    </span>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifs.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-6">No notifications</p>
                  ) : notifs.slice(0, 6).map((n, i) => (
                    <div key={i} className="px-4 py-3 text-xs text-gray-600 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">{n.message}</div>
                  ))}
                </div>
              </div>
            )}

            <button className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-150 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
              <Settings size={16} />
            </button>

            <div onClick={() => navigate("/profile")} className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer border border-sacred-200 bg-gold-50 text-sacred-700 hover:bg-gold-100 transition-colors">
              <UserCircle size={20} />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-white/60">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
