import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";
import { UserPlus, Trash2, ArrowLeft, CheckCircle, Info } from "lucide-react";

const ACCENT = "#dd2d4a";

const BookSlot = () => {
  const { slotId } = useParams();
  const navigate = useNavigate();
  const [members, setMembers] = useState([{ fullName: "", age: "", gender: "male", photo: null, preview: null }]);
  const [loading, setLoading] = useState(false);

  const change = (i, f, v) => { const u = [...members]; u[i][f] = v; setMembers(u); };
  const imgChange = (i, file) => {
    const u = [...members];
    u[i].photo = file;
    u[i].preview = URL.createObjectURL(file);
    setMembers(u);
  };
  const add = () => {
    if (members.length >= 5) { toast.error("Maximum 5 members allowed"); return; }
    setMembers([...members, { fullName: "", age: "", gender: "male", photo: null, preview: null }]);
  };
  const remove = (i) => setMembers(members.filter((_, idx) => idx !== i));

  const book = async () => {
    if (loading) return;
    for (let m of members) {
      if (!m.fullName.trim() || !m.age) { toast.error("Please fill all member details"); return; }
      if (Number(m.age) < 1 || Number(m.age) > 120) { toast.error("Please enter a valid age"); return; }
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("slotId", slotId);
      fd.append("members", JSON.stringify(members.map(m => ({ fullName: m.fullName.trim(), age: Number(m.age), gender: m.gender }))));
      members.forEach(m => { if (m.photo) fd.append("images", m.photo); });
      await API.post("/bookings", fd);
      toast.success("Booking Successful! 🙏");
      setTimeout(() => navigate("/my-bookings"), 1000);
    } catch (err) {
      const msg = err.response?.data?.message || "";
      if (msg.includes("already")) toast.error("You have already booked this slot");
      else if (msg.includes("capacity")) toast.error("This slot is now full");
      else if (msg.includes("Invalid age")) toast.error("Invalid age entered");
      else toast.error(msg || "Booking failed. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-white bg-animated">
      {/* Full-screen loader */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(6px)" }}>
          <div className="card p-10 text-center max-w-sm w-full mx-4">
            <div className="w-14 h-14 border-4 border-gray-100 rounded-full animate-spin mx-auto mb-5" style={{ borderTopColor: ACCENT }} />
            <h3 className="font-serif text-xl font-bold text-gray-800 mb-1">Processing Booking</h3>
            <p className="text-gray-400 text-sm">Please wait a moment...</p>
          </div>
        </div>
      )}

      <Navbar />

      {/* Page header */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="section-container py-10">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-5">
            <ArrowLeft size={15} /> Back
          </button>
          <span className="badge-accent mb-3">🙏 Darshan Booking</span>
          <h1 className="font-serif text-3xl font-bold text-gray-800 mt-2">Book Your Darshan Slot</h1>
          <p className="text-gray-400 mt-1.5 text-sm">Add up to 5 members for your visit</p>
        </div>
      </div>

      <div className="section-container py-10">
        <div className="max-w-2xl mx-auto space-y-5">

          {/* Member cards */}
          {members.map((m, i) => (
            <div key={i} className="card overflow-hidden">
              {/* Card header */}
              <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-150">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                       style={{ background: `linear-gradient(135deg, ${ACCENT}, #b8203a)`, boxShadow: `0 4px 14px rgba(221,45,74,0.30)` }}>
                    {i + 1}
                  </div>
                  <h3 className="font-serif text-base font-semibold text-gray-800">Member {i + 1}</h3>
                  {i === 0 && <span className="badge-accent text-xs">Primary</span>}
                </div>
                {i > 0 && (
                  <button onClick={() => remove(i)} className="p-2 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>

              {/* Card body */}
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="label">Full Name *</label>
                  <input className="input" type="text" placeholder="Enter full name" value={m.fullName} onChange={e => change(i, "fullName", e.target.value)} required />
                </div>
                <div>
                  <label className="label">Age *</label>
                  <input className="input" type="number" placeholder="Age" min="1" max="120" value={m.age} onChange={e => change(i, "age", e.target.value)} required />
                </div>
                <div>
                  <label className="label">Gender *</label>
                  <select className="input" value={m.gender} onChange={e => change(i, "gender", e.target.value)}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Photo (optional)</label>
                  <input
                    className="input text-sm cursor-pointer"
                    style={{ "--file-bg": "#fff0f2" }}
                    type="file"
                    accept="image/*"
                    onChange={e => imgChange(i, e.target.files[0])}
                  />
                  {m.preview && (
                    <img src={m.preview} alt="preview" className="mt-3 w-20 h-20 rounded-xl object-cover border-2 border-gray-150" />
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button onClick={add} className="btn-secondary flex-1 py-3.5 gap-2">
              <UserPlus size={16} /> Add Member
            </button>
            <button onClick={book} disabled={loading} className="btn-primary flex-1 py-3.5 text-base gap-2">
              <CheckCircle size={17} /> Confirm Booking
            </button>
          </div>

          {/* Info note */}
          <div className="flex gap-3 items-start p-4 rounded-2xl border border-gray-150 bg-gray-50">
            <Info size={16} className="flex-shrink-0 mt-0.5 text-gray-400" />
            <p className="text-xs text-gray-500 leading-relaxed">
              Please arrive 15 minutes before your slot time. Carry a valid ID proof. Show your QR code at the entry gate. Maximum 5 members per booking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookSlot;
