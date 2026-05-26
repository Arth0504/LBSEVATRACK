import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";
import { UserPlus, Trash2, ArrowLeft, CheckCircle, Info } from "lucide-react";

const ACCENT = "#805f58";

const BookSlot = () => {
  const { slotId } = useParams();
  const navigate = useNavigate();
  const [members, setMembers] = useState([{ fullName: "", age: "", gender: "male", photo: null, preview: null }]);
  const [loading, setLoading] = useState(false);

  const change = (i, f, v) => {
    const u = [...members];
    u[i][f] = v;
    setMembers(u);
  };

  const imgChange = (i, file) => {
    const u = [...members];
    u[i].photo = file;
    u[i].preview = URL.createObjectURL(file);
    setMembers(u);
  };

  const add = () => {
    if (members.length >= 5) {
      toast.error("Maximum 5 members allowed");
      return;
    }
    setMembers([...members, { fullName: "", age: "", gender: "male", photo: null, preview: null }]);
  };

  const remove = (i) => setMembers(members.filter((_, idx) => idx !== i));

  const book = async () => {
    if (loading) return;
    for (let m of members) {
      if (!m.fullName.trim() || !m.age) {
        toast.error("Please fill all member details");
        return;
      }
      if (Number(m.age) < 1 || Number(m.age) > 120) {
        toast.error("Please enter a valid age");
        return;
      }
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("slotId", slotId);
      fd.append("members", JSON.stringify(members.map((m) => ({ fullName: m.fullName.trim(), age: Number(m.age), gender: m.gender }))));
      members.forEach((m) => {
        if (m.photo) fd.append("images", m.photo);
      });
      await API.post("/bookings", fd);
      toast.success("Booking successful");
      setTimeout(() => navigate("/my-bookings"), 1000);
    } catch (err) {
      const msg = err.response?.data?.message || "";
      if (msg.includes("already")) toast.error("You have already booked this slot");
      else if (msg.includes("capacity")) toast.error("This slot is now full");
      else if (msg.includes("Invalid age")) toast.error("Invalid age entered");
      else toast.error(msg || "Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sacred-25 via-white to-sacred-50/70">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/82 backdrop-blur-lg">
          <div className="mx-4 w-full max-w-sm rounded-[1.75rem] border border-white/80 bg-white/80 p-10 text-center shadow-glass backdrop-blur-xl">
            <div className="mx-auto mb-5 h-14 w-14 animate-spin rounded-full border-4 border-sacred-100" style={{ borderTopColor: ACCENT }} />
            <h3 className="font-serif text-2xl font-medium text-stone-800">Processing Booking</h3>
            <p className="mt-1 text-sm text-stone-500">Please wait a moment...</p>
          </div>
        </div>
      )}

      <Navbar />

      <header className="relative overflow-hidden border-b border-sacred-200/60 bg-sacred-25 pt-28">
        <div className="pointer-events-none absolute inset-0 bg-serene-waves opacity-55" />
        <div className="pointer-events-none absolute inset-0 bg-mesh-1 opacity-80" />
        <div className="section-container relative py-12 md:py-16">
          <button onClick={() => navigate(-1)} className="mb-8 flex items-center gap-2 text-sm text-stone-500 transition-colors hover:text-sacred-800">
            <ArrowLeft size={15} /> Back
          </button>
          <div className="mx-auto max-w-3xl text-center">
            <span className="badge-accent mb-4">Darshan Booking</span>
            <h1 className="mt-4 font-serif text-5xl font-medium text-stone-800 md:text-6xl">Book Your Slot</h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-stone-600">Add up to 5 members for your visit in a clean, focused booking flow.</p>
          </div>
        </div>
      </header>

      <main className="section-container py-10 md:py-14">
        <div className="mx-auto max-w-3xl space-y-5">
          {members.map((m, i) => (
            <section key={i} className="overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/74 shadow-card backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-sacred-100/80 bg-sacred-50/55 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sacred-800 text-sm font-semibold text-white shadow-sm">
                    {i + 1}
                  </div>
                  <h3 className="font-serif text-lg font-medium text-stone-800">Member {i + 1}</h3>
                  {i === 0 && <span className="badge-accent text-xs">Primary</span>}
                </div>
                {i > 0 && (
                  <button onClick={() => remove(i)} className="rounded-full p-2 text-stone-300 transition-colors hover:bg-red-50 hover:text-red-500" aria-label={`Remove member ${i + 1}`}>
                    <Trash2 size={15} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="label">Full Name *</label>
                  <input className="input bg-white/85" type="text" placeholder="Enter full name" value={m.fullName} onChange={(e) => change(i, "fullName", e.target.value)} required />
                </div>
                <div>
                  <label className="label">Age *</label>
                  <input className="input bg-white/85" type="number" placeholder="Age" min="1" max="120" value={m.age} onChange={(e) => change(i, "age", e.target.value)} required />
                </div>
                <div>
                  <label className="label">Gender *</label>
                  <select className="input bg-white/85" value={m.gender} onChange={(e) => change(i, "gender", e.target.value)}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Photo (optional)</label>
                  <input className="input cursor-pointer bg-white/85 text-sm" type="file" accept="image/*" onChange={(e) => imgChange(i, e.target.files[0])} />
                  {m.preview && (
                    <img src={m.preview} alt="preview" className="mt-3 h-20 w-20 rounded-2xl border-2 border-sacred-100 object-cover" />
                  )}
                </div>
              </div>
            </section>
          ))}

          <div className="flex flex-col gap-4 pt-2 sm:flex-row">
            <button onClick={add} className="btn-secondary flex-1 gap-2 rounded-full py-3.5">
              <UserPlus size={16} /> Add Member
            </button>
            <button onClick={book} disabled={loading} className="btn-primary flex-1 gap-2 rounded-full py-3.5 text-base">
              <CheckCircle size={17} /> Confirm Booking
            </button>
          </div>

          <div className="flex items-start gap-3 rounded-[1.35rem] border border-white/80 bg-white/68 p-4 shadow-sm backdrop-blur-xl">
            <Info size={16} className="mt-0.5 shrink-0 text-sacred-500" />
            <p className="text-xs leading-relaxed text-stone-500">
              Please arrive 15 minutes before your slot time. Carry a valid ID proof. Show your QR code at the entry gate. Maximum 5 members per booking.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookSlot;
