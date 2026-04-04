import { useState } from "react";
import API from "../api/axios";

const GateBookings = () => {
  const [date, setDate] = useState("");
  const [bookings, setBookings] = useState([]);

  const fetchBookings = async () => {
    if (!date) {
      alert("Select date");
      return;
    }

    try {
      const res = await API.get(
        `/gates/bookings-by-date?date=${date}`
      );
      setBookings(res.data);
    } catch (err) {
      alert("Error fetching bookings");
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Bookings By Date</h2>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ padding: "8px", marginRight: "10px" }}
        />
        <button onClick={fetchBookings}>Search</button>
      </div>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Booking ID</th>
            <th>User</th>
            <th>Temple</th>
            <th>Slot</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {bookings.map((b) => (
            <tr key={b._id}>
              <td>{b.bookingId}</td>
              <td>{b.user?.name}</td>
              <td>{b.slot?.temple?.name}</td>
              <td>
                {b.slot?.startTime} - {b.slot?.endTime}
              </td>
              <td>{b.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GateBookings;
