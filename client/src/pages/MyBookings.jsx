import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import jsPDF from "jspdf";
import "./myBookings.css";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await API.get("/bookings/my");
      setBookings(res.data);
    } catch (error) {
      console.log("Error fetching bookings");
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel booking?")) return;

    try {
      await API.put(`/bookings/cancel/${id}`);
      fetchBookings();
    } catch {
      alert("Cancel failed");
    }
  };

  const loadImage = (url) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = url;
      img.onload = () => resolve(img);
    });
  };

  // 🔥 FINAL RECEIPT
  const downloadReceipt = async (data) => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setTextColor(200, 0, 0);
    doc.text("SevaTrack Darshan Receipt", 105, 20, { align: "center" });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);

    let y = 40;

    const line = (label, value) => {
      doc.text(`${label}:`, 20, y);
      doc.text(String(value || "N/A"), 90, y);
      y += 10;
    };

    // 🔥 SLOT TIME FIX
    const slotTime =
      data.slot?.time ||
      data.slot?.slotTime ||
      (data.slot?.startTime && data.slot?.endTime
        ? `${data.slot.startTime} - ${data.slot.endTime}`
        : null);

    line("Booking ID", data.bookingId);
    line("Temple", data.slot?.temple?.name);
    line("Location", data.slot?.temple?.location);
    line("Darshan Date", new Date(data.slot?.date).toDateString());
    line("Slot Time", slotTime || "N/A");
    line("Total Members", data.totalMembers);
    line("Status", data.status);

    y += 5;
    doc.line(20, y, 190, y);
    y += 10;

    // DEVOTEE
    doc.setFontSize(14);
    doc.text("Devotee Details", 20, y);
    y += 10;

    doc.setFontSize(12);
    doc.text("Name", 20, y);
    doc.text("Age", 80, y);
    doc.text("Gender", 120, y);
    doc.text("Category", 160, y);

    y += 5;
    doc.line(20, y, 190, y);
    y += 8;

    data.members?.forEach((m) => {
      doc.text(m.fullName, 20, y);
      doc.text(String(m.age), 80, y);
      doc.text(m.gender, 120, y);
      doc.text(m.category || "adult", 160, y);
      y += 8;
    });

    // QR
    y += 10;
    doc.setFontSize(14);
    doc.text("Scan QR at Entry", 105, y, { align: "center" });

    if (data.qrCode) {
      const img = await loadImage(data.qrCode);
      doc.addImage(img, "PNG", 80, y + 5, 50, 50);
    }

    // INSTRUCTIONS
    y += 70;
    doc.setFillColor(255, 243, 205);
    doc.rect(20, y - 5, 170, 35, "F");

    doc.setFontSize(12);
    doc.text("Instructions:", 25, y);

    y += 8;
    [
      "Please arrive 15 minutes before slot time.",
      "Carry valid ID proof.",
      "Show QR code at entry gate."
    ].forEach((t) => {
      doc.text("• " + t, 25, y);
      y += 6;
    });

    doc.save(`SevaTrack_${data.bookingId}.pdf`);
  };

  return (
    <div className="my-bookings">

      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h2>My Bookings</h2>

      <div className="booking-grid">
        {bookings.map((b) => (
          <div key={b._id} className="booking-card">

            <div className="card-header">
              <h3>{b.slot?.temple?.name}</h3>
              <span className={`status ${b.status}`}>
                {b.status}
              </span>
            </div>

            <div className="card-body">
              <p>📅 {new Date(b.slot?.date).toLocaleDateString()}</p>
              <p>🆔 {b.bookingId}</p>
            </div>

            <div className="card-buttons">
              <button
                className="download-btn"
                onClick={() => downloadReceipt(b)}
              >
                Download
              </button>

              <button
                className="cancel-btn"
                onClick={() => handleCancel(b._id)}
              >
                Cancel
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default MyBookings;