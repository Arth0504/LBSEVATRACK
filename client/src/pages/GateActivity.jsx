import { useEffect, useState } from "react";
import API from "../api/axios";
import { toast } from "react-toastify";
import { Activity, CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";

const ACCENT = "#dd2d4a";

const GateActivity = () => {
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchActivity(); }, []);

  const fetchActivity = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const res = await API.get("/gates/my-activity");
      setActivity(res.data);
    } catch { toast.error("Failed to load activity"); }
    finally { setLoading(false); setRefreshing(false); }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-gray-200 rounded-full animate-spin" style={{ borderTopColor: ACCENT }} />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">My Activity</h1>
          <p className="page-sub">Your gate verification statistics</p>
        </div>
        <button
          onClick={() => fetchActivity(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-500 border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {!activity ? (
        <div className="card p-16 text-center">
          <Activity size={40} className="mx-auto mb-3 text-gray-200" />
          <p className="text-gray-400">No activity data available</p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card p-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: "#fff0f2", border: "1px solid #ffadb8" }}>
                <Activity size={18} style={{ color: ACCENT }} />
              </div>
              <p className="font-serif text-3xl font-bold text-gray-800">{activity.totalEntriesToday ?? 0}</p>
              <p className="text-sm text-gray-400 mt-1">Entries Today</p>
            </div>

            <div className="card p-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-emerald-50 border border-emerald-200">
                <CheckCircle size={18} className="text-emerald-600" />
              </div>
              <p className="font-serif text-3xl font-bold text-gray-800">{activity.approvedToday ?? 0}</p>
              <p className="text-sm text-gray-400 mt-1">Approved</p>
            </div>

            <div className="card p-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-red-50 border border-red-200">
                <XCircle size={18} className="text-red-500" />
              </div>
              <p className="font-serif text-3xl font-bold text-gray-800">{activity.rejectedToday ?? 0}</p>
              <p className="text-sm text-gray-400 mt-1">Rejected</p>
            </div>
          </div>

          {/* Recent entries */}
          {activity.recentEntries?.length > 0 && (
            <div className="card overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-serif text-lg font-bold text-gray-800">Recent Entries</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {activity.recentEntries.map((entry, i) => (
                  <div key={i} className="flex items-center justify-between px-6 py-4 hover:bg-gray-25 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${entry.status === "approved" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-red-50 text-red-500 border border-red-200"}`}>
                        {entry.status === "approved" ? "✓" : "✕"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{entry.userName || "Unknown"}</p>
                        <p className="text-xs text-gray-400">{entry.bookingId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Clock size={12} />
                      {entry.time || new Date(entry.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GateActivity;
