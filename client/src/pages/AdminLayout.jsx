import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { LayoutDashboard, Building2, Calendar, Users, UserPlus, BarChart3, LogOut, Bell, Settings, UserCircle, MessageSquare, BookOpen } from "lucide-react";
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
    { name: "Dashboard",      icon: <LayoutDashboard size={16} />, path: "/admin" },
    { name: "Temples",        icon: <Building2 size={16} />,       path: "/admin/temples" },
    { name: "Slots",          icon: <Calendar size={16} />,        path: "/admin/slots" },
    { name: "Users",          icon: <Users size={16} />,           path: "/admin/users" },
    { name: "Create Gate",    icon: <UserPlus size={16} />,        path: "/admin/create-gate" },
    { name: "Analytics",      icon: <BarChart3 size={16} />,       path: "/admin/analytics" },
    { name: "Queries",        icon: <MessageSquare size={16} />,   path: "/admin/queries" },
    { name: "Notice Board",   icon: <Bell size={16} />,            path: "/admin/notes" },
  ];

  const isActive = p => p === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(p);
  const logout = () => { localStorage.clear(); navigate("/login"); };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#F8F5F2" }}>

      {/* ── Sidebar ── */}
      <aside className="w-[220px] flex-shrink-0 flex flex-col" style={{ background: "linear-gradient(180deg, #28251F 0%, #1A1714 100%)" }}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/8 cursor-pointer" onClick={() => navigate("/admin")}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-grad flex items-center justify-center shadow-primary flex-shrink-0">
              <BookOpen size={15} className="text-white" />
            </div>
            <span className="font-serif text-lg font-bold text-white">SevaTrack</span>
          </div>
          <p className="text-xs text-stone-500 mt-1 ml-10">Admin Panel</p>
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
        <div className="px-3 py-4 border-t border-white/8">
          <div onClick={logout} className="nav-item hover:bg-red-500/15 hover:text-red-300">
            <LogOut size={16} />
            <span>Logout</span>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-[60px] bg-white border-b border-stone-150 flex items-center justify-between px-6 flex-shrink-0 shadow-xs">
          <div>
            <h2 className="font-serif text-base font-semibold text-stone-800">Welcome Back, Admin 👋</h2>
            <p className="text-xs text-stone-400">{date}</p>
          </div>

          <div className="flex items-center gap-2 relative">
            <button
              onClick={() => setShowDrop(!showDrop)}
              className="relative w-9 h-9 rounded-xl bg-stone-50 border border-stone-150 flex items-center justify-center text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors"
            >
              <Bell size={16} />
              {notifs.length > 0 && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary-500 rounded-full" />}
            </button>

            {showDrop && (
              <div className="absolute top-11 right-0 w-72 bg-white rounded-2xl shadow-xl border border-stone-150 overflow-hidden z-50 animate-fade-in">
                <div className="px-4 py-3 border-b border-stone-100 bg-stone-50">
                  <h4 className="font-semibold text-sm text-stone-700">Notifications</h4>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifs.length === 0 ? (
                    <p className="text-xs text-stone-400 text-center py-6">No notifications</p>
                  ) : notifs.slice(0, 6).map((n, i) => (
                    <div key={i} className="px-4 py-3 text-xs text-stone-600 border-b border-stone-50 last:border-0 hover:bg-stone-50">{n.message}</div>
                  ))}
                </div>
              </div>
            )}

            <button className="w-9 h-9 rounded-xl bg-stone-50 border border-stone-150 flex items-center justify-center text-stone-400 hover:bg-stone-100 transition-colors">
              <Settings size={16} />
            </button>

            <div className="w-9 h-9 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-500 cursor-pointer">
              <UserCircle size={20} />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-warm-page">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
