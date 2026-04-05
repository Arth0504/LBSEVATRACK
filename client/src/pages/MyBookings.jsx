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
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this booking?"
    );
    if (!confirmCancel) return;

    try {
      await API.put(`/bookings/cancel/${id}`);
      alert("Booking Cancelled Successfully");
      fetchBookings();
    } catch (error) {
      alert(error.response?.data?.message || "Cancel failed");
    }
  };

  // 🔥 NEW PDF FUNCTION (NO BACKEND NEEDED)
  const downloadReceipt = async (id) => {
    try {
      const res = await API.get(`/receipts/${id}`);
      const data = res.data;

      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text("SevaTrack Darshan Receipt", 20, 20);

      doc.setFontSize(12);
      doc.text(`Booking ID: ${data.bookingId}`, 20, 30);
      doc.text(`Temple: ${data.slot?.temple?.name || "N/A"}`, 20, 40);
      doc.text(`Location: ${data.slot?.temple?.location || "N/A"}`, 20, 50);
      doc.text(
        `Date: ${new Date(data.slot?.date).toDateString()}`,
        20,
        60
      );
      doc.text(`Total Members: ${data.totalMembers}`, 20, 70);
      doc.text(`Status: ${data.status}`, 20, 80);

      // Members list
      let y = 100;
      doc.text("Members:", 20, 90);

      data.members?.forEach((m, index) => {
        doc.text(
          `${index + 1}. ${m.fullName} | Age: ${m.age} | ${m.gender}`,
          20,
          y
        );
        y += 10;
      });

      doc.save(`SevaTrack_${data.bookingId}.pdf`);

    } catch (error) {
      console.log(error);
      alert("Receipt download failed");
    }
  };

  return (
    <div style={{ padding: "40px" }}>

      {/* 🔙 BACK BUTTON */}
      <button
        onClick={() => navigate(-1)}
        style={{
          marginBottom: "20px",
          background: "#333",
          color: "white",
          border: "none",
          padding: "8px 15px",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        ← Back
      </button>

      <h2>My Bookings</h2>

      {bookings.length === 0 ? (
        <p>No bookings found</p>
      ) : (
        bookings.map((b) => (
          <div
            key={b._id}
            style={{
              border: "1px solid #ddd",
              padding: "20px",
              marginBottom: "20px",
              borderRadius: "10px",
            }}
          >
            <p><strong>Booking ID:</strong> {b.bookingId}</p>
            <p><strong>Temple:</strong> {b.slot?.temple?.name}</p>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(b.slot?.date).toLocaleDateString()}
            </p>
            <p><strong>Total Members:</strong> {b.totalMembers}</p>
            <p>
              <strong>Status:</strong>{" "}
              <span
                style={{
                  color:
                    b.status === "booked"
                      ? "green"
                      : b.status === "cancelled"
                      ? "red"
                      : "blue",
                }}
              >
                {b.status}
              </span>
            </p>

            <div style={{ marginTop: "10px" }}>
              <button
                onClick={() => downloadReceipt(b._id)}
                style={{
                  background: "#e04a4a",
                  color: "white",
                  border: "none",
                  padding: "8px 15px",
                  borderRadius: "5px",
                  cursor: "pointer",
                  marginRight: "10px",
                }}
              >
                Download Receipt
              </button>

              {b.status === "booked" && (
                <button
                  onClick={() => handleCancel(b._id)}
                  style={{
                    background: "black",
                    color: "white",
                    border: "none",
                    padding: "8px 15px",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Cancel Booking
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MyBookings;