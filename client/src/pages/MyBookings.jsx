import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import jsPDF from "jspdf";
import Navbar from "../components/Navbar";
import { Download, X, ArrowLeft } from "lucide-react";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => { API.get("/bookings/my").then((r) => setBookings(r.data)).catch(() => {}); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel booking?")) return;
    try { await API.put(`/bookings/cancel/${id}`); API.get("/bookings/my").then((r) => setBookings(r.data)); }
    catch { alert("Cancel failed"); }
  };

  const downloadReceipt = async (data) => {
    const doc = new jsPDF();
    doc.setFontSize(20); doc.setTextColor(200, 0, 0);
    doc.text("SevaTrack Darshan Receipt", 105, 20, { align: "center" });
    doc.setTextColor(0,0,0); doc.setFontSize(12);
    let y = 40;
    const line = (l, v) => { doc.text(`${l}:`, 20, y); doc.text(String(v || "N/A"), 90, y); y += 10; };
    const slotTime = data.slot?.startTime && data.slot?.endTime ? `${data.slot.startTime} - ${data.slot.endTime}` : "N/A";
    line("Booking ID", data.bookingId); line("Temple", data.slot?.temple?.name);
    line("Date", new Date(data.slot?.date).toDateString()); line("Time", slotTime);
    line("Members", data.totalMembers); line("Status", data.status);
    doc.save(`SevaTrack_${data.bookingId}.pdf`);
  };

  const statusClass = (s) => s === "booked" ? "status-booked" : s === "used" ? "status-used" : "status-cancelled";

  return (
    <div className="min-h-screen bg-rose-25 bg-mesh">
      <Navbar />

      <div className="max-w-5xl mx-auto px-5 md:px-8 py-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl text-warm-400 hover:bg-rose-100 hover:text-blush-400 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-serif text-3xl font-semibold text-warm-800">My Bookings</h1>
            <p className="text-warm-400 text-sm mt-0.5">Your darshan history and upcoming visits</p>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="card-base p-16 text-center">
            <div className="text-5xl mb-4">📅</div>
            <h3 className="font-serif text-xl text-warm-700 mb-2">No bookings yet</h3>
            <p className="text-warm-400 text-sm mb-6">Start your divine journey by booking a darshan slot</p>
            <button onClick={() => navigate("/temples")} className="btn-primary px-8 py-3">Book Darshan 🙏</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {bookings.map((b) => (
              <div key={b._id} className="card-base p-6 flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <h3 className="font-serif text-lg font-semibold text-warm-800 leading-tight">{b.slot?.temple?.name}</h3>
                  <span className={statusClass(b.status)}>{b.status}</span>
                </div>

                {/* Details */}
                <div className="space-y-1.5">
                  <p className="text-sm text-warm-500">📅 {new Date(b.slot?.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
                  <p className="text-sm text-warm-400 font-mono text-xs">🆔 {b.bookingId}</p>
                  <p className="text-sm text-warm-500">👥 {b.totalMembers} member{b.totalMembers > 1 ? "s" : ""}</p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 mt-auto pt-2 border-t border-rose-50">
                  <button onClick={() => downloadReceipt(b)} className="btn-secondary flex-1 py-2.5 text-xs gap-1.5">
                    <Download size={13} /> Receipt
                  </button>
                  {b.status === "booked" && (
                    <button onClick={() => handleCancel(b._id)} className="btn-ghost flex-1 py-2.5 text-xs gap-1.5 text-warm-400 hover:text-rose-400 hover:border-rose-200">
                      <X size={13} /> Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
