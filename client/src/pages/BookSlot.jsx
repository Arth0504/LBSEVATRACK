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
      toast.warning("Maximum 5 members allowed ⚠️");
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

  // 🔥 FINAL BOOKING FUNCTION (FIXED)
  const handleBooking = async () => {
    console.log("🔥 Button Clicked");

    try {
      // VALIDATION
      for (let m of members) {
        if (!m.fullName || !m.age) {
          toast.error("Please fill all member details ❌");
          return;
        }
      }

      // FORM DATA
      const formData = new FormData();
      formData.append("slotId", slotId);

      const memberData = members.map((m) => ({
        fullName: m.fullName,
        age: Number(m.age),
        gender: m.gender,
      }));

      formData.append("members", JSON.stringify(memberData));

      // IMAGES
      members.forEach((m) => {
        if (m.photo) {
          formData.append("images", m.photo);
        }
      });

      console.log("📤 Sending:", memberData);

      const res = await API.post("/bookings", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("✅ Success:", res.data);

      toast.success("Booking Successful 🙏");

      setTimeout(() => {
        navigate("/my-bookings");
      }, 1500);

    } catch (error) {
      console.log("❌ Error:", error);

      const msg =
        error.response?.data?.message ||
        error.message ||
        "Booking Failed ❌";

      toast.error(msg);
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

      <button type="button" onClick={handleBooking}>
        Confirm Booking
      </button>

    </div>
  );
};

export default BookSlot;