import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import jsPDF from "jspdf";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";
import { Download, X, ArrowLeft, Calendar, Hash, Users, BookOpen } from "lucide-react";

const ACCENT = "#dd2d4a";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/bookings/my")
      .then(r => setBookings(r.data))
      .catch(() => toast.error("Failed to load bookings"))
      .finally(() => setLoading(false));
  }, []);

  const cancel = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      await API.put(`/bookings/cancel/${id}`);
      toast.success("Booking cancelled");
      const res = await API.get("/bookings/my");
      setBookings(res.data);
    } catch { toast.error("Cancel failed"); }
  };

  const download = async (data) => {
    const doc = new jsPDF();
    doc.setFontSize(20); doc.setTextColor(221, 45, 74);
    doc.text("SevaTrack Darshan Receipt", 105, 20, { align: "center" });
    doc.setTextColor(0, 0, 0); doc.setFontSize(12);
    let y = 40;
    const line = (l, v) => { doc.text(`${l}:`, 20, y); doc.text(String(v || "N/A"), 90, y); y += 10; };
    const t = data.slot?.startTime && data.slot?.endTime ? `${data.slot.startTime} - ${data.slot.endTime}` : "N/A";
    line("Booking ID", data.bookingId);
    line("Temple", data.slot?.temple?.name);
    line("Location", data.slot?.temple?.location);
    line("Date", new Date(data.slot?.date).toDateString());
    line("Time", t);
    line("Members", data.totalMembers);
    line("Status", data.status);
    y += 5; doc.line(20, y, 190, y); y += 10;
    doc.setFontSize(14); doc.text("Devotee Details", 20, y); y += 10;
    doc.setFontSize(12);
    doc.text("Name", 20, y); doc.text("Age", 80, y); doc.text("Gender", 120, y); doc.text("Category", 160, y);
    y += 5; doc.line(20, y, 190, y); y += 8;
    data.members?.forEach(m => {
      doc.text(m.fullName, 20, y); doc.text(String(m.age), 80, y); doc.text(m.gender, 120, y); doc.text(m.category || "adult", 160, y);
      y += 8;
    });
    y += 10;
    doc.setFontSize(11);
    ["Please arrive 15 minutes before slot time.", "Carry valid ID proof.", "Show QR code at entry gate."].forEach(t => {
      doc.text("• " + t, 20, y); y += 7;
    });
    doc.save(`SevaTrack_${data.bookingId}.pdf`);
    toast.success("Receipt downloaded ✓");
  };

  const statusBar = (s) => s === "booked" ? "bg-emerald-400" : s === "used" ? "bg-blue-400" : "bg-red-300";
  const statusCls = (s) => s === "booked" ? "status-booked" : s === "used" ? "status-used" : "status-cancelled";

  return (
    <div className="min-h-screen bg-white bg-animated">
      <Navbar />

      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="section-container py-10">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-5">
            <ArrowLeft size={15} /> Back
          </button>
          <h1 className="font-serif text-3xl font-bold text-gray-800">My Bookings</h1>
          <p className="text-gray-400 mt-1.5 text-sm">{bookings.length} booking{bookings.length !== 1 ? "s" : ""} found</p>
        </div>
      </div>

      <div className="section-container py-10">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-gray-200 rounded-full animate-spin" style={{ borderTopColor: ACCENT }} />
          </div>
        ) : bookings.length === 0 ? (
          <div className="card p-16 text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "#fff0f2", border: "1px solid #ffadb8" }}>
              <BookOpen size={28} style={{ color: ACCENT }} />
            </div>
            <h3 className="font-serif text-xl font-bold text-gray-800 mb-2">No bookings yet</h3>
            <p className="text-gray-400 text-sm mb-6">Start your divine journey by booking a darshan slot</p>
            <button onClick={() => navigate("/temples")} className="btn-primary px-8 py-3">Book Darshan 🙏</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {bookings.map(b => (
              <div key={b._id} className="card overflow-hidden hover:shadow-md transition-all duration-300">
                {/* Status bar */}
                <div className={`h-1 w-full ${statusBar(b.status)}`} />

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-serif text-lg font-bold text-gray-800 leading-tight pr-2">{b.slot?.temple?.name}</h3>
                    <span className={statusCls(b.status)}>{b.status}</span>
                  </div>

                  <div className="space-y-2 mb-5">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar size={13} className="flex-shrink-0" style={{ color: ACCENT }} />
                      {new Date(b.slot?.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                    </div>
                    {b.slot?.startTime && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="text-xs" style={{ color: ACCENT }}>⏰</span>
                        {b.slot.startTime} – {b.slot.endTime}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
                      <Hash size={12} className="text-gray-300 flex-shrink-0" />
                      {b.bookingId}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Users size={13} className="text-gray-300 flex-shrink-0" />
                      {b.totalMembers} member{b.totalMembers > 1 ? "s" : ""}
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-4 border-t border-gray-100">
                    <button onClick={() => download(b)} className="btn-secondary flex-1 py-2.5 text-xs gap-1.5">
                      <Download size={13} /> Receipt
                    </button>
                    {b.status === "booked" && (
                      <button onClick={() => cancel(b._id)} className="btn-danger flex-1 py-2.5 text-xs gap-1.5">
                        <X size={13} /> Cancel
                      </button>
                    )}
                  </div>
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
