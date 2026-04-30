import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import { ArrowLeft, Clock, MapPin, Users, Calendar } from "lucide-react";

const TempleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const slotsRef = useRef(null);
  const [temple, setTemple] = useState(null);
  const [allSlots, setAllSlots] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [date, setDate] = useState("");

  const today = new Date(); today.setHours(0,0,0,0);
  const maxDate = new Date(); maxDate.setMonth(maxDate.getMonth() + 2);
  const fmt = d => d.toISOString().split("T")[0];

  useEffect(() => {
    API.get(`/temples/${id}`).then(r => setTemple(r.data)).catch(() => {});
    API.get(`/slots/temple/${id}`).then(r => setAllSlots(r.data)).catch(() => {});
  }, [id]);

  useEffect(() => {
    if (!date) return;
    const f = allSlots.filter(s => {
      const d = new Date(s.date);
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}` === date;
    });
    setFiltered(f);
    setTimeout(() => slotsRef.current?.scrollIntoView({ behavior: "smooth" }), 200);
  }, [date, allSlots]);

  if (!temple) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-gray-200 rounded-full animate-spin" style={{ borderTopColor: "#dd2d4a" }} />
    </div>
  );

  return (
    <div className="min-h-screen bg-white bg-animated">
      <Navbar />

      {/* Hero */}
      <div className="relative" style={{ height: "clamp(280px, 40vw, 460px)" }}>
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url(/hero-combined.jpg)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(15,8,12,0.80) 0%, rgba(15,8,12,0.40) 50%, rgba(15,8,12,0.15) 100%)" }} />

        <div className="absolute top-5 left-5 z-10">
          <button onClick={() => navigate("/temples")} className="flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 text-white text-sm px-4 py-2 rounded-xl hover:bg-white/25 transition-all">
            <ArrowLeft size={15} /> Back
          </button>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10 px-6">
          <h1 className="font-serif font-bold text-white drop-shadow-lg mb-3" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
            {temple.name}
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-4 text-white/70 text-sm">
            <span className="flex items-center gap-1.5"><MapPin size={14} /> {temple.location}</span>
            <span className="flex items-center gap-1.5"><Clock size={14} /> {temple.darshanStart} – {temple.darshanEnd}</span>
          </div>
          <button
            onClick={() => { if (!date) { alert("Please select a date first"); return; } slotsRef.current?.scrollIntoView({ behavior: "smooth" }); }}
            className="mt-6 btn-primary px-8 py-3.5 text-base shadow-primary-lg"
          >
            View Available Slots
          </button>
        </div>
      </div>

      <div className="section-container py-12 space-y-10">

        {/* About */}
        <div className="card p-8 shadow-sm">
          <h2 className="font-serif text-2xl font-bold text-gray-800 mb-4">About This Temple</h2>
          <p className="text-gray-500 leading-relaxed text-base">{temple.description}</p>
        </div>

        {/* Aarti Timings */}
        {temple.aartiTimings?.length > 0 && (
          <div>
            <h2 className="font-serif text-2xl font-bold text-stone-800 mb-6">Aarti Timings</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {temple.aartiTimings.map(a => (
                <div key={a._id} className="card p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 text-xl" style={{ background: "#fff0f2", border: "1px solid #ffadb8" }}>🪔</div>
                  <h4 className="font-serif text-lg font-semibold text-gray-800 mb-1">{a.name}</h4>
                  <p className="font-semibold text-sm mb-1" style={{ color: "#dd2d4a" }}>{a.time}</p>
                  <p className="text-gray-400 text-xs">{a.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Date Picker */}
        <div className="card p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <h2 className="font-serif text-2xl font-bold text-gray-800 mb-1">Select Visit Date</h2>
              <p className="text-gray-400 text-sm">Booking available for the next 2 months</p>
            </div>
            <div className="flex items-center gap-3">
              <Calendar size={18} className="flex-shrink-0" style={{ color: "#dd2d4a" }} />
              <input
                type="date"
                min={fmt(today)} max={fmt(maxDate)}
                value={date}
                onChange={e => setDate(e.target.value)}
                className="input max-w-xs cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Slots */}
        {date && (
          <div ref={slotsRef}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl font-bold text-gray-800">Available Slots</h2>
              <span className="badge-gray">{filtered.length} slots found</span>
            </div>

            {filtered.length === 0 ? (
                <div className="card p-14 text-center shadow-sm">
                <div className="text-4xl mb-3">📅</div>
                <p className="text-gray-500 font-medium">No slots available for this date</p>
                <p className="text-gray-400 text-sm mt-1">Try selecting a different date</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map(slot => {
                  const avail = slot.capacity - slot.bookedCount;
                  const pct = Math.round((slot.bookedCount / slot.capacity) * 100);
                  const disabled = slot.status === "closed" || slot.status === "full" || avail <= 0;
                  const barColor = pct >= 80 ? "bg-red-400" : pct >= 50 ? "bg-amber-400" : "bg-emerald-400";
                  const densityLabel = pct >= 80 ? "High" : pct >= 50 ? "Medium" : "Low";
                  const densityColor = pct >= 80 ? "text-red-500" : pct >= 50 ? "text-amber-600" : "text-emerald-600";

                  return (
                    <div key={slot._id} className={`card p-6 shadow-sm ${disabled ? "opacity-55" : "hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"}`}>
                      <div className="space-y-2.5 mb-5">
                        <div className="flex items-center gap-2 text-sm text-stone-600">
                          <Clock size={14} className="flex-shrink-0" style={{ color: "#dd2d4a" }} />
                          <span className="font-medium text-gray-700">{slot.startTime} – {slot.endTime}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-stone-600">
                          <Users size={14} className="flex-shrink-0" style={{ color: "#dd2d4a" }} />
                          <span className="text-gray-600">{avail} of {slot.capacity} spots available</span>
                        </div>
                      </div>

                      {/* Crowd bar */}
                      <div className="mb-5">
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className={`font-semibold ${densityColor}`}>Crowd: {densityLabel}</span>
                          <span className="text-gray-400">{pct}% full</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full ${barColor} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>

                      <button
                        disabled={disabled}
                        onClick={() => navigate(`/book/${slot._id}`)}
                        className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                          disabled
                            ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                            : "btn-primary"
                        }`}
                      >
                        {disabled ? "Not Available" : "Book Now 🙏"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TempleDetails;
