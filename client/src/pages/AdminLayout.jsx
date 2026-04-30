import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { LayoutDashboard, Building2, Calendar, Users, UserPlus, BarChart3, LogOut, Bell, Settings, UserCircle, MessageSquare } from "lucide-react";
import API from "../api/axios";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentDate, setCurrentDate] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" }));
    API.get("/admin/activities").then((r) => setNotifications(r.data)).catch(() => {});
  }, []);

  const menuItems = [
    { name: "Dashboard",        icon: <LayoutDashboard size={17} />, path: "/admin" },
    { name: "Manage Temples",   icon: <Building2 size={17} />,       path: "/admin/temples" },
    { name: "Manage Slots",     icon: <Calendar size={17} />,        path: "/admin/slots" },
    { name: "Manage Users",     icon: <Users size={17} />,           path: "/admin/users" },
    { name: "Create Gate",      icon: <UserPlus size={17} />,        path: "/admin/create-gate" },
    { name: "Analytics",        icon: <BarChart3 size={17} />,       path: "/admin/analytics" },
    { name: "User Queries",     icon: <MessageSquare size={17} />,   path: "/admin/queries" },
    { name: "Notice Board",     icon: <Bell size={17} />,            path: "/admin/notes" },
  ];

  const isActive = (path) => path === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(path);

  const handleLogout = () => { localStorage.clear(); navigate("/login"); };

  return (
    <div className="flex h-screen bg-rose-25 overflow-hidden">

      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-rose-100 flex flex-col shadow-warm flex-shrink-0">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-rose-50 cursor-pointer" onClick={() => navigate("/admin")}>
          <div className="flex items-center gap-1.5">
            <span className="font-serif text-xl font-semibold text-blush-500">Seva</span>
            <span className="font-serif text-xl font-semibold text-warm-700">Track</span>
            <span className="text-lg ml-1">🪷</span>
          </div>
          <p className="text-xs text-warm-300 mt-0.5">Admin Panel</p>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <div
              key={item.name}
              onClick={() => navigate(item.path)}
              className={isActive(item.path) ? "sidebar-link-active" : "sidebar-link"}
            >
              {item.icon}
              <span>{item.name}</span>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-rose-50">
          <div onClick={handleLogout} className="sidebar-link text-warm-400 hover:text-rose-400 hover:bg-rose-50">
            <LogOut size={17} />
            <span>Logout</span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white/90 backdrop-blur-md border-b border-rose-100 flex items-center justify-between px-6 flex-shrink-0">
          <div>
            <h2 className="font-serif text-lg font-semibold text-warm-800">Welcome Back, Admin 👋</h2>
            <p className="text-xs text-warm-300">{currentDate}</p>
          </div>

          <div className="flex items-center gap-3 relative">
            {/* Bell */}
            <button onClick={() => setShowDropdown(!showDropdown)} className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-warm-400 hover:bg-rose-100 hover:text-blush-400 transition-colors relative">
              <Bell size={17} />
              {notifications.length > 0 && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blush-400 rounded-full" />}
            </button>

            {showDropdown && (
              <div className="absolute top-11 right-0 w-64 bg-white rounded-2xl shadow-warm-lg border border-rose-100 p-3 z-50 animate-fade-in">
                <h4 className="font-serif text-sm font-semibold text-warm-700 px-2 mb-2">Notifications</h4>
                {notifications.length === 0 ? (
                  <p className="text-xs text-warm-300 px-2 py-3 text-center">No notifications</p>
                ) : (
                  notifications.slice(0, 5).map((n, i) => (
                    <div key={i} className="px-2 py-2 text-xs text-warm-500 border-b border-rose-50 last:border-0">{n.message}</div>
                  ))
                )}
              </div>
            )}

            <button className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-warm-400 hover:bg-rose-100 hover:text-blush-400 transition-colors">
              <Settings size={17} />
            </button>

            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-100 to-blush-100 flex items-center justify-center text-blush-400 cursor-pointer">
              <UserCircle size={22} />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
