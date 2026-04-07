import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import "../styles/bookSlot.css";

const BookSlot = () => {
  const { slotId } = useParams();
  const navigate = useNavigate();

  const [members, setMembers] = useState([
    { fullName: "", age: "", gender: "male", photo: null, preview: null },
  ]);

  const [loading, setLoading] = useState(false);

  // INPUT CHANGE
  const handleChange = (index, field, value) => {
    const updated = [...members];
    updated[index][field] = value;
    setMembers(updated);
  };

  // IMAGE UPLOAD
  const handleImageChange = (index, file) => {
    const updated = [...members];
    updated[index].photo = file;
    updated[index].preview = URL.createObjectURL(file);
    setMembers(updated);
  };

  // ADD MEMBER
  const addMember = () => {
    if (members.length >= 5) {
      alert("Maximum 5 members allowed ⚠️");
      return;
    }

    setMembers([
      ...members,
      { fullName: "", age: "", gender: "male", photo: null, preview: null },
    ]);
  };

  // REMOVE MEMBER
  const removeMember = (index) => {
    const updated = members.filter((_, i) => i !== index);
    setMembers(updated);
  };

  // 🔥 FINAL BOOKING FUNCTION
  const handleBooking = async () => {
    try {
      if (loading) return; // prevent double click
      setLoading(true);

      // VALIDATION
      for (let m of members) {
        if (!m.fullName || !m.age) {
          alert("Please fill all details ❌");
          setLoading(false);
          return;
        }
      }

      const formData = new FormData();
      formData.append("slotId", slotId);

      const memberData = members.map((m) => ({
        fullName: m.fullName,
        age: Number(m.age),
        gender: m.gender,
      }));

      formData.append("members", JSON.stringify(memberData));

      members.forEach((m) => {
        if (m.photo) {
          formData.append("images", m.photo);
        }
      });

      console.log("📤 Sending:", memberData);
      console.log("📤 SlotId:", slotId);

      const res = await API.post("/bookings", formData);

      alert("🙏 Booking Successful!");

      navigate("/my-bookings");

    } catch (error) {
      console.log("❌ FULL ERROR:", error.response?.data);

      const msg = error.response?.data?.message;

      if (msg?.includes("already")) {
        alert("⚠️ You already booked this slot");
      } else if (msg?.includes("capacity")) {
        alert("⚠️ Slot is full");
      } else if (msg?.includes("Invalid age")) {
        alert("⚠️ Invalid age entered");
      } else if (msg?.includes("senior")) {
        alert("⚠️ This slot is only for senior citizens");
      } else {
        alert(msg || "Booking Failed ❌");
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="book-container">

      <h2>Book Your Darshan Slot</h2>

      {members.map((member, index) => (
        <div key={index} className="member-card">

          <h4>Member {index + 1}</h4>

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

          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              handleImageChange(index, e.target.files[0])
            }
          />

          {member.preview && (
            <img
              src={member.preview}
              alt="preview"
              className="preview-img"
            />
          )}

          {index > 0 && (
            <button onClick={() => removeMember(index)}>
              Remove
            </button>
          )}
        </div>
      ))}

      <button onClick={addMember}>+ Add Member</button>

      {/* 🔥 FIXED BUTTON */}
      <button onClick={handleBooking} disabled={loading}>
        {loading ? "Booking..." : "Confirm Booking"}
      </button>

    </div>
  );
};

export default BookSlot;



