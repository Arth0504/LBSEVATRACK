import { useState } from "react";
import API from "../api/axios";
import { Search } from "lucide-react";

const GateBookings = () => {
  const [date, setDate] = useState("");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBookings = async () => {
    if (!date) { alert("Select date"); return; }
    setLoading(true);
    try {
      const res = await API.get(`/gates/bookings-by-date?date=${date}`);
      setBookings(res.data);
    } catch { alert("Error fetching bookings"); }
    finally { setLoading(false); }
  };

  const statusClass = (s) => s === "booked" ? "status-booked" : s === "used" ? "status-used" : "status-cancelled";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-warm-800">Today's Bookings</h1>
        <p className="text-warm-400 text-sm mt-1">View all bookings for a specific date</p>
      </div>

      <div className="card-base p-6">
        <div className="flex gap-3 flex-wrap">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-base max-w-xs" />
          <button onClick={fetchBookings} className="btn-primary gap-2">
            <Search size={16} /> Search
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-rose-200 border-t-blush-400 rounded-full animate-spin" />
        </div>
      ) : bookings.length > 0 ? (
        <div className="card-base overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-rose-25 border-b border-rose-100">
                <tr>
                  {["Booking ID","User","Temple","Slot Time","Status"].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold uppercase tracking-wider text-warm-300 px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-50">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-rose-25 transition-colors">
                    <td className="px-5 py-3 text-xs font-mono text-warm-400">{b.bookingId}</td>
                    <td className="px-5 py-3 text-sm text-warm-700">{b.user?.name}</td>
                    <td className="px-5 py-3 text-sm text-warm-600">{b.slot?.temple?.name}</td>
                    <td className="px-5 py-3 text-sm text-warm-500">{b.slot?.startTime} – {b.slot?.endTime}</td>
                    <td className="px-5 py-3"><span className={statusClass(b.status)}>{b.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : date ? (
        <div className="card-soft p-12 text-center">
          <div className="text-4xl mb-3">📅</div>
          <p className="text-warm-400">No bookings found for this date</p>
        </div>
      ) : null}
    </div>
  );
};

export default GateBookings;
