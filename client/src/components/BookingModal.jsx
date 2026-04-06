import { useState } from "react";
import API from "../api/axios";
import "./bookingModal.css";

const BookingModal = ({ slot, onClose }) => {
  const [members, setMembers] = useState([
    { fullName: "", age: "", gender: "male" }
  ]);

  const [loading, setLoading] = useState(false);

  const addMember = () => {
    if (members.length >= 5) return;
    setMembers([...members, { fullName: "", age: "", gender: "male" }]);
  };

  const handleChange = (index, field, value) => {
    const updated = [...members];
    updated[index][field] = value;
    setMembers(updated);
  };

  const handleBooking = async () => {
    try {
      if (loading) return;
      setLoading(true);

      // VALIDATION
      for (let m of members) {
        if (!m.fullName || !m.age) {
          alert("Fill all details ❌");
          setLoading(false);
          return;
        }
      }

      // 🔥 FIX: FormData use kar
      const formData = new FormData();
      formData.append("slotId", slot._id);

      const memberData = members.map((m) => ({
        fullName: m.fullName,
        age: Number(m.age),
        gender: m.gender,
      }));

      formData.append("members", JSON.stringify(memberData));

      console.log("📤 Modal Sending:", memberData);

      await API.post("/bookings", formData);

      alert("🙏 Booking Successful!");
      onClose();

    } catch (error) {
      console.log("❌ Modal Error:", error.response?.data);

      const msg = error.response?.data?.message;

      if (msg?.includes("already")) {
        alert("⚠️ You already booked this slot");
      } else {
        alert(msg || "Booking Failed ❌");
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Book Slot</h2>

        {members.map((member, index) => (
          <div key={index} className="member-form">

            <input
              type="text"
              placeholder="Full Name"
              value={member.fullName}
              onChange={(e) =>
                handleChange(index, "fullName", e.target.value)
              }
            />

            <input
              type="number"
              placeholder="Age"
              value={member.age}
              onChange={(e) =>
                handleChange(index, "age", e.target.value)
              }
            />

            <select
              value={member.gender}
              onChange={(e) =>
                handleChange(index, "gender", e.target.value)
              }
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>

          </div>
        ))}

        {members.length < 5 && (
          <button onClick={addMember} className="add-btn">
            + Add Member
          </button>
        )}

        <div className="modal-buttons">
          <button onClick={handleBooking} disabled={loading}>
            {loading ? "Booking..." : "Confirm Booking"}
          </button>

          <button onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;