import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import { UserPlus, Trash2, ArrowLeft, CheckCircle } from "lucide-react";

const BookSlot = () => {
  const { slotId } = useParams();
  const navigate = useNavigate();
  const [members, setMembers] = useState([{ fullName: "", age: "", gender: "male", photo: null, preview: null }]);
  const [loading, setLoading] = useState(false);

  const change = (i, f, v) => { const u = [...members]; u[i][f] = v; setMembers(u); };
  const imgChange = (i, file) => { const u = [...members]; u[i].photo = file; u[i].preview = URL.createObjectURL(file); setMembers(u); };
  const add = () => { if (members.length >= 5) { alert("Max 5 members ⚠️"); return; } setMembers([...members, { fullName: "", age: "", gender: "male", photo: null, preview: null }]); };
  const remove = (i) => setMembers(members.filter((_, idx) => idx !== i));

  const book = async () => {
    if (loading) return;
    for (let m of members) { if (!m.fullName || !m.age) { alert("Fill all details ❌"); return; } }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("slotId", slotId);
      fd.append("members", JSON.stringify(members.map(m => ({ fullName: m.fullName, age: Number(m.age), gender: m.gender }))));
      members.forEach(m => { if (m.photo) fd.append("images", m.photo); });
      await API.post("/bookings", fd);
      setTimeout(() => { alert("🙏 Booking Successful!"); navigate("/my-bookings"); }, 600);
    } catch (err) {
      const msg = err.response?.data?.message;
      setTimeout(() => alert(msg?.includes("already") ? "⚠️ Already booked" : msg?.includes("capacity") ? "⚠️ Slot is full" : msg || "Booking Failed ❌"), 600);
    } finally { setTimeout(() => setLoading(false), 600); }
  };

  return (
    <div className="min-h-screen bg-warm-page">
      {/* Full-screen loader */}
      {loading && (
        <div className="fixed inset-0 bg-white/85 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="card p-10 text-center shadow-xl max-w-sm w-full mx-4">
            <div className="w-14 h-14 border-4 border-stone-100 border-t-primary-500 rounded-full animate-spin mx-auto mb-5" />
            <h3 className="font-serif text-xl font-bold text-stone-800 mb-1">Processing Booking</h3>
            <p className="text-stone-400 text-sm">Please wait a moment...</p>
          </div>
        </div>
      )}

      <Navbar />

      {/* Page header */}
      <div className="bg-warm-section border-b border-stone-200">
        <div className="section-container py-10">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-stone-400 hover:text-stone-700 transition-colors mb-5">
            <ArrowLeft size={15} /> Back
          </button>
          <span className="badge-primary mb-3">🙏 Darshan Booking</span>
          <h1 className="font-serif text-3xl font-bold text-stone-800 mt-2">Book Your Darshan Slot</h1>
          <p className="text-stone-400 mt-1.5 text-sm">Add up to 5 members for your visit</p>
        </div>
      </div>

      <div className="section-container py-10">
        <div className="max-w-2xl mx-auto space-y-5">

          {/* Member cards */}
          {members.map((m, i) => (
            <div key={i} className="card shadow-sm overflow-hidden">
              {/* Card header */}
              <div className="flex items-center justify-between px-6 py-4 bg-warm-section border-b border-stone-150">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-grad flex items-center justify-center text-white text-sm font-bold shadow-primary">
                    {i + 1}
                  </div>
                  <h3 className="font-serif text-base font-semibold text-stone-800">Member {i + 1}</h3>
                  {i === 0 && <span className="badge-primary text-xs">Primary</span>}
                </div>
                {i > 0 && (
                  <button onClick={() => remove(i)} className="p-2 rounded-lg text-stone-300 hover:text-red-400 hover:bg-red-50 transition-colors">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>

              {/* Card body */}
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="label">Full Name</label>
                  <input className="input" type="text" placeholder="Enter full name" value={m.fullName} onChange={e => change(i, "fullName", e.target.value)} />
                </div>
                <div>
                  <label className="label">Age</label>
                  <input className="input" type="number" placeholder="Age" min="1" max="120" value={m.age} onChange={e => change(i, "age", e.target.value)} />
                </div>
                <div>
                  <label className="label">Gender</label>
                  <select className="input" value={m.gender} onChange={e => change(i, "gender", e.target.value)}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Photo (optional)</label>
                  <input
                    className="input text-sm file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-600 hover:file:bg-primary-100 cursor-pointer"
                    type="file" accept="image/*"
                    onChange={e => imgChange(i, e.target.files[0])}
                  />
                  {m.preview && (
                    <img src={m.preview} alt="preview" className="mt-3 w-20 h-20 rounded-xl object-cover border-2 border-stone-150 shadow-xs" />
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
          <div className="card-muted p-4 flex gap-3 items-start">
            <span className="text-lg flex-shrink-0">ℹ️</span>
            <p className="text-xs text-stone-500 leading-relaxed">
              Please arrive 15 minutes before your slot time. Carry a valid ID proof. Show your QR code at the entry gate.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookSlot;
