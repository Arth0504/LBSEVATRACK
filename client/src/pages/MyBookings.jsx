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

  // 🔥 PREMIUM PDF
  const downloadReceipt = async (data) => {
    const doc = new jsPDF();

    // Header
    doc.setFillColor(214, 40, 40);
    doc.rect(0, 0, 210, 30, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text("SevaTrack Darshan Receipt", 105, 18, { align: "center" });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);

    let y = 40;

    const line = (label, value) => {
      doc.text(label, 20, y);
      doc.text(":", 80, y);
      doc.text(String(value || "N/A"), 90, y);
      y += 8;
    };

    line("Booking ID", data.bookingId);
    line("Temple", data.slot?.temple?.name);
    line("Location", data.slot?.temple?.location);
    line("Date", new Date(data.slot?.date).toDateString());
    line("Members", data.totalMembers);
    line("Status", data.status.toUpperCase());

    y += 5;
    doc.line(20, y, 190, y);
    y += 10;

    // Devotee
    doc.setFontSize(14);
    doc.text("Devotee Details", 20, y);
    y += 8;

    doc.setFontSize(12);

    data.members?.forEach((m, i) => {
      doc.text(`${i + 1}. ${m.fullName} (${m.age}, ${m.gender})`, 20, y);
      y += 7;
    });

    // QR Section
    y += 10;
    doc.setFontSize(13);
    doc.text("Scan QR at Entry", 105, y, { align: "center" });

    if (data.qrCode) {
      const img = await loadImage(data.qrCode);
      doc.addImage(img, "PNG", 75, y + 5, 60, 60);
    }

    // Instructions Box
    y += 75;
    doc.setFillColor(255, 243, 205);
    doc.roundedRect(20, y - 5, 170, 35, 5, 5, "F");

    doc.setFontSize(12);
    doc.text("Instructions:", 25, y);

    y += 8;
    const instructions = [
      "Arrive 15 minutes early",
      "Carry valid ID proof",
      "Show QR at entry gate",
    ];

    instructions.forEach((t) => {
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

            <h3>{b.slot?.temple?.name}</h3>

            <p>📅 {new Date(b.slot?.date).toLocaleDateString()}</p>
            <p>🆔 {b.bookingId}</p>

            <span className={`status ${b.status}`}>
              {b.status}
            </span>

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