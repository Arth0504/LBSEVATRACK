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
    <div className="flex h-screen overflow-hidden" style={{ background: "#F8F5F2" }}>
      {/* Sidebar */}
      <aside className="w-[200px] flex-shrink-0 flex flex-col" style={{ background: "linear-gradient(180deg, #28251F 0%, #1A1714 100%)" }}>
        <div className="px-5 py-5 border-b border-white/8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-grad flex items-center justify-center shadow-primary flex-shrink-0">
              <BookOpen size={15} className="text-white" />
            </div>
            <span className="font-serif text-lg font-bold text-white">Gate Panel</span>
          </div>
          <p className="text-xs text-stone-500 mt-1 ml-10">Entry Management</p>
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

        <div className="px-3 py-4 border-t border-white/8">
          <div onClick={logout} className="nav-item hover:bg-red-500/15 hover:text-red-300">
            <LogOut size={16} />
            <span>Logout</span>
          </div>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-6 bg-warm-page">
        <Outlet />
      </main>
    </div>
  );
};

export default GateLayout;
