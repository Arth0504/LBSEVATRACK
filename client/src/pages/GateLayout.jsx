import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck, CalendarDays, Activity, LogOut } from "lucide-react";

const GateLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menu = [
    { name: "Verify Entry",    path: "/gate",           icon: <ShieldCheck size={17} /> },
    { name: "Today Bookings",  path: "/gate/bookings",  icon: <CalendarDays size={17} /> },
    { name: "My Activity",     path: "/gate/activity",  icon: <Activity size={17} /> },
  ];

  const logout = () => { localStorage.clear(); navigate("/login"); };

  return (
    <div className="flex h-screen bg-rose-25 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-rose-100 flex flex-col shadow-warm flex-shrink-0">
        <div className="px-5 py-5 border-b border-rose-50">
          <div className="flex items-center gap-1.5">
            <span className="font-serif text-xl font-semibold text-blush-500">Gate</span>
            <span className="font-serif text-xl font-semibold text-warm-700">Panel</span>
            <span className="text-lg ml-1">🛡️</span>
          </div>
          <p className="text-xs text-warm-300 mt-0.5">Entry Management</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {menu.map((item) => (
            <div
              key={item.name}
              onClick={() => navigate(item.path)}
              className={location.pathname === item.path ? "sidebar-link-active" : "sidebar-link"}
            >
              {item.icon}
              <span>{item.name}</span>
            </div>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-rose-50">
          <div onClick={logout} className="sidebar-link text-warm-400 hover:text-rose-400 hover:bg-rose-50">
            <LogOut size={17} />
            <span>Logout</span>
          </div>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default GateLayout;
