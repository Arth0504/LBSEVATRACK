import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import jsPDF from "jspdf";
import { QRCodeCanvas } from "qrcode.react";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";
import { Download, X, ArrowLeft, Calendar, Hash, Users, BookOpen, QrCode } from "lucide-react";

const ACCENT = "#dd2d4a";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
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

  const generateQRData = (booking) => {
    return JSON.stringify({
      bookingId: booking.bookingId,
      userName: booking.user?.name || "N/A",
      temple: booking.slot?.temple?.name || "N/A",
      location: booking.slot?.temple?.location || "N/A",
      date: new Date(booking.slot?.date).toLocaleDateString("en-IN"),
      time: booking.slot?.startTime && booking.slot?.endTime ? `${booking.slot.startTime} - ${booking.slot.endTime}` : "N/A",
      members: booking.totalMembers,
      status: booking.status,
    });
  };

  const download = async (data) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22); doc.setTextColor(221, 45, 74);
    doc.text("SevaTrack Darshan Receipt", 105, 20, { align: "center" });
    
    // Booking details
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
    
    // Devotee details
    doc.setFontSize(14); doc.text("Devotee Details", 20, y); y += 10;
    doc.setFontSize(12);
    doc.text("Name", 20, y); doc.text("Age", 80, y); doc.text("Gender", 120, y); doc.text("Category", 160, y);
    y += 5; doc.line(20, y, 190, y); y += 8;
    
    data.members?.forEach(m => {
      doc.text(m.fullName, 20, y);
      doc.text(String(m.age), 80, y);
      doc.text(m.gender, 120, y);
      doc.text(m.category || "adult", 160, y);
      y += 8;
    });
    
    // QR Code section
    y += 10;
    doc.setFontSize(14); doc.setTextColor(221, 45, 74);
    doc.text("Scan QR Code at Entry Gate", 105, y, { align: "center" });
    y += 5;
    
    // Generate QR code and add to PDF
    const qrCanvas = document.getElementById(`qr-${data._id}`);
    if (qrCanvas) {
      const qrImage = qrCanvas.toDataURL("image/png");
      doc.addImage(qrImage, "PNG", 75, y, 60, 60);
      y += 65;
    }
    
    // Instructions
    y += 5;
    doc.setFillColor(255, 240, 242);
    doc.rect(15, y - 5, 180, 35, "F");
    doc.setFontSize(12); doc.setTextColor(0, 0, 0);
    doc.text("Important Instructions:", 20, y);
    y += 8;
    doc.setFontSize(11);
    [
      "Please arrive 15 minutes before your slot time.",
      "Carry a valid government-issued ID proof.",
      "Show this QR code at the entry gate for verification.",
      "Keep this receipt safe until your visit is complete."
    ].forEach(t => {
      doc.text("• " + t, 20, y);
      y += 6;
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

                  {/* QR Code preview */}
                  {b.status === "booked" && (
                    <div className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-150 text-center">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 flex items-center justify-center gap-1.5">
                        <QrCode size={12} /> Scan at Entry Gate
                      </p>
                      <div className="inline-block p-2 bg-white rounded-lg border border-gray-200">
                        <QRCodeCanvas
                          id={`qr-${b._id}`}
                          value={generateQRData(b)}
                          size={100}
                          level="H"
                          includeMargin={false}
                        />
                      </div>
                      <button
                        onClick={() => setSelectedBooking(b)}
                        className="text-xs mt-2 px-3 py-1 rounded-lg transition-colors hover:bg-gray-100"
                        style={{ color: ACCENT }}
                      >
                        View Full Receipt
                      </button>
                    </div>
                  )}

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

                {/* Hidden QR canvas for PDF export */}
                <div className="hidden">
                  <QRCodeCanvas
                    id={`qr-${b._id}`}
                    value={generateQRData(b)}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full Receipt Modal */}
      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.40)", backdropFilter: "blur(4px)" }}
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-fade-in"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
              <h3 className="font-serif text-lg font-bold text-gray-800">Booking Receipt</h3>
              <button onClick={() => setSelectedBooking(null)} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6 space-y-6">
              {/* QR Code */}
              <div className="text-center">
                <div className="inline-block p-4 bg-gray-50 rounded-2xl border border-gray-200">
                  <QRCodeCanvas
                    value={generateQRData(selectedBooking)}
                    size={180}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mt-3 flex items-center justify-center gap-1.5">
                  <QrCode size={12} /> Scan this code at the entry gate
                </p>
              </div>

              {/* Booking details */}
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Booking ID</span>
                  <span className="text-sm font-mono font-semibold text-gray-800">{selectedBooking.bookingId}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Temple</span>
                  <span className="text-sm font-semibold text-gray-800">{selectedBooking.slot?.temple?.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Location</span>
                  <span className="text-sm text-gray-600">{selectedBooking.slot?.temple?.location}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Date</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {new Date(selectedBooking.slot?.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                </div>
                {selectedBooking.slot?.startTime && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Time</span>
                    <span className="text-sm font-semibold text-gray-800">{selectedBooking.slot.startTime} – {selectedBooking.slot.endTime}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Total Members</span>
                  <span className="text-sm font-semibold text-gray-800">{selectedBooking.totalMembers}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-gray-500">Status</span>
                  <span className={statusCls(selectedBooking.status)}>{selectedBooking.status}</span>
                </div>
              </div>

              {/* Members list */}
              {selectedBooking.members?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Members</p>
                  <div className="space-y-2">
                    {selectedBooking.members.map((m, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{m.fullName}</p>
                          <p className="text-xs text-gray-400">{m.age} yrs · {m.gender} · {m.category || "adult"}</p>
                        </div>
                        {m.photo && (
                          <img src={m.photo} alt={m.fullName} className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="p-4 rounded-xl" style={{ background: "#fff0f2", border: "1px solid #ffadb8" }}>
                <p className="text-xs font-semibold mb-2" style={{ color: ACCENT }}>Important Instructions:</p>
                <ul className="text-xs text-gray-600 space-y-1 leading-relaxed">
                  <li>• Arrive 15 minutes before your slot time</li>
                  <li>• Carry valid government-issued ID proof</li>
                  <li>• Show this QR code at the entry gate</li>
                  <li>• Keep this receipt until your visit is complete</li>
                </ul>
              </div>

              {/* Download button */}
              <button onClick={() => download(selectedBooking)} className="btn-primary w-full py-3 gap-2">
                <Download size={16} /> Download PDF Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
