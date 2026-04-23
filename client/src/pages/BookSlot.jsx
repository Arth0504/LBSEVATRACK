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

  const handleChange = (index, field, value) => {
    const updated = [...members];
    updated[index][field] = value;
    setMembers(updated);
  };

  const handleImageChange = (index, file) => {
    const updated = [...members];
    updated[index].photo = file;
    updated[index].preview = URL.createObjectURL(file);
    setMembers(updated);
  };

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

  const removeMember = (index) => {
    const updated = members.filter((_, i) => i !== index);
    setMembers(updated);
  };

  const handleBooking = async () => {
    try {
      if (loading) return;
      setLoading(true);

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

      await API.post("/bookings", formData);

      setTimeout(() => {
        alert("🙏 Booking Successful!");
        navigate("/my-bookings");
      }, 800);

    } catch (error) {
      const msg = error.response?.data?.message;

      setTimeout(() => {
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
      }, 800);

    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 800);
    }
  };

  return (
    <>
      {/* 🔥 FULL SCREEN LOADER */}
      {loading && (
        <div className="full-loader">
          <div className="loader-box">
            <div className="spinner"></div>
            <h3>Please wait a moment...</h3>
            <p>Your booking is being processed</p>
          </div>
        </div>
      )}

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
              <button 
                onClick={() => removeMember(index)}
                style={{ alignSelf: 'flex-start', color: 'var(--color-danger)', fontWeight: '500', marginTop: '10px' }}
              >
                — Remove Member
              </button>
            )}
          </div>
        ))}

        <div className="action-buttons">
          <button className="btn btn-secondary" onClick={addMember}>+ Add Another Member</button>
          <button className="btn btn-primary" onClick={handleBooking} disabled={loading}>
            Confirm Booking
          </button>
        </div>

      </div>
    </>
  );
};

export default BookSlot;