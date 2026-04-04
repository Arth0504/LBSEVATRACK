import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Building2,
  Calendar,
  Users,
  UserPlus,
  BarChart3,
  LogOut,
  Bell,
  Settings as SettingsIcon,
  UserCircle,
  MessageSquare
} from "lucide-react";
import API from "../api/axios";
import "./admin.css";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [currentDate, setCurrentDate] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentDate(new Date().toLocaleDateString(undefined, options));

    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await API.get("/admin/activities");
      setNotifications(res.data);
    } catch (err) {
      console.error("Notification fetch error");
    }
  };

  const menuItems = [
    { name: "Dashboard", icon: <LayoutDashboard size={18} />, path: "/admin" },
    { name: "Manage Temples", icon: <Building2 size={18} />, path: "/admin/temples" },
    { name: "Manage Slots", icon: <Calendar size={18} />, path: "/admin/slots" },
    { name: "Manage Users", icon: <Users size={18} />, path: "/admin/users" },
    { name: "Create Gate", icon: <UserPlus size={18} />, path: "/admin/create-gate" },
    { name: "Temple Analytics", icon: <BarChart3 size={18} />, path: "/admin/analytics" },
    { name: "User Queries", icon: <MessageSquare size={18} />, path: "/admin/queries" },

    // 🔥 NEW NOTICE BOARD
    { name: "Notice Board", icon: <Bell size={18} />, path: "/admin/notes" },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const isActive = (path) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="admin-wrapper">
      <div className="admin-bg-glow"></div>

      <aside className="sidebar">
        <div className="sidebar-top">
          <h2 className="sidebar-logo" onClick={() => navigate("/admin")}>
            SevaTrack
          </h2>

          <div className="menu">
            {menuItems.map((item) => (
              <div
                key={item.name}
                className={`sidebar-item ${isActive(item.path) ? "active" : ""}`}
                onClick={() => navigate(item.path)}
              >
                {item.icon}
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-item logout" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </div>
        </div>
      </aside>

      <main className="admin-content">
        <header className="admin-header">
          <div className="header-greeting">
            <h2>Welcome Back, Admin</h2>
            <p className="header-date">{currentDate}</p>
          </div>

          <div className="header-actions" style={{ position: "relative" }}>

            {/* 🔔 Bell */}
            <button
              className="action-btn"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <Bell size={20} />
            </button>

            {/* 🔔 Dropdown */}
            {showDropdown && (
              <div className="notification-dropdown">
                <h4>Notifications</h4>

                {notifications.length === 0 ? (
                  <p className="no-notif">No notifications</p>
                ) : (
                  notifications.map((n, i) => (
                    <div key={i} className="notif-item">
                      {n.message}
                    </div>
                  ))
                )}
              </div>
            )}

            <button className="action-btn">
              <SettingsIcon size={20} />
            </button>

            <div className="profile-avatar">
              <UserCircle size={32} />
            </div>
          </div>
        </header>

        <div className="content-wrapper glass-panel">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;