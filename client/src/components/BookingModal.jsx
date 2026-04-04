import { useState } from "react";
import API from "../api/axios";
import "./bookingModal.css";

const BookingModal = ({ slot, onClose }) => {
  const [members, setMembers] = useState([
    { fullName: "", age: "", gender: "" }
  ]);

  const addMember = () => {
    if (members.length < 5) {
      setMembers([...members, { fullName: "", age: "", gender: "" }]);
    }
  };

  const handleChange = (index, field, value) => {
    const updated = [...members];
    updated[index][field] = value;
    setMembers(updated);
  };

  const handleBooking = async () => {
    try {
      await API.post("/bookings", {
        slotId: slot._id,
        members,
      });

      alert("Booking Successful!");
      onClose();
    } catch (error) {
      alert(error.response?.data?.message || "Booking Failed");
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
              <option value="">Gender</option>
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
          <button onClick={handleBooking} className="confirm-btn">
            Confirm Booking
          </button>
          <button onClick={onClose} className="cancel-btn">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
