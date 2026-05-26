import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck, CalendarDays, Activity, LogOut } from "lucide-react";

const GateLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menu = [
    { name: "Verify Entry", path: "/gate", icon: <ShieldCheck size={16} /> },
    { name: "Today Bookings", path: "/gate/bookings", icon: <CalendarDays size={16} /> },
    { name: "My Activity", path: "/gate/activity", icon: <Activity size={16} /> },
  ];

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-sacred-25 via-white to-gold-50/30">
      <aside className="w-[200px] flex-shrink-0 flex flex-col border-r border-sacred-200/80 bg-sidebar-bg shadow-sm">
        <div className="px-5 py-5 border-b border-sacred-200/60">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-accent"
              style={{ background: "linear-gradient(135deg, #9f766d, #654a45)" }}
            >
              <span className="text-white font-bold font-serif text-sm">S</span>
            </div>
            <span className="font-serif text-lg font-bold text-stone-800">Gate Panel</span>
          </div>
          <p className="text-xs text-stone-500 mt-1 ml-11">Entry Management</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {menu.map((item) => (
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

        <div className="px-3 py-4 border-t border-sacred-200/60">
          <div onClick={logout} className="nav-item text-stone-600 hover:text-sacred-800">
            <LogOut size={16} />
            <span>Logout</span>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6 bg-white/60">
        <Outlet />
      </main>
    </div>
  );
};

export default GateLayout;
