import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import "../styles/bookSlot.css";
import { toast } from "react-toastify";

const BookSlot = () => {

  const { slotId } = useParams();
  const navigate = useNavigate();

  const [members, setMembers] = useState([
    { fullName: "", age: "", gender: "male", photo: null, preview: null },
  ]);

  // 🔄 Input Change
  const handleChange = (index, field, value) => {
    const updated = [...members];
    updated[index][field] = value;
    setMembers(updated);
  };

  // 📷 Image Upload
  const handleImageChange = (index, file) => {
    const updated = [...members];
    updated[index].photo = file;
    updated[index].preview = URL.createObjectURL(file);
    setMembers(updated);
  };

  // ➕ Add Member
  const addMember = () => {
    if (members.length >= 5) {
      toast.warning("Maximum 5 members allowed ⚠️");
      return;
    }

    setMembers([
      ...members,
      { fullName: "", age: "", gender: "male", photo: null, preview: null },
    ]);
  };

  // ❌ Remove Member
  const removeMember = (index) => {
    const updated = members.filter((_, i) => i !== index);
    setMembers(updated);
  };

  // 🚀 FINAL BOOKING FUNCTION
  const handleBooking = async () => {
    try {

      // 🔥 VALIDATION
      for (let m of members) {
        if (!m.fullName || !m.age) {
          toast.error("Please fill all member details ❌");
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

      console.log("🔥 API CALL START");

      await API.post("/bookings", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("✅ SUCCESS");

      toast.success("Booking Successful 🙏");

      setTimeout(() => {
        navigate("/my-bookings");
      }, 1500);

    } catch (error) {
      console.log("❌ ERROR:", error);
      toast.error(error.response?.data?.message || "Booking Failed ❌");
    }
  };

  return (
    <div className="book-container">

      <h2>Book Your Darshan Slot</h2>

      {members.map((member, index) => {

        return (
          <div key={index} className="member-card">

            <h4>Member {index + 1}</h4>

            <input
              type="text"
              placeholder="Full Name"
              value={member.fullName}
              onChange={(e) => handleChange(index, "fullName", e.target.value)}
            />

            <input
              type="number"
              placeholder="Age"
              value={member.age}
              onChange={(e) => handleChange(index, "age", e.target.value)}
            />

            <select
              value={member.gender}
              onChange={(e) => handleChange(index, "gender", e.target.value)}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(index, e.target.files[0])}
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
        );
      })}

      <button onClick={addMember}>+ Add Member</button>

      {/* 🔥 IMPORTANT FIX */}
      <button type="button" onClick={handleBooking}>
        Confirm Booking
      </button>

    </div>
  );
};

export default BookSlot;