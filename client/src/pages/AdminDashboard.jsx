import { useEffect, useState, useRef } from "react";
import API from "../api/axios";
import { toast } from "react-toastify";
import { TrendingUp, Users, XCircle, Lock, CheckCircle, UserCheck, RefreshCw } from "lucide-react";

const ACCENT = "#dd2d4a";

const statConfig = [
  { key: "totalBookingsToday", label: "Today's Bookings", icon: <TrendingUp size={18} />,  bg: "#fff0f2", color: "#dd2d4a", border: "#ffadb8" },
  { key: "totalVisitorsToday", label: "Visitors Today",   icon: <Users size={18} />,       bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  { key: "cancelledToday",     label: "Cancelled Today",  icon: <XCircle size={18} />,     bg: "#fff7ed", color: "#ea580c", border: "#fed7aa" },
  { key: "fullSlots",          label: "Full Slots",       icon: <Lock size={18} />,        bg: "#fefce8", color: "#ca8a04", border: "#fde68a" },
  { key: "activeSlots",        label: "Active Slots",     icon: <CheckCircle size={18} />, bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
  { key: "totalMembersToday",  label: "Members Today",    icon: <UserCheck size={18} />,   bg: "#faf5ff", color: "#9333ea", border: "#e9d5ff" },
];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [cancelled, setCancelled] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const first = useRef(true);

  useEffect(() => {
    fetchAll();
    const t = setInterval(fetchAll, 30000);
    return () => clearInterval(t);
  }, []);

  const fetchAll = async () => {
    try {
      if (first.current) setLoading(true);
      else setRefreshing(true);
      const [s, b, c] = await Promise.all([
        API.get("/admin/dashboard"),
        API.get("/admin/recent-bookings"),
        API.get("/admin/cancelled-bookings"),
      ]);
      setStats(s.data); setBookings(b.data); setCancelled(c.data);
      if (first.current) { toast.success("Dashboard loaded ✓"); first.current = false; }
    } catch { toast.error("Failed to load dashboard"); }
    finally { setLoading(false); setRefreshing(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-gray-200 rounded-full animate-spin mx-auto mb-3"
             style={{ borderTopColor: ACCENT }} />
        <p className="text-gray-400 text-sm">Loading dashboard...</p>
      </div>
    </div>
  );

  const statusCls = s => s === "booked" ? "status-booked" : s === "used" ? "status-used" : "status-cancelled";

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-sub">Real-time statistics and recent activity</p>
        </div>
        <button
          onClick={fetchAll}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-500 border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {statConfig.map(({ key, label, icon, bg, color, border }) => (
          <div
            key={key}
            className="card card-hover p-5"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 flex-shrink-0"
                 style={{ background: bg, border: `1px solid ${border}`, color }}>
              {icon}
            </div>
            <p className="font-serif text-2xl font-bold text-gray-800">{stats?.[key] ?? 0}</p>
            <p className="text-xs text-gray-400 mt-0.5 leading-tight">{label}</p>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Bookings table */}
        <div className="xl:col-span-2 card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-gray-800">Recent Bookings</h3>
            <span className="badge-gray">{bookings.length} records</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: "#fafafa" }}>
                  {["Booking ID", "User", "Temple", "Status"].map(h => (
                    <th key={h} className="table-head-cell">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-gray-300 text-sm">
                      <div className="text-3xl mb-2">📋</div>
                      No bookings yet
                    </td>
                  </tr>
                ) : bookings.map(b => (
                  <tr key={b._id} className="hover:bg-gray-25 transition-colors">
                    <td className="table-cell font-mono text-xs text-gray-400">{b.bookingId}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                             style={{ background: "#fff0f2", border: "1px solid #ffadb8", color: ACCENT }}>
                          {b.user?.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-700">{b.user?.name}</span>
                      </div>
                    </td>
                    <td className="table-cell text-gray-600">{b.slot?.temple?.name}</td>
                    <td className="table-cell"><span className={statusCls(b.status)}>{b.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-5">

          {/* Cancelled */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-5 rounded-full" style={{ background: ACCENT }} />
              <h3 className="font-serif text-lg font-bold text-gray-800">Cancelled Bookings</h3>
            </div>
            <div className="space-y-3">
              {cancelled.slice(0, 5).map(c => (
                <div key={c._id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-400 text-xs flex-shrink-0">✕</div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{c.user?.name}</p>
                    <p className="text-xs text-gray-400 truncate">{c.slot?.temple?.name}</p>
                  </div>
                </div>
              ))}
              {cancelled.length === 0 && (
                <p className="text-sm text-gray-300 text-center py-4">No cancellations today 🎉</p>
              )}
            </div>
          </div>

          {/* Quick stats */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-5 rounded-full" style={{ background: ACCENT }} />
              <h3 className="font-serif text-lg font-bold text-gray-800">All-Time Stats</h3>
            </div>
            <div className="space-y-1">
              {[
                ["Total Users",    stats?.totalUsers],
                ["Total Bookings", stats?.totalBookings],
                ["Cancelled",      stats?.cancelledToday],
              ].map(([t, v]) => (
                <div key={t} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-500">{t}</span>
                  <span className="font-serif text-xl font-bold text-gray-800">{v ?? 0}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
