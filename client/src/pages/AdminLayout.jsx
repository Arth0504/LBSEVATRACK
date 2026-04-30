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
    setDate(new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" }));
    API.get("/admin/activities").then(r => setNotifs(r.data)).catch(() => {});
  }, []);

  const menu = [
    { name: "Dashboard",    icon: <LayoutDashboard size={16} />, path: "/admin" },
    { name: "Temples",      icon: <Building2 size={16} />,       path: "/admin/temples" },
    { name: "Slots",        icon: <Calendar size={16} />,        path: "/admin/slots" },
    { name: "Users",        icon: <Users size={16} />,           path: "/admin/users" },
    { name: "Create Gate",  icon: <UserPlus size={16} />,        path: "/admin/create-gate" },
    { name: "Analytics",    icon: <BarChart3 size={16} />,       path: "/admin/analytics" },
    { name: "Queries",      icon: <MessageSquare size={16} />,   path: "/admin/queries" },
    { name: "Notice Board", icon: <Bell size={16} />,            path: "/admin/notes" },
  ];

  const isActive = p => p === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(p);
  const logout = () => { localStorage.clear(); navigate("/login"); };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">

      {/* ── Sidebar ── */}
      <aside className="w-[230px] flex-shrink-0 flex flex-col" style={{ background: "linear-gradient(180deg, #1e1e1e 0%, #141414 100%)" }}>

        {/* Logo */}
        <div
          className="px-5 py-5 cursor-pointer flex items-center gap-3 border-b"
          style={{ borderColor: "rgba(255,255,255,0.07)" }}
          onClick={() => navigate("/admin")}
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
               style={{ background: "linear-gradient(135deg, #dd2d4a, #b8203a)", boxShadow: "0 4px 14px rgba(221,45,74,0.35)" }}>
            <span className="text-white font-bold font-serif text-base">S</span>
          </div>
          <div>
            <p className="font-serif text-base font-bold text-white leading-tight">SevaTrack</p>
            <p className="text-xs text-gray-500 leading-tight">Admin Panel</p>
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
        <div className="px-3 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <div
            onClick={logout}
            className="nav-item"
            style={{ color: "#9e9e9e" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(221,45,74,0.15)"; e.currentTarget.style.color = "#ff7a8a"; }}
            onMouseLeave={e => { e.currentTarget.style.background = ""; e.currentTarget.style.color = "#9e9e9e"; }}
          >
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
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full" style={{ background: "#dd2d4a" }} />
              )}
            </button>

            {showDrop && (
              <div className="absolute top-11 right-0 w-72 bg-white rounded-2xl shadow-xl border border-gray-150 overflow-hidden z-50 animate-fade-in">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between"
                     style={{ background: "#fff0f2" }}>
                  <h4 className="font-semibold text-sm" style={{ color: "#dd2d4a" }}>Notifications</h4>
                  {notifs.length > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ background: "#dd2d4a" }}>
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

            <div className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer"
                 style={{ background: "#fff0f2", border: "1px solid #ffadb8", color: "#dd2d4a" }}>
              <UserCircle size={20} />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
