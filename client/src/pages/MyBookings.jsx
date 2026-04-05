import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import jsPDF from "jspdf";

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

  // 🔥 QR loader
  const loadImage = (url) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = url;
      img.onload = () => resolve(img);
    });
  };

  // 🔥 FINAL PDF
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

    line("Booking ID", data.bookingId);
    line("Temple", data.slot?.temple?.name);
    line("Location", data.slot?.temple?.location);
    line("Date", new Date(data.slot?.date).toDateString());
    line("Members", data.totalMembers);
    line("Status", data.status);

    y += 5;
    doc.line(20, y, 190, y);
    y += 10;

    doc.setFontSize(14);
    doc.text("Devotee Details", 20, y);
    y += 10;

    doc.setFontSize(12);
    doc.text("Name", 20, y);
    doc.text("Age", 90, y);
    doc.text("Gender", 130, y);

    y += 5;
    doc.line(20, y, 190, y);
    y += 8;

    data.members?.forEach((m) => {
      doc.text(m.fullName, 20, y);
      doc.text(String(m.age), 90, y);
      doc.text(m.gender, 130, y);
      y += 8;
    });

    // 📱 QR
    y += 10;
    doc.setFontSize(14);
    doc.text("Scan QR at Entry", 105, y, { align: "center" });

    if (data.qrCode) {
      const img = await loadImage(data.qrCode);
      doc.addImage(img, "PNG", 80, y + 5, 50, 50);
    }

    // 📦 Instructions
    y += 70;
    doc.setFillColor(255, 243, 205);
    doc.rect(20, y - 5, 170, 35, "F");

    doc.setFontSize(12);
    doc.text("Instructions:", 25, y);

    y += 8;
    ["Arrive early", "Carry ID", "Show QR"].forEach((t) => {
      doc.text("• " + t, 25, y);
      y += 6;
    });

    doc.save(`SevaTrack_${data.bookingId}.pdf`);
  };

  return (
    <div style={{ padding: 40 }}>
      <button onClick={() => navigate(-1)}>← Back</button>

      <h2>My Bookings</h2>

      {bookings.map((b) => (
        <div key={b._id} style={{ border: "1px solid #ddd", padding: 20 }}>
          <p><b>ID:</b> {b.bookingId}</p>
          <p><b>Temple:</b> {b.slot?.temple?.name}</p>
          <p><b>Date:</b> {new Date(b.slot?.date).toLocaleDateString()}</p>

          <button onClick={() => downloadReceipt(b)}>
            Download Receipt
          </button>

          <button onClick={() => handleCancel(b._id)}>
            Cancel
          </button>
        </div>
      ))}
    </div>
  );
};

export default MyBookings;