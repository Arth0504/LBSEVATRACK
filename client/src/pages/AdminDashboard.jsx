import { useEffect, useState, useRef } from "react";
import API from "../api/axios";
import { toast } from "react-toastify";

const statIcons = ["📊","👥","❌","🔒","✅","👤"];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [cancelled, setCancelled] = useState([]);
  const [loading, setLoading] = useState(true);
  const firstLoad = useRef(true);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAll = async () => {
    try {
      if (firstLoad.current) setLoading(true);
      const [s, b, c] = await Promise.all([
        API.get("/admin/dashboard"),
        API.get("/admin/recent-bookings"),
        API.get("/admin/cancelled-bookings"),
      ]);
      setStats(s.data); setBookings(b.data); setCancelled(c.data);
      if (firstLoad.current) { toast.success("Dashboard Loaded"); firstLoad.current = false; }
    } catch { toast.error("Failed to load dashboard"); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-rose-200 border-t-blush-400 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-warm-400 text-sm">Loading Dashboard...</p>
      </div>
    </div>
  );

  const statItems = [
    { title: "Today's Bookings", value: stats?.totalBookingsToday },
    { title: "Visitors Today",   value: stats?.totalVisitorsToday },
    { title: "Cancelled Today",  value: stats?.cancelledToday },
    { title: "Full Slots",       value: stats?.fullSlots },
    { title: "Active Slots",     value: stats?.activeSlots },
    { title: "Members Today",    value: stats?.totalMembersToday },
  ];

  const statusClass = (s) => s === "booked" ? "status-booked" : s === "used" ? "status-used" : "status-cancelled";

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {statItems.map((s, i) => (
          <div key={i} className="card-base p-5 text-center group hover:shadow-soft-md">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto mb-3 text-xl group-hover:bg-rose-100 transition-colors">
              {statIcons[i]}
            </div>
            <p className="font-serif text-2xl font-semibold text-warm-800">{s.value ?? 0}</p>
            <p className="text-xs text-warm-400 mt-1 leading-tight">{s.title}</p>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Bookings Table */}
        <div className="xl:col-span-2 card-base p-6">
          <h3 className="font-serif text-lg font-semibold text-warm-800 mb-5">Recent Bookings</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-rose-100">
                  {["ID","User","Temple","Status"].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold uppercase tracking-wider text-warm-300 pb-3 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-50">
                {bookings.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-8 text-warm-300 text-sm">No bookings yet</td></tr>
                ) : bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-rose-25 transition-colors">
                    <td className="py-3 pr-4 text-xs font-mono text-warm-400">{b.bookingId}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-rose-100 flex items-center justify-center text-blush-400 text-xs font-semibold">
                          {b.user?.name?.charAt(0)}
                        </div>
                        <span className="text-sm text-warm-700">{b.user?.name}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-sm text-warm-600">{b.slot?.temple?.name}</td>
                    <td className="py-3"><span className={statusClass(b.status)}>{b.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-5">
          {/* Cancelled */}
          <div className="card-base p-6">
            <h3 className="font-serif text-lg font-semibold text-warm-800 mb-4">Cancelled Bookings</h3>
            <div className="space-y-3">
              {cancelled.slice(0,5).map((c) => (
                <div key={c._id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-300 text-xs flex-shrink-0">✖</div>
                  <div>
                    <p className="text-sm font-medium text-warm-700">{c.user?.name}</p>
                    <p className="text-xs text-warm-300">{c.slot?.temple?.name}</p>
                  </div>
                </div>
              ))}
              {cancelled.length === 0 && <p className="text-sm text-warm-300 text-center py-4">No cancellations</p>}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card-base p-6">
            <h3 className="font-serif text-lg font-semibold text-warm-800 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              {[["Total Users", stats?.totalUsers], ["Total Bookings", stats?.totalBookings], ["Cancelled", stats?.cancelledToday]].map(([t, v]) => (
                <div key={t} className="flex justify-between items-center py-2 border-b border-rose-50 last:border-0">
                  <span className="text-sm text-warm-500">{t}</span>
                  <span className="font-serif text-lg font-semibold text-warm-800">{v ?? 0}</span>
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
