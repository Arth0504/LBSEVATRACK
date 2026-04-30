import { useState } from "react";
import API from "../api/axios";
import { Search, Calendar } from "lucide-react";

const GateBookings = () => {
  const [date, setDate] = useState("");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetch = async () => {
    if (!date) { alert("Select a date"); return; }
    setLoading(true);
    try { const r = await API.get(`/gates/bookings-by-date?date=${date}`); setBookings(r.data); }
    catch { alert("Error fetching bookings"); }
    finally { setLoading(false); }
  };

  const statusCls = s => s === "booked" ? "status-booked" : s === "used" ? "status-used" : "status-cancelled";

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Today's Bookings</h1>
        <p className="page-sub">View all bookings for a specific date</p>
      </div>

      <div className="card p-6 shadow-sm">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="label">Select Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input w-auto" />
          </div>
          <button onClick={fetch} className="btn-primary gap-2 py-3">
            <Search size={16} /> Search
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-stone-200 border-t-primary-500 rounded-full animate-spin" />
        </div>
      ) : bookings.length > 0 ? (
        <div className="card shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-stone-800">Results</h3>
            <span className="badge-stone">{bookings.length} bookings</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {["Booking ID","User","Temple","Slot Time","Status"].map(h => (
                    <th key={h} className="table-head-cell">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b._id} className="hover:bg-stone-50 transition-colors">
                    <td className="table-cell font-mono text-xs text-stone-400">{b.bookingId}</td>
                    <td className="table-cell font-medium text-stone-700">{b.user?.name}</td>
                    <td className="table-cell text-stone-600">{b.slot?.temple?.name}</td>
                    <td className="table-cell text-stone-500">{b.slot?.startTime} – {b.slot?.endTime}</td>
                    <td className="table-cell"><span className={statusCls(b.status)}>{b.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : date ? (
        <div className="card p-14 text-center shadow-sm">
          <Calendar size={36} className="text-stone-200 mx-auto mb-3" />
          <p className="text-stone-400 font-medium">No bookings found for this date</p>
        </div>
      ) : null}
    </div>
  );
};

export default GateBookings;
