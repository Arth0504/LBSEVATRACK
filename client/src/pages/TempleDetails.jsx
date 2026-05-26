import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import { ArrowLeft, Clock, MapPin, Users, Calendar, ChevronDown } from "lucide-react";

const ACCENT = "#805f58";

const TempleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const slotsRef = useRef(null);
  const [temple, setTemple] = useState(null);
  const [allSlots, setAllSlots] = useState([]);
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 2);
  const fmt = (d) => d.toISOString().split("T")[0];

  useEffect(() => {
    Promise.all([
      API.get(`/temples/${id}`),
      API.get(`/slots/temple/${id}`),
    ])
      .then(([tRes, sRes]) => {
        setTemple(tRes.data);
        setAllSlots(sRes.data);
      })
      .catch(() => {
        void 0;
      })
      .finally(() => setLoading(false));
  }, [id]);

  const filtered = useMemo(() => {
    if (!date) return [];
    return allSlots.filter((s) => {
      const d = new Date(s.date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` === date;
    });
  }, [date, allSlots]);

  useEffect(() => {
    if (!date) return;
    const t = setTimeout(() => slotsRef.current?.scrollIntoView({ behavior: "smooth" }), 200);
    return () => clearTimeout(t);
  }, [date, allSlots]);

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-sacred-25">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-sacred-100" style={{ borderTopColor: ACCENT }} />
    </div>
  );

  if (!temple) return (
    <div className="flex min-h-screen items-center justify-center bg-sacred-25">
      <div className="text-center">
        <p className="text-lg text-stone-500">Temple not found</p>
        <button onClick={() => navigate("/temples")} className="btn-primary mt-4">Back to Temples</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-sacred-25 via-white to-sacred-50/70">
      <Navbar />

      <header className="relative isolate overflow-hidden pt-28">
        <div className="absolute inset-0 bg-cover bg-center opacity-38" style={{ backgroundImage: "url(/hero-combined.jpg)" }} />
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="absolute inset-0 bg-serene-waves opacity-55" />

        <div className="section-container relative z-10 py-16 md:py-24">
          <button
            onClick={() => navigate("/temples")}
            className="mb-10 flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-4 py-2 text-sm text-stone-600 shadow-sm backdrop-blur-xl transition-all hover:bg-white hover:text-sacred-800"
          >
            <ArrowLeft size={15} /> Back
          </button>

          <div className="mx-auto max-w-4xl text-center">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-sacred-600">Temple retreat</p>
            <h1 className="font-serif text-5xl font-medium leading-tight text-stone-800 md:text-7xl">
              {temple.name}
            </h1>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-stone-600">
              <span className="flex items-center gap-1.5"><MapPin size={14} /> {temple.location}</span>
              <span className="flex items-center gap-1.5"><Clock size={14} /> {temple.darshanStart} - {temple.darshanEnd}</span>
            </div>
            <button
              onClick={() => {
                if (!date) {
                  alert("Please select a date first");
                  return;
                }
                slotsRef.current?.scrollIntoView({ behavior: "smooth" });
              }}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-sacred-800 px-7 py-3.5 text-sm font-semibold text-white shadow-accent-lg transition-all hover:bg-sacred-900 hover:shadow-glow"
            >
              View Available Slots <ChevronDown size={17} />
            </button>
          </div>
        </div>
      </header>

      <main className="section-container py-12 md:py-16">
        <div className="mx-auto max-w-5xl space-y-8">
          <section className="rounded-[1.75rem] border border-white/80 bg-white/72 p-7 shadow-card backdrop-blur-xl md:p-9">
            <h2 className="font-serif text-3xl font-medium text-stone-800">About This Temple</h2>
            <p className="mt-4 text-base leading-8 text-stone-600">{temple.description || "A sacred temple with divine blessings and spiritual significance."}</p>
          </section>

          {temple.aartiTimings?.length > 0 && (
            <section>
              <h2 className="mb-5 font-serif text-3xl font-medium text-stone-800">Aarti Timings</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {temple.aartiTimings.map((a) => (
                  <div key={a._id} className="rounded-[1.35rem] border border-white/80 bg-white/72 p-6 shadow-card backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover">
                    <h4 className="font-serif text-xl font-medium text-stone-800">{a.name}</h4>
                    <p className="mt-2 text-sm font-semibold text-sacred-700">{a.time}</p>
                    <p className="mt-2 text-xs leading-6 text-stone-500">{a.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-[1.75rem] border border-white/80 bg-white/72 p-7 shadow-card backdrop-blur-xl md:p-9">
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              <div className="flex-1">
                <h2 className="font-serif text-3xl font-medium text-stone-800">Select Visit Date</h2>
                <p className="mt-2 text-sm text-stone-500">Booking is available for the next 2 months.</p>
              </div>
              <div className="flex items-center gap-3">
                <Calendar size={18} className="shrink-0 text-sacred-600" />
                <input
                  type="date"
                  min={fmt(today)}
                  max={fmt(maxDate)}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input max-w-xs cursor-pointer bg-white/85"
                />
              </div>
            </div>
          </section>

          {date && (
            <section ref={slotsRef}>
              <div className="mb-6 flex items-center justify-between gap-4">
                <h2 className="font-serif text-3xl font-medium text-stone-800">Available Slots</h2>
                <span className="badge-gray">{filtered.length} slot{filtered.length !== 1 ? "s" : ""} found</span>
              </div>

              {filtered.length === 0 ? (
                <div className="rounded-[1.75rem] border border-white/80 bg-white/72 p-14 text-center shadow-card backdrop-blur-xl">
                  <p className="font-medium text-stone-600">No slots available for this date</p>
                  <p className="mt-1 text-sm text-stone-500">Try selecting a different date.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((slot) => {
                    const avail = slot.capacity - slot.bookedCount;
                    const pct = Math.round((slot.bookedCount / slot.capacity) * 100);
                    const disabled = slot.status === "closed" || slot.status === "full" || avail <= 0;
                    const barColor = pct >= 80 ? "#b25f5f" : pct >= 50 ? "#a9846b" : "#6f9b86";
                    const densityLabel = pct >= 80 ? "High" : pct >= 50 ? "Medium" : "Low";
                    const densityColor = pct >= 80 ? "#9f4f4f" : pct >= 50 ? "#866855" : "#4f806b";

                    return (
                      <div key={slot._id} className={`rounded-[1.35rem] border border-white/80 bg-white/74 p-6 shadow-card backdrop-blur-xl ${disabled ? "opacity-55" : "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover"}`}>
                        <div className="mb-5 space-y-2.5">
                          <div className="flex items-center gap-2 text-sm text-stone-700">
                            <Clock size={14} className="shrink-0 text-sacred-600" />
                            <span className="font-semibold">{slot.startTime} - {slot.endTime}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-stone-600">
                            <Users size={14} className="shrink-0 text-sacred-600" />
                            <span>{avail} of {slot.capacity} spots available</span>
                          </div>
                        </div>

                        <div className="mb-5">
                          <div className="mb-1.5 flex justify-between text-xs">
                            <span className="font-semibold" style={{ color: densityColor }}>Crowd: {densityLabel}</span>
                            <span className="text-stone-400">{pct}% full</span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-sacred-100">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: barColor }} />
                          </div>
                        </div>

                        <button
                          disabled={disabled}
                          onClick={() => navigate(`/book/${slot._id}`)}
                          className={`w-full rounded-full py-3 text-sm font-semibold transition-all duration-200 ${disabled ? "cursor-not-allowed bg-stone-100 text-stone-300" : "btn-primary"}`}
                        >
                          {disabled ? "Not Available" : "Book Now"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default TempleDetails;
