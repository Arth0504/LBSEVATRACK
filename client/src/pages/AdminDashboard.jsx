import { useEffect, useState, useRef } from "react";
import API from "../api/axios";
import { toast } from "react-toastify";
import { TrendingUp, Users, XCircle, Lock, CheckCircle, UserCheck } from "lucide-react";

const statConfig = [
  { key: "totalBookingsToday", label: "Today's Bookings", icon: <TrendingUp size={18} />, color: "bg-blue-50 text-blue-600 border-blue-100" },
  { key: "totalVisitorsToday", label: "Visitors Today",   icon: <Users size={18} />,      color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  { key: "cancelledToday",     label: "Cancelled Today",  icon: <XCircle size={18} />,    color: "bg-red-50 text-red-500 border-red-100" },
  { key: "fullSlots",          label: "Full Slots",        icon: <Lock size={18} />,       color: "bg-amber-50 text-amber-600 border-amber-100" },
  { key: "activeSlots",        label: "Active Slots",      icon: <CheckCircle size={18} />,color: "bg-primary-50 text-primary-600 border-primary-100" },
  { key: "totalMembersToday",  label: "Members Today",     icon: <UserCheck size={18} />,  color: "bg-purple-50 text-purple-600 border-purple-100" },
];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [cancelled, setCancelled] = useState([]);
  const [loading, setLoading] = useState(true);
  const first = useRef(true);

  useEffect(() => {
    fetchAll();
    const t = setInterval(fetchAll, 30000);
    return () => clearInterval(t);
  }, []);

  const fetchAll = async () => {
    try {
      if (first.current) setLoading(true);
      const [s, b, c] = await Promise.all([
        API.get("/admin/dashboard"),
        API.get("/admin/recent-bookings"),
        API.get("/admin/cancelled-bookings"),
      ]);
      setStats(s.data); setBookings(b.data); setCancelled(c.data);
      if (first.current) { toast.success("Dashboard loaded"); first.current = false; }
    } catch { toast.error("Failed to load dashboard"); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-stone-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-stone-400 text-sm">Loading dashboard...</p>
      </div>
    </div>
  );

  const statusCls = s => s === "booked" ? "status-booked" : s === "used" ? "status-used" : "status-cancelled";

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="page-header">
        <h1 className="page-title">Dashboard Overview</h1>
        <p className="page-sub">Real-time statistics and recent activity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {statConfig.map(({ key, label, icon, color }) => (
          <div key={key} className="card p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-3 ${color}`}>
              {icon}
            </div>
            <p className="font-serif text-2xl font-bold text-stone-800">{stats?.[key] ?? 0}</p>
            <p className="text-xs text-stone-400 mt-0.5 leading-tight">{label}</p>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Bookings table */}
        <div className="xl:col-span-2 card shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-stone-800">Recent Bookings</h3>
            <span className="badge-stone">{bookings.length} records</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {["Booking ID", "User", "Temple", "Status"].map(h => (
                    <th key={h} className="table-head-cell">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-10 text-stone-300 text-sm">No bookings yet</td></tr>
                ) : bookings.map(b => (
                  <tr key={b._id} className="hover:bg-stone-50 transition-colors">
                    <td className="table-cell font-mono text-xs text-stone-400">{b.bookingId}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-600 text-xs font-bold flex-shrink-0">
                          {b.user?.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-stone-700">{b.user?.name}</span>
                      </div>
                    </td>
                    <td className="table-cell text-stone-600">{b.slot?.temple?.name}</td>
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
          <div className="card p-6 shadow-sm">
            <h3 className="font-serif text-lg font-bold text-stone-800 mb-4">Cancelled Bookings</h3>
            <div className="space-y-3">
              {cancelled.slice(0, 5).map(c => (
                <div key={c._id} className="flex items-center gap-3 py-2 border-b border-stone-50 last:border-0">
                  <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-400 text-xs flex-shrink-0">✕</div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-stone-700 truncate">{c.user?.name}</p>
                    <p className="text-xs text-stone-400 truncate">{c.slot?.temple?.name}</p>
                  </div>
                </div>
              ))}
              {cancelled.length === 0 && <p className="text-sm text-stone-300 text-center py-4">No cancellations today</p>}
            </div>
          </div>

          {/* Quick stats */}
          <div className="card p-6 shadow-sm">
            <h3 className="font-serif text-lg font-bold text-stone-800 mb-4">All-Time Stats</h3>
            <div className="space-y-3">
              {[["Total Users", stats?.totalUsers], ["Total Bookings", stats?.totalBookings], ["Cancelled", stats?.cancelledToday]].map(([t, v]) => (
                <div key={t} className="flex justify-between items-center py-2.5 border-b border-stone-50 last:border-0">
                  <span className="text-sm text-stone-500">{t}</span>
                  <span className="font-serif text-xl font-bold text-stone-800">{v ?? 0}</span>
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
