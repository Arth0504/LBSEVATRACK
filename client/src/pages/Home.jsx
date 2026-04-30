import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import API from "../api/axios";
import { ArrowRight, MapPin, ChevronRight, Star } from "lucide-react";

const slides = [
  { image: "/somanth-hero.png",  shlok: "ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् |\nउर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय मामृतात् ॥" },
  { image: "/dwarika-hero.png",  shlok: "यदा यदा हि धर्मस्य ग्लानिर्भवति भारत ।\nअभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम् ॥" },
  { image: "/ambaji-hero.png",   shlok: "सर्वमङ्गलमाङ्गल्ये शिवे सर्वार्थसाधिके ।\nशरण्ये त्र्यम्बके गौरी नारायणि नमोऽस्तुते ॥" },
];

const steps = [
  { num: "01", title: "Create Account",  desc: "Register in under a minute",         icon: "👤" },
  { num: "02", title: "Choose Temple",   desc: "Browse sacred destinations",          icon: "🛕" },
  { num: "03", title: "Book a Slot",     desc: "Pick your preferred date & time",     icon: "📅" },
  { num: "04", title: "Visit & Darshan", desc: "Show QR code at the entry gate",      icon: "✨" },
];

const stats = [["3+", "Sacred Temples"], ["10K+", "Happy Devotees"], ["50K+", "Darshans Booked"], ["100%", "Secure Booking"]];

export default function Home() {
  const [current, setCurrent] = useState(0);
  const [temples, setTemples] = useState([]);
  const [notes, setNotes] = useState([]);
  const [query, setQuery] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const refs = useRef([]);
  refs.current = [];
  const addRef = (el) => { if (el && !refs.current.includes(el)) refs.current.push(el); };

  useEffect(() => {
    const t = setInterval(() => setCurrent(p => (p + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    API.get("/temples").then(r => setTemples(r.data)).catch(() => {});
    API.get("/notes").then(r => setNotes(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("fade-visible"); }),
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
    );
    const curr = refs.current;
    curr.forEach(r => obs.observe(r));
    return () => curr.forEach(r => obs.unobserve(r));
  }, [temples, notes]);

  const goTemple = (id) => !token ? navigate("/login") : navigate(`/temple/${id}`);

  const getImg = (name = "") => {
    const l = name.toLowerCase();
    if (l.includes("dwarka"))  return "/dw1.png";
    if (l.includes("somnath")) return "/Sm1.png";
    if (l.includes("ambaji"))  return "/am1.png";
    return "/default-temple.png";
  };

  const submitQuery = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await API.post("/query", query);
      alert("Question submitted successfully! 🙏");
      setQuery({ name: "", email: "", message: "" });
    } catch { alert("Failed to submit. Please try again."); }
    finally { setSending(false); }
  };

  return (
    <div className="min-h-screen bg-white bg-animated">
      <Navbar />

      {/* ══════════════════════════════════════
          HERO
          ══════════════════════════════════════ */}
      <section className="relative" style={{ height: "clamp(440px, 60vw, 640px)" }}>
        {slides.map((s, i) => (
          <div
            key={i}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${i === current ? "opacity-100 z-10" : "opacity-0 z-0"}`}
            style={{ backgroundImage: `url(${s.image})` }}
          />
        ))}

        {/* Overlay */}
        <div className="absolute inset-0 z-20" style={{ background: "linear-gradient(105deg, rgba(10,5,8,0.88) 0%, rgba(10,5,8,0.58) 45%, rgba(10,5,8,0.12) 100%)" }} />

        {/* Sanskrit strip */}
        <div className="absolute top-0 inset-x-0 z-30 py-2.5 text-center" style={{ background: "rgba(221,45,74,0.85)", backdropFilter: "blur(4px)" }}>
          <p className="font-devanagari text-sm text-white/90 tracking-widest">
            सदा भवानी दाहिनी, सम्मुख रहें गणेश 🪷
          </p>
        </div>

        {/* Hero content */}
        <div className="absolute inset-0 z-30 flex items-center">
          <div className="section-container w-full pt-12">
            <div className="max-w-2xl">
              {/* Live badge */}
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 border border-white/20"
                   style={{ background: "rgba(255,255,255,0.10)", backdropFilter: "blur(8px)" }}>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#dd2d4a" }} />
                <span className="text-white/85 text-xs font-medium tracking-wide">Digital Darshan Booking Platform</span>
              </div>

              <h1 className="font-serif text-white font-bold mb-4 leading-tight drop-shadow-lg"
                  style={{ fontSize: "clamp(2rem, 4.5vw, 3.8rem)" }}>
                Book Your Sacred<br />
                <span style={{ color: "#ff7a8a" }}>Darshan</span> Online
              </h1>

              <p className="font-devanagari text-white/80 text-lg md:text-xl leading-relaxed mb-8 drop-shadow">
                {slides[current].shlok.split("\n").map((l, j) => <span key={j} className="block">{l}</span>)}
              </p>

              <div className="flex flex-wrap gap-4">
                <button onClick={() => navigate("/temples")} className="btn-primary text-base px-8 py-3.5">
                  Book Darshan <ArrowRight size={18} />
                </button>
                <button
                  onClick={() => navigate("/temples")}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-white text-base font-medium transition-all duration-200 border border-white/25 hover:bg-white/15"
                  style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(8px)" }}
                >
                  Explore Temples
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`rounded-full transition-all duration-300 ${i === current ? "w-7 h-2.5 bg-white" : "w-2.5 h-2.5 bg-white/40 hover:bg-white/65"}`}
            />
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════
          STATS STRIP
          ══════════════════════════════════════ */}
      <div className="bg-white border-b border-gray-150 shadow-xs relative z-10">
        <div className="section-container py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
            {stats.map(([val, label]) => (
              <div key={label} className="text-center px-6 py-1">
                <p className="font-serif text-2xl font-bold text-accent-grad">{val}</p>
                <p className="text-xs text-gray-400 mt-0.5 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          NOTICE BOARD
          ══════════════════════════════════════ */}
      {notes.length > 0 && (
        <section className="bg-section py-16 relative z-10 fade-section" ref={addRef}>
          <div className="section-container">
            <div className="text-center mb-10">
              <span className="badge-accent mb-3">📢 Announcements</span>
              <h2 className="section-heading mt-2">Notice Board</h2>
              <div className="divider" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {notes.map((n, i) => (
                <div key={n._id || i} className="card card-hover p-6">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 text-lg"
                       style={{ background: "#fff0f2", border: "1px solid #ffadb8" }}>📌</div>
                  <h3 className="font-serif text-lg font-semibold text-gray-800 mb-2">{n.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{n.message}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════
          FEATURED TEMPLES
          ══════════════════════════════════════ */}
      <section className="py-20 bg-white relative z-10 fade-section" ref={addRef}>
        <div className="section-container">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="badge-accent mb-3">🛕 Sacred Places</span>
              <h2 className="section-heading mt-2">Featured Temples</h2>
              <p className="section-sub">Divine destinations filled with eternal faith</p>
              <div className="divider !mx-0 !mt-4" />
            </div>
            <button onClick={() => navigate("/temples")} className="btn-secondary self-start md:self-auto whitespace-nowrap">
              View All <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {temples.slice(0, 3).map((t) => (
              <div
                key={t._id}
                onClick={() => goTemple(t._id)}
                className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-2"
                style={{ height: "400px", boxShadow: "0 4px 20px rgba(0,0,0,0.10)" }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.18)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.10)"}
              >
                <img
                  src={getImg(t.name)}
                  alt={t.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-card-overlay" />

                {/* Accent top bar */}
                <div className="absolute top-0 left-0 right-0 h-1 z-10" style={{ background: "linear-gradient(90deg, #dd2d4a, #ff7a8a)" }} />

                <div className="absolute inset-0 flex flex-col justify-end p-7 z-10">
                  <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="font-serif text-2xl font-bold text-white mb-1.5 drop-shadow">{t.name}</h3>
                    <p className="flex items-center gap-1.5 text-white/65 text-sm mb-5">
                      <MapPin size={13} /> {t.location}
                    </p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); goTemple(t._id); }}
                    className="opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-300
                               bg-white text-sm font-semibold px-5 py-2.5 rounded-xl w-fit shadow-md hover:shadow-lg"
                    style={{ color: "#dd2d4a" }}
                  >
                    Book Darshan →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          HOW IT WORKS
          ══════════════════════════════════════ */}
      <section className="bg-section py-20 relative z-10 fade-section" ref={addRef}>
        <div className="section-container">
          <div className="text-center mb-14">
            <span className="badge-accent mb-3">✨ Simple Process</span>
            <h2 className="section-heading mt-2">How It Works</h2>
            <p className="section-sub">Book your darshan in 4 easy steps</p>
            <div className="divider" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={i} className="relative group">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-9 left-full w-full h-px z-0"
                       style={{ background: "linear-gradient(90deg, #ffadb8, transparent)" }} />
                )}
                <div className="card card-hover p-7 text-center relative z-10">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 text-2xl transition-shadow duration-300"
                       style={{ background: "#fff0f2", border: "1px solid #ffadb8" }}>
                    {s.icon}
                  </div>
                  <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#dd2d4a" }}>{s.num}</span>
                  <h4 className="font-serif text-lg font-semibold text-gray-800 mt-1.5 mb-2">{s.title}</h4>
                  <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          QUERY FORM
          ══════════════════════════════════════ */}
      <section className="py-20 bg-white relative z-10 fade-section" ref={addRef}>
        <div className="section-container">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <span className="badge-accent mb-3">💬 Get in Touch</span>
              <h2 className="section-heading mt-2">Have a Question?</h2>
              <p className="section-sub">Ask us before booking your darshan</p>
              <div className="divider" />
            </div>

            <div className="card p-8 md:p-10" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
              <form onSubmit={submitQuery} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="label">Your Name</label>
                    <input className="input" type="text" placeholder="Full name" value={query.name} onChange={e => setQuery({...query, name: e.target.value})} required />
                  </div>
                  <div>
                    <label className="label">Email Address</label>
                    <input className="input" type="email" placeholder="you@email.com" value={query.email} onChange={e => setQuery({...query, email: e.target.value})} required />
                  </div>
                </div>
                <div>
                  <label className="label">Your Message</label>
                  <textarea className="input resize-none" rows={4} placeholder="Write your question here..." value={query.message} onChange={e => setQuery({...query, message: e.target.value})} required />
                </div>
                <button type="submit" disabled={sending} className="btn-primary w-full py-3.5 text-base">
                  {sending ? "Sending..." : "Submit Question 🙏"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FOOTER
          ══════════════════════════════════════ */}
      <footer className="relative z-10" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%)" }}>
        {/* Accent top line */}
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #dd2d4a, #ff7a8a, #dd2d4a)" }} />

        <div className="section-container py-14">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #dd2d4a, #b8203a)" }}>
                  <span className="text-white text-sm font-bold font-serif">S</span>
                </div>
                <span className="font-serif text-xl font-bold text-white">SevaTrack</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
                A digital darshan management system for peaceful, organized, and seamless temple visits.
              </p>
              <div className="flex items-center gap-1 mt-4">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#dd2d4a" className="text-accent" />)}
                <span className="text-xs text-gray-500 ml-2">Trusted by 10,000+ devotees</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-5">Quick Links</h4>
              {[["Home", "/"], ["Temples", "/temples"], ["My Bookings", "/my-bookings"], ["Login", "/login"]].map(([l, p]) => (
                <a key={p} href={p} className="block text-sm text-gray-400 hover:text-white transition-colors mb-3">{l}</a>
              ))}
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-5">Temples</h4>
              {temples.slice(0, 3).map(t => (
                <span key={t._id} onClick={() => goTemple(t._id)} className="block text-sm text-gray-400 hover:text-white transition-colors mb-3 cursor-pointer">{t.name}</span>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-xs text-gray-600">© {new Date().getFullYear()} SevaTrack. All Rights Reserved.</p>
            <p className="text-xs text-gray-600">Made with 🌸 by <span className="font-medium" style={{ color: "#dd2d4a" }}>LB INFOTECH</span></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
