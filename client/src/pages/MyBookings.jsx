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
    const confirmCancel = window.confirm("Cancel this booking?");
    if (!confirmCancel) return;

    try {
      await API.put(`/bookings/cancel/${id}`);
      alert("Booking Cancelled");
      fetchBookings();
    } catch (error) {
      alert("Cancel failed");
    }
  };

  // 🔥 PROFESSIONAL PDF
  const downloadReceipt = (data) => {
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

    doc.save(`SevaTrack_${data.bookingId}.pdf`);
  };

  return (
    <div style={{ padding: "40px" }}>
      <button onClick={() => navigate(-1)}>← Back</button>

      <h2>My Bookings</h2>

      {bookings.map((b) => (
        <div key={b._id} style={{ border: "1px solid #ddd", padding: 20 }}>
          <p><strong>ID:</strong> {b.bookingId}</p>
          <p><strong>Temple:</strong> {b.slot?.temple?.name}</p>
          <p><strong>Date:</strong> {new Date(b.slot?.date).toLocaleDateString()}</p>

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