import { useState, useEffect } from "react";
import API from "../api/axios";
import "./gate.css";

const GatePanel = () => {
  const [bookingId, setBookingId] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [activity, setActivity] = useState(null);

  useEffect(() => {
    fetchTodayActivity();
  }, []);

  const fetchTodayActivity = async () => {
    try {
      const res = await API.get("/admin/gate-activity");
      setActivity(res.data);
    } catch (err) {
      console.log("Activity fetch failed");
    }
  };

  const handleVerify = async () => {
    try {
      setError("");
      setResult(null);

      const res = await API.post("/gates/verify", {
        bookingId,
        selectedDate,
      });

      setResult(res.data.booking);
      setBookingId("");
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    }
  };

  return (
    <div className="gate-wrapper">

      <h2>Gate Verification Panel</h2>

      {/* Date Selector */}
      <div className="date-box">
        <label>Select Date</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      {/* Booking Input */}
      <div className="verify-box">
        <input
          type="text"
          placeholder="Enter Booking ID"
          value={bookingId}
          onChange={(e) => setBookingId(e.target.value)}
        />
        <button onClick={handleVerify}>Verify Entry</button>
      </div>

      {/* Result */}
      {result && (
        <div className="success-card">
          <h3>Entry Allowed</h3>
          <p><strong>Name:</strong> {result.userName}</p>
          <p><strong>Temple:</strong> {result.templeName}</p>
          <p><strong>Slot:</strong> {result.slotTime}</p>
          <p><strong>Members:</strong> {result.totalMembers}</p>
        </div>
      )}

      {error && <div className="error-card">{error}</div>}

      {/* Activity Card */}
      {activity && (
        <div className="activity-card">
          <h3>Today's Activity</h3>
          <p>Total Entries: {activity.totalEntriesToday}</p>
        </div>
      )}
    </div>
  );
};

export default GatePanel;
