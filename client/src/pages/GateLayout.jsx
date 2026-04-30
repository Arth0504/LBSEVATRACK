import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck, CalendarDays, Activity, LogOut, BookOpen } from "lucide-react";

const GateLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menu = [
    { name: "Verify Entry",   path: "/gate",          icon: <ShieldCheck size={16} /> },
    { name: "Today Bookings", path: "/gate/bookings", icon: <CalendarDays size={16} /> },
    { name: "My Activity",    path: "/gate/activity", icon: <Activity size={16} /> },
  ];

  const logout = () => { localStorage.clear(); navigate("/login"); };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside className="w-[200px] flex-shrink-0 flex flex-col" style={{ background: "linear-gradient(180deg, #1e1e1e 0%, #141414 100%)" }}>
        <div className="px-5 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #dd2d4a, #b8203a)", boxShadow: "0 4px 14px rgba(221,45,74,0.35)" }}>
              <span className="text-white font-bold font-serif text-sm">S</span>
            </div>
            <span className="font-serif text-lg font-bold text-white">Gate Panel</span>
          </div>
          <p className="text-xs text-gray-500 mt-1 ml-11">Entry Management</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {menu.map(item => (
            <div
              key={item.name}
              onClick={() => navigate(item.path)}
              className={location.pathname === item.path ? "nav-item-active" : "nav-item"}
            >
              {item.icon}
              <span>{item.name}</span>
            </div>
          ))}
        </nav>

        <div className="px-3 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <div onClick={logout} className="nav-item" style={{ color: "#9e9e9e" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(221,45,74,0.15)"; e.currentTarget.style.color = "#ff7a8a"; }}
            onMouseLeave={e => { e.currentTarget.style.background = ""; e.currentTarget.style.color = "#9e9e9e"; }}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </div>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
};

export default GateLayout;
