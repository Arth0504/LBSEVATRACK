import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import API from "../api/axios";

const slides = [
  { image: "/somanth-hero.png",  shlok: "ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् |\nउर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय मामृतात् ॥" },
  { image: "/dwarika-hero.png",  shlok: "यदा यदा हि धर्मस्य ग्लानिर्भवति भारत ।\nअभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम् ॥" },
  { image: "/ambaji-hero.png",   shlok: "सर्वमङ्गलमाङ्गल्ये शिवे सर्वार्थसाधिके ।\nशरण्ये त्र्यम्बके गौरी नारायणि नमोऽस्तुते ॥" },
];

const steps = [
  { num: "01", title: "Register",       desc: "Create your account in seconds",       icon: "👤" },
  { num: "02", title: "Select Temple",  desc: "Browse and choose your destination",   icon: "🛕" },
  { num: "03", title: "Choose Slot",    desc: "Pick your preferred date & time",      icon: "📅" },
  { num: "04", title: "Visit & Darshan",desc: "Show QR code at the entry gate",       icon: "✨" },
];

export default function Home() {
  const [current, setCurrent] = useState(0);
  const [temples, setTemples] = useState([]);
  const [notes, setNotes] = useState([]);
  const [queryData, setQueryData] = useState({ name: "", email: "", message: "" });
  const [queryLoading, setQueryLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const sectionRefs = useRef([]);
  sectionRefs.current = [];

  const addToRefs = (el) => {
    if (el && !sectionRefs.current.includes(el)) sectionRefs.current.push(el);
  };

  useEffect(() => {
    const interval = setInterval(() => setCurrent((p) => (p + 1) % slides.length), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    API.get("/temples").then((r) => setTemples(r.data)).catch(() => {});
    API.get("/notes").then((r) => setNotes(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("fade-in-visible"); }),
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    const curr = sectionRefs.current;
    curr.forEach((r) => observer.observe(r));
    return () => curr.forEach((r) => observer.unobserve(r));
  }, [temples, notes]);

  const handleDarshan = (id) => (!token ? navigate("/login") : navigate(`/temple/${id}`));

  const getTempleImage = (name = "") => {
    const l = name.toLowerCase();
    if (l.includes("dwarka"))  return "/dw1.png";
    if (l.includes("somnath")) return "/Sm1.png";
    if (l.includes("ambaji"))  return "/am1.png";
    return "/default-temple.png";
  };

  const handleQuery = async (e) => {
    e.preventDefault();
    setQueryLoading(true);
    try {
      await API.post("/query", queryData);
      alert("Question submitted successfully! 🙏");
      setQueryData({ name: "", email: "", message: "" });
    } catch { alert("Failed to submit. Please try again."); }
    finally { setQueryLoading(false); }
  };

  return (
    <div className="min-h-screen bg-rose-25 bg-mesh">
      <Navbar />

      {/* ══════════════════════════════════════
          HERO SLIDER
          ══════════════════════════════════════ */}
      <section className="relative">
        {/* Sanskrit greeting */}
        <div className="text-center pt-8 pb-4 px-4">
          <p className="font-devanagari text-base md:text-lg text-blush-400 opacity-80 tracking-widest">
            सदा भवानी दाहिनी, सम्मुख रहें गणेश 🪷
          </p>
        </div>

        {/* Slider */}
        <div className="relative mx-4 md:mx-8 lg:mx-12 rounded-3xl overflow-hidden shadow-warm-lg"
             style={{ height: "clamp(300px, 50vw, 520px)" }}>
          {slides.map((slide, i) => (
            <div
              key={i}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${i === current ? "opacity-100 z-10" : "opacity-0 z-0"}`}
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-hero" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end pb-12 pl-8 md:pl-16 z-10">
                <div className="max-w-lg">
                  <p className="font-devanagari text-white/90 text-lg md:text-2xl leading-relaxed mb-6 drop-shadow-lg">
                    {slide.shlok.split("\n").map((line, j) => (
                      <span key={j} className="block">{line}</span>
                    ))}
                  </p>
                  <button
                    onClick={() => navigate("/temples")}
                    className="btn-primary text-base px-8 py-3.5 shadow-soft-lg"
                  >
                    Book Darshan 🙏
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Dots */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`rounded-full transition-all duration-300 ${i === current ? "w-8 h-2 bg-white" : "w-2 h-2 bg-white/50"}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          NOTICE BOARD
          ══════════════════════════════════════ */}
      {notes.length > 0 && (
        <section className="max-w-7xl mx-auto px-5 md:px-8 py-16 fade-in-section" ref={addToRefs}>
          <div className="text-center mb-10">
            <span className="badge-rose mb-3">📢 Announcements</span>
            <h2 className="section-title mt-2">Notice Board</h2>
            <div className="ornament-line mt-4"><span className="text-rose-200 text-lg">🌸</span></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {notes.map((note, i) => (
              <div key={note._id || i} className="card-base p-6 group">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center mb-4 group-hover:bg-blush-100 transition-colors">
                  <span className="text-lg">📌</span>
                </div>
                <h3 className="font-serif text-lg font-semibold text-warm-800 mb-2">{note.title}</h3>
                <p className="text-sm text-warm-400 leading-relaxed">{note.message}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════
          FEATURED TEMPLES
          ══════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 py-16 fade-in-section" ref={addToRefs}>
        <div className="text-center mb-12">
          <span className="badge-rose mb-3">🛕 Sacred Places</span>
          <h2 className="section-title mt-2">Featured Temples</h2>
          <p className="section-sub">Divine places filled with eternal faith and blessings</p>
          <div className="ornament-line mt-4"><span className="text-rose-200 text-lg">🌸</span></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {temples.slice(0, 3).map((temple, i) => (
            <div
              key={temple._id}
              onClick={() => handleDarshan(temple._id)}
              className="group relative rounded-3xl overflow-hidden cursor-pointer shadow-card hover:shadow-card-hover transition-all duration-500 hover:-translate-y-2"
              style={{ height: "380px" }}
            >
              <img
                src={getTempleImage(temple.name)}
                alt={temple.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-card" />

              <div className="absolute inset-0 flex flex-col justify-end p-7 z-10">
                <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-400">
                  <h3 className="font-serif text-2xl font-semibold text-white mb-1 drop-shadow">{temple.name}</h3>
                  <p className="text-white/70 text-sm mb-4">📍 {temple.location}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDarshan(temple._id); }}
                  className="opacity-0 group-hover:opacity-100 transform translate-y-3 group-hover:translate-y-0 transition-all duration-400
                             bg-white/90 text-blush-500 text-sm font-medium px-5 py-2.5 rounded-full w-fit
                             hover:bg-white hover:shadow-soft"
                >
                  View Darshan →
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <button onClick={() => navigate("/temples")} className="btn-secondary px-8 py-3">
            View All Temples →
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════
          HOW IT WORKS
          ══════════════════════════════════════ */}
      <section className="bg-white py-20 fade-in-section" ref={addToRefs}>
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="text-center mb-14">
            <span className="badge-rose mb-3">✨ Simple Process</span>
            <h2 className="section-title mt-2">How It Works</h2>
            <div className="ornament-line mt-4"><span className="text-rose-200 text-lg">🌸</span></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="relative group">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-full w-full h-px bg-gradient-to-r from-rose-200 to-transparent z-0 -translate-y-1/2" />
                )}
                <div className="card-soft p-7 text-center relative z-10 group-hover:bg-rose-50 transition-colors duration-300">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-100 to-blush-100 flex items-center justify-center mx-auto mb-4 text-2xl shadow-soft group-hover:shadow-soft-md transition-shadow">
                    {step.icon}
                  </div>
                  <span className="text-xs font-semibold text-blush-300 tracking-widest uppercase">{step.num}</span>
                  <h4 className="font-serif text-lg font-semibold text-warm-800 mt-1 mb-2">{step.title}</h4>
                  <p className="text-sm text-warm-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          QUERY FORM
          ══════════════════════════════════════ */}
      <section className="max-w-2xl mx-auto px-5 md:px-8 py-20 fade-in-section" ref={addToRefs}>
        <div className="text-center mb-10">
          <span className="badge-rose mb-3">💬 Get in Touch</span>
          <h2 className="section-title mt-2">Have Any Question?</h2>
          <p className="section-sub">Ask before booking your darshan</p>
          <div className="ornament-line mt-4"><span className="text-rose-200 text-lg">🌸</span></div>
        </div>

        <div className="card-base p-8 md:p-10">
          <form onSubmit={handleQuery} className="flex flex-col gap-4">
            <input
              className="input-base"
              type="text"
              placeholder="Your Name"
              value={queryData.name}
              onChange={(e) => setQueryData({ ...queryData, name: e.target.value })}
              required
            />
            <input
              className="input-base"
              type="email"
              placeholder="Your Email"
              value={queryData.email}
              onChange={(e) => setQueryData({ ...queryData, email: e.target.value })}
              required
            />
            <textarea
              className="input-base resize-none"
              placeholder="Your Message"
              rows={4}
              value={queryData.message}
              onChange={(e) => setQueryData({ ...queryData, message: e.target.value })}
              required
            />
            <button type="submit" disabled={queryLoading} className="btn-primary w-full py-3.5 text-base mt-2">
              {queryLoading ? "Sending..." : "Submit Question 🙏"}
            </button>
          </form>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FOOTER
          ══════════════════════════════════════ */}
      <footer className="bg-gradient-footer border-t border-rose-100 fade-in-section" ref={addToRefs}>
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-1.5 mb-4">
                <span className="font-serif text-2xl font-semibold text-blush-500">Seva</span>
                <span className="font-serif text-2xl font-semibold text-warm-700">Track</span>
                <span className="text-xl ml-1">🪷</span>
              </div>
              <p className="text-sm text-warm-400 leading-relaxed max-w-xs">
                Digital darshan management system for peaceful and organized temple visits.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-sans text-xs font-semibold uppercase tracking-widest text-warm-400 mb-5">Quick Links</h4>
              {[["Home", "/"], ["Temples", "/temples"], ["My Bookings", "/my-bookings"], ["Login", "/login"]].map(([label, path]) => (
                <a key={path} href={path} className="block text-sm text-warm-400 hover:text-blush-400 transition-colors mb-3">{label}</a>
              ))}
            </div>

            {/* Temples */}
            <div>
              <h4 className="font-sans text-xs font-semibold uppercase tracking-widest text-warm-400 mb-5">Featured Temples</h4>
              {temples.slice(0, 3).map((t) => (
                <span
                  key={t._id}
                  onClick={() => handleDarshan(t._id)}
                  className="block text-sm text-warm-400 hover:text-blush-400 transition-colors mb-3 cursor-pointer"
                >
                  {t.name}
                </span>
              ))}
            </div>
          </div>

          <div className="border-t border-rose-100 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-xs text-warm-300">© {new Date().getFullYear()} SevaTrack. All Rights Reserved.</p>
            <p className="text-xs text-blush-300 font-medium">Made with 🌸 by LB INFOTECH</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
