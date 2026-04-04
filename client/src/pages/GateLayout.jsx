import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck, CalendarDays, Activity, LogOut } from "lucide-react";
import "./gate.css";

const GateLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menu = [
    { name: "Verify Entry", path: "/gate", icon: <ShieldCheck size={18} /> },
    { name: "Today Bookings", path: "/gate/bookings", icon: <CalendarDays size={18} /> },
    { name: "My Activity", path: "/gate/activity", icon: <Activity size={18} /> },
  ];

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="gate-wrapper">

      <aside className="gate-sidebar">
        <h2 className="gate-logo">Gate Panel</h2>

        {menu.map((item) => (
          <div
            key={item.name}
            className={`gate-item ${location.pathname === item.path ? "active" : ""}`}
            onClick={() => navigate(item.path)}
          >
            {item.icon}
            <span>{item.name}</span>
          </div>
        ))}

        <div className="gate-item logout" onClick={logout}>
          <LogOut size={18} />
          <span>Logout</span>
        </div>
      </aside>

      <main className="gate-content">
        <Outlet />
      </main>
    </div>
  );
};

export default GateLayout;
