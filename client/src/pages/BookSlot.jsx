import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import { UserPlus, Trash2 } from "lucide-react";

const BookSlot = () => {
  const { slotId } = useParams();
  const navigate = useNavigate();
  const [members, setMembers] = useState([{ fullName: "", age: "", gender: "male", photo: null, preview: null }]);
  const [loading, setLoading] = useState(false);

  const handleChange = (i, field, value) => {
    const u = [...members]; u[i][field] = value; setMembers(u);
  };

  const handleImage = (i, file) => {
    const u = [...members]; u[i].photo = file; u[i].preview = URL.createObjectURL(file); setMembers(u);
  };

  const addMember = () => {
    if (members.length >= 5) { alert("Maximum 5 members allowed ⚠️"); return; }
    setMembers([...members, { fullName: "", age: "", gender: "male", photo: null, preview: null }]);
  };

  const removeMember = (i) => setMembers(members.filter((_, idx) => idx !== i));

  const handleBooking = async () => {
    if (loading) return;
    for (let m of members) { if (!m.fullName || !m.age) { alert("Please fill all details ❌"); return; } }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("slotId", slotId);
      fd.append("members", JSON.stringify(members.map((m) => ({ fullName: m.fullName, age: Number(m.age), gender: m.gender }))));
      members.forEach((m) => { if (m.photo) fd.append("images", m.photo); });
      await API.post("/bookings", fd);
      setTimeout(() => { alert("🙏 Booking Successful!"); navigate("/my-bookings"); }, 800);
    } catch (err) {
      const msg = err.response?.data?.message;
      setTimeout(() => alert(msg?.includes("already") ? "⚠️ Already booked" : msg?.includes("capacity") ? "⚠️ Slot is full" : msg || "Booking Failed ❌"), 800);
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  return (
    <div className="min-h-screen bg-rose-25 bg-mesh">
      {/* Full-screen loader */}
      {loading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="card-base p-10 text-center">
            <div className="w-12 h-12 border-4 border-rose-200 border-t-blush-400 rounded-full animate-spin mx-auto mb-4" />
            <h3 className="font-serif text-xl text-warm-800 mb-1">Please wait...</h3>
            <p className="text-warm-400 text-sm">Your booking is being processed</p>
          </div>
        </div>
      )}

      <Navbar />

      <div className="max-w-2xl mx-auto px-5 md:px-8 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="badge-rose mb-3">🙏 Darshan Booking</span>
          <h1 className="font-serif text-3xl font-semibold text-warm-800 mt-2">Book Your Darshan Slot</h1>
          <p className="text-warm-400 text-sm mt-2">Add up to 5 members for your visit</p>
        </div>

        {/* Member Cards */}
        <div className="space-y-5 mb-6">
          {members.map((member, i) => (
            <div key={i} className="card-base p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-rose-100 flex items-center justify-center text-blush-400 font-serif font-semibold text-sm">
                    {i + 1}
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-warm-800">Member {i + 1}</h3>
                </div>
                {i > 0 && (
                  <button onClick={() => removeMember(i)} className="p-2 rounded-xl text-warm-300 hover:text-rose-400 hover:bg-rose-50 transition-colors">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-warm-400 mb-1.5">Full Name</label>
                  <input className="input-base" type="text" placeholder="Enter full name" value={member.fullName} onChange={(e) => handleChange(i, "fullName", e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-warm-400 mb-1.5">Age</label>
                  <input className="input-base" type="number" placeholder="Age" value={member.age} onChange={(e) => handleChange(i, "age", e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-warm-400 mb-1.5">Gender</label>
                  <select className="input-base" value={member.gender} onChange={(e) => handleChange(i, "gender", e.target.value)}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-warm-400 mb-1.5">Photo (optional)</label>
                  <input className="input-base text-sm file:mr-3 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-medium file:bg-rose-100 file:text-blush-500 hover:file:bg-rose-200 cursor-pointer" type="file" accept="image/*" onChange={(e) => handleImage(i, e.target.files[0])} />
                  {member.preview && (
                    <img src={member.preview} alt="preview" className="mt-3 w-20 h-20 rounded-2xl object-cover border-2 border-rose-100" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={addMember} className="btn-secondary flex-1 py-3 gap-2">
            <UserPlus size={16} /> Add Member
          </button>
          <button onClick={handleBooking} disabled={loading} className="btn-primary flex-1 py-3 text-base">
            Confirm Booking 🙏
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookSlot;
