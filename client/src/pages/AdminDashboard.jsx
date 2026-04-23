import { useEffect, useState, useRef } from "react";
import API from "../api/axios";
import "./admin.css";
import { toast } from "react-toastify";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [cancelled, setCancelled] = useState([]);
  const [loading, setLoading] = useState(true);

  const firstLoad = useRef(true);

  useEffect(() => {
    fetchAll();

    const interval = setInterval(fetchAll, 30000); // 🔥 30 sec
    return () => clearInterval(interval);
  }, []);

  const fetchAll = async () => {
    try {
      if (firstLoad.current) setLoading(true);

      const [statsRes, bookingRes, cancelRes] =
        await Promise.all([
          API.get("/admin/dashboard"),
          API.get("/admin/recent-bookings"),
          API.get("/admin/cancelled-bookings"),
        ]);

      setStats(statsRes.data);
      setBookings(bookingRes.data);
      setCancelled(cancelRes.data);

      // ✅ Only first time toast
      if (firstLoad.current) {
        toast.success("Dashboard Loaded");
        firstLoad.current = false;
      }

    } catch (err) {
      console.error("Dashboard Error:", err);
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loader"></div>
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-wrapper">
      <div className="admin-bg-glow"></div>

      <div className="admin-content">
        <div className="content-wrapper">
          <div className="dashboard-container">

            {/* STATS */}
            <div className="stats-grid">
              <Stat title="Today's Bookings" value={stats?.totalBookingsToday} type="stat-coral"/>
              <Stat title="Visitors Today" value={stats?.totalVisitorsToday} type="stat-blue"/>
              <Stat title="Cancelled Today" value={stats?.cancelledToday} type="stat-red"/>
              <Stat title="Full Slots" value={stats?.fullSlots} type="stat-var(--color-primary)"/>
              <Stat title="Active Slots" value={stats?.activeSlots} type="stat-green"/>
              <Stat title="Members Today" value={stats?.totalMembersToday} type="stat-purple"/>
            </div>

            {/* MAIN GRID */}
            <div className="dashboard-main-grid">

              {/* TABLE */}
              <div className="table-section">
                <div className="table-header">
                  <h3>Recent Bookings</h3>
                </div>

                <div className="table-responsive">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>User</th>
                        <th>Temple</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {bookings.length === 0 ? (
                        <tr>
                          <td colSpan="4">No bookings</td>
                        </tr>
                      ) : (
                        bookings.map((b) => (
                          <tr key={b._id}>
                            <td>{b.bookingId}</td>

                            <td>
                              <div className="user-cell">
                                <div className="user-avatar">
                                  {b.user?.name?.charAt(0)}
                                </div>
                                {b.user?.name}
                              </div>
                            </td>

                            <td>{b.slot?.temple?.name}</td>

                            <td>
                              <span className={`status-badge ${b.status}`}>
                                {b.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SIDE PANEL */}
              <div className="side-panel">

                <div className="recent-activity-container">
                  <h3>Cancelled Bookings</h3>

                  <div className="activity-list">
                    {cancelled.slice(0,5).map((c) => (
                      <div className="activity-item" key={c._id}>
                        <div className="activity-icon cancelled-icon">✖</div>

                        <div>
                          <div className="activity-title">
                            {c.user?.name}
                          </div>
                          <div className="activity-sub">
                            {c.slot?.temple?.name}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="ranking-container">
                  <h3>Quick Stats</h3>

                  <div className="ranking-list">
                    <MiniStat title="Total Users" value={stats?.totalUsers}/>
                    <MiniStat title="Total Bookings" value={stats?.totalBookings}/>
                    <MiniStat title="Cancelled" value={stats?.cancelledToday}/>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

/* COMPONENTS */

const Stat = ({ title, value, type }) => (
  <div className={`stat-card ${type}`}>
    <div className="stat-icon-wrapper">📊</div>
    <div className="stat-info">
      <h3>{title}</h3>
      <p>{value ?? 0}</p>
    </div>
    <div className="stat-glow"></div>
  </div>
);

const MiniStat = ({ title, value }) => (
  <div className="ranking-card-mini">
    <h4>{title}</h4>
    <p>{value ?? 0}</p>
  </div>
);

export default AdminDashboard;