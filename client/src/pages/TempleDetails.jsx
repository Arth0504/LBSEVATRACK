import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";

const TempleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const slotsRef = useRef(null);

  const [temple, setTemple] = useState(null);
  const [allSlots, setAllSlots] = useState([]);
  const [filteredSlots, setFilteredSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

  const today = new Date(); today.setHours(0,0,0,0);
  const maxDate = new Date(); maxDate.setMonth(maxDate.getMonth() + 2);
  const fmt = (d) => d.toISOString().split("T")[0];

  useEffect(() => {
    API.get(`/temples/${id}`).then((r) => setTemple(r.data)).catch(() => {});
    API.get(`/slots/temple/${id}`).then((r) => setAllSlots(r.data)).catch(() => {});
  }, [id]);

  useEffect(() => {
    if (!selectedDate) return;
    const filtered = allSlots.filter((s) => {
      const d = new Date(s.date);
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}` === selectedDate;
    });
    setFilteredSlots(filtered);
    setTimeout(() => slotsRef.current?.scrollIntoView({ behavior: "smooth" }), 200);
  }, [selectedDate, allSlots]);

  if (!temple) return (
    <div className="min-h-screen bg-rose-25 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-rose-200 border-t-blush-400 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-rose-25">
      <Navbar />

      {/* Back */}
      <div className="max-w-7xl mx-auto px-5 md:px-8 pt-6">
        <button onClick={() => navigate("/temples")} className="btn-ghost text-sm px-4 py-2">
          ← Back to Temples
        </button>
      </div>

      {/* Hero */}
      <div className="relative mx-4 md:mx-8 mt-4 rounded-3xl overflow-hidden shadow-warm-lg" style={{ height: "clamp(240px,38vw,420px)" }}>
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url(/hero-combined.jpg)" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10 px-6">
          <h1 className="font-serif text-3xl md:text-5xl font-semibold text-white drop-shadow-lg mb-2">{temple.name}</h1>
          <p className="text-white/70 text-base mb-1">📍 {temple.location}</p>
          <p className="text-white/60 text-sm">Darshan: {temple.darshanStart} – {temple.darshanEnd}</p>
          <button
            onClick={() => { if (!selectedDate) { alert("Please select a date first"); return; } slotsRef.current?.scrollIntoView({ behavior: "smooth" }); }}
            className="mt-5 btn-primary px-7 py-3"
          >
            View Slots
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 md:px-8 py-12 space-y-12">

        {/* About */}
        <section className="card-base p-8">
          <h2 className="font-serif text-2xl font-semibold text-warm-800 mb-4">About Temple</h2>
          <p className="text-warm-500 leading-relaxed">{temple.description}</p>
        </section>

        {/* Aarti Timings */}
        {temple.aartiTimings?.length > 0 && (
          <section>
            <h2 className="font-serif text-2xl font-semibold text-warm-800 mb-6 text-center">Aarti Timings</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {temple.aartiTimings.map((a) => (
                <div key={a._id} className="card-soft p-6 text-center">
                  <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center mx-auto mb-3 text-xl">🪔</div>
                  <h4 className="font-serif text-lg font-semibold text-warm-800 mb-1">{a.name}</h4>
                  <p className="text-blush-400 font-medium text-sm mb-1">{a.time}</p>
                  <p className="text-warm-400 text-xs">{a.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Date Picker */}
        <section className="card-base p-8 text-center">
          <h2 className="font-serif text-2xl font-semibold text-warm-800 mb-2">Select Date</h2>
          <p className="text-warm-400 text-sm mb-5">Booking allowed within next 2 months</p>
          <input
            type="date"
            min={fmt(today)} max={fmt(maxDate)}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input-base max-w-xs mx-auto text-center cursor-pointer"
          />
        </section>

        {/* Slots */}
        {selectedDate && (
          <section ref={slotsRef}>
            <h2 className="font-serif text-2xl font-semibold text-warm-800 mb-6 text-center">Available Slots</h2>
            {filteredSlots.length === 0 ? (
              <div className="text-center py-12 card-soft">
                <div className="text-4xl mb-3">📅</div>
                <p className="text-warm-400">No slots available for selected date</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredSlots.map((slot) => {
                  const available = slot.capacity - slot.bookedCount;
                  const pct = Math.round((slot.bookedCount / slot.capacity) * 100);
                  const isDisabled = slot.status === "closed" || slot.status === "full" || available <= 0;
                  const density = pct >= 80 ? { label: "High", color: "bg-rose-400" } : pct >= 50 ? { label: "Medium", color: "bg-rose-300" } : { label: "Low", color: "bg-rose-200" };

                  return (
                    <div key={slot._id} className={`card-base p-6 ${isDisabled ? "opacity-60" : ""}`}>
                      <div className="space-y-2 mb-4">
                        <p className="text-sm text-warm-600"><span className="font-medium">📅 Date:</span> {new Date(slot.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
                        <p className="text-sm text-warm-600"><span className="font-medium">⏰ Time:</span> {slot.startTime} – {slot.endTime}</p>
                        <p className="text-sm text-warm-600"><span className="font-medium">👥 Available:</span> {available} / {slot.capacity}</p>
                      </div>

                      {/* Crowd bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-warm-400 mb-1">
                          <span>Crowd: {density.label}</span>
                          <span>{pct}%</span>
                        </div>
                        <div className="w-full h-2 bg-rose-100 rounded-full overflow-hidden">
                          <div className={`h-full ${density.color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>

                      <button
                        disabled={isDisabled}
                        onClick={() => navigate(`/book/${slot._id}`)}
                        className={`w-full py-3 rounded-2xl text-sm font-medium transition-all duration-300 ${
                          isDisabled
                            ? "bg-warm-100 text-warm-300 cursor-not-allowed"
                            : "btn-primary"
                        }`}
                      >
                        {isDisabled ? "Not Available" : "Book Now 🙏"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default TempleDetails;
