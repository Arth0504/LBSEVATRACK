import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import API from "../api/axios";
import { ArrowRight, MapPin, ChevronRight } from "lucide-react";

const slides = [
  { image: "/somanth-hero.png",  shlok: "ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् |\nउर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय मामृतात् ॥" },
  { image: "/dwarika-hero.png",  shlok: "यदा यदा हि धर्मस्य ग्लानिर्भवति भारत ।\nअभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम् ॥" },
  { image: "/ambaji-hero.png",   shlok: "सर्वमङ्गलमाङ्गल्ये शिवे सर्वार्थसाधिके ।\nशरण्ये त्र्यम्बके गौरी नारायणि नमोऽस्तुते ॥" },
];

const steps = [
  { num: "01", title: "Create Account",  desc: "Register in under a minute with your email",  icon: "👤" },
  { num: "02", title: "Choose Temple",   desc: "Browse our curated list of sacred temples",    icon: "🛕" },
  { num: "03", title: "Book a Slot",     desc: "Select your preferred date and time slot",     icon: "📅" },
  { num: "04", title: "Visit & Darshan", desc: "Show your QR code at the entry gate",          icon: "✨" },
];

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
    <div className="min-h-screen bg-warm-page">
      <Navbar />

      {/* ══════════════════════════════════════════
          HERO — Full viewport, strong overlay
          ══════════════════════════════════════════ */}
      <section className="relative" style={{ height: "clamp(420px, 58vw, 620px)" }}>
        {slides.map((s, i) => (
          <div
            key={i}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${i === current ? "opacity-100 z-10" : "opacity-0 z-0"}`}
            style={{ backgroundImage: `url(${s.image})` }}
          />
        ))}

        {/* Strong gradient overlay */}
        <div className="absolute inset-0 z-20" style={{ background: "linear-gradient(105deg, rgba(15,8,12,0.82) 0%, rgba(15,8,12,0.55) 45%, rgba(15,8,12,0.15) 100%)" }} />

        {/* Sanskrit greeting strip */}
        <div className="absolute top-0 left-0 right-0 z-30 bg-black/20 backdrop-blur-sm py-2.5 text-center">
          <p className="font-devanagari text-sm text-white/75 tracking-widest">
            सदा भवानी दाहिनी, सम्मुख रहें गणेश 🪷
          </p>
        </div>

        {/* Hero content */}
        <div className="absolute inset-0 z-30 flex items-center">
          <div className="section-container w-full pt-10">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
                <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
                <span className="text-white/80 text-xs font-medium tracking-wide">Digital Darshan Booking</span>
              </div>

              <h1 className="font-serif text-white font-bold mb-4 leading-tight drop-shadow-lg"
                  style={{ fontSize: "clamp(2rem, 4.5vw, 3.6rem)" }}>
                Book Your Sacred<br />
                <span className="text-primary-300">Darshan</span> Online
              </h1>

              <p className="font-devanagari text-white/80 text-lg md:text-xl leading-relaxed mb-8 drop-shadow">
                {slides[current].shlok.split("\n").map((l, j) => <span key={j} className="block">{l}</span>)}
              </p>

              <div className="flex flex-wrap gap-4">
                <button onClick={() => navigate("/temples")} className="btn-primary text-base px-8 py-3.5 shadow-primary-lg">
                  Book Darshan <ArrowRight size={18} />
                </button>
                <button onClick={() => navigate("/temples")} className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/25 text-white text-base font-medium hover:bg-white/20 transition-all duration-200">
                  Explore Temples
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Slide dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`rounded-full transition-all duration-300 ${i === current ? "w-7 h-2.5 bg-white" : "w-2.5 h-2.5 bg-white/40 hover:bg-white/60"}`}
            />
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          STATS STRIP
          ══════════════════════════════════════════ */}
      <div className="bg-white border-b border-stone-150 shadow-xs">
        <div className="section-container py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-x divide-stone-100">
            {[["3+", "Sacred Temples"], ["10K+", "Happy Devotees"], ["50K+", "Darshans Booked"], ["100%", "Secure Booking"]].map(([val, label]) => (
              <div key={label} className="text-center px-4 first:pl-0 last:pr-0">
                <p className="font-serif text-2xl font-bold text-gradient">{val}</p>
                <p className="text-xs text-stone-400 mt-0.5 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          NOTICE BOARD
          ══════════════════════════════════════════ */}
      {notes.length > 0 && (
        <section className="bg-warm-section py-16 fade-section" ref={addRef}>
          <div className="section-container">
            <div className="text-center mb-10">
              <span className="badge-primary mb-3">📢 Announcements</span>
              <h2 className="section-heading mt-2">Notice Board</h2>
              <div className="divider" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {notes.map((n, i) => (
                <div key={n._id || i} className="card p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center mb-4 text-lg">📌</div>
                  <h3 className="font-serif text-lg font-semibold text-stone-800 mb-2">{n.title}</h3>
                  <p className="text-sm text-stone-500 leading-relaxed">{n.message}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════
          FEATURED TEMPLES
          ══════════════════════════════════════════ */}
      <section className="py-20 fade-section" ref={addRef}>
        <div className="section-container">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="badge-primary mb-3">🛕 Sacred Places</span>
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
                className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-2"
                style={{ height: "400px" }}
              >
                <img
                  src={getImg(t.name)}
                  alt={t.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                  style={{ transition: "transform 0.7s ease" }}
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-card-overlay" />

                {/* Content */}
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
                               bg-white text-primary-600 text-sm font-semibold px-5 py-2.5 rounded-xl w-fit
                               hover:bg-primary-50 shadow-md"
                  >
                    Book Darshan →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS — alternating bg
          ══════════════════════════════════════════ */}
      <section className="bg-warm-section py-20 fade-section" ref={addRef}>
        <div className="section-container">
          <div className="text-center mb-14">
            <span className="badge-primary mb-3">✨ Simple Process</span>
            <h2 className="section-heading mt-2">How It Works</h2>
            <p className="section-sub">Book your darshan in 4 easy steps</p>
            <div className="divider" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={i} className="relative group">
                {/* Connector */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-9 left-[calc(100%-0px)] w-full h-px z-0"
                       style={{ background: "linear-gradient(90deg, #E5C0CB, transparent)" }} />
                )}
                <div className="card p-7 text-center relative z-10 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                  <div className="w-16 h-16 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center mx-auto mb-5 text-2xl shadow-xs group-hover:shadow-sm transition-shadow">
                    {s.icon}
                  </div>
                  <span className="text-xs font-bold text-primary-400 tracking-widest uppercase">{s.num}</span>
                  <h4 className="font-serif text-lg font-semibold text-stone-800 mt-1.5 mb-2">{s.title}</h4>
                  <p className="text-sm text-stone-400 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          QUERY FORM
          ══════════════════════════════════════════ */}
      <section className="py-20 fade-section" ref={addRef}>
        <div className="section-container">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <span className="badge-primary mb-3">💬 Get in Touch</span>
              <h2 className="section-heading mt-2">Have a Question?</h2>
              <p className="section-sub">Ask us before booking your darshan</p>
              <div className="divider" />
            </div>

            <div className="card p-8 md:p-10 shadow-md">
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

      {/* ══════════════════════════════════════════
          FOOTER — dark, proper contrast
          ══════════════════════════════════════════ */}
      <footer className="bg-footer-grad text-stone-300 fade-section" ref={addRef}>
        <div className="section-container py-14">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary-grad flex items-center justify-center">
                  <span className="text-white text-sm font-bold">S</span>
                </div>
                <span className="font-serif text-xl font-bold text-white">SevaTrack</span>
              </div>
              <p className="text-sm text-stone-400 leading-relaxed max-w-xs">
                A digital darshan management system for peaceful, organized, and seamless temple visits.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-5">Quick Links</h4>
              {[["Home", "/"], ["Temples", "/temples"], ["My Bookings", "/my-bookings"], ["Login", "/login"]].map(([l, p]) => (
                <a key={p} href={p} className="block text-sm text-stone-400 hover:text-white transition-colors mb-3">{l}</a>
              ))}
            </div>

            {/* Temples */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-5">Temples</h4>
              {temples.slice(0, 3).map(t => (
                <span key={t._id} onClick={() => goTemple(t._id)} className="block text-sm text-stone-400 hover:text-white transition-colors mb-3 cursor-pointer">{t.name}</span>
              ))}
            </div>
          </div>

          <div className="border-t border-stone-700 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-xs text-stone-500">© {new Date().getFullYear()} SevaTrack. All Rights Reserved.</p>
            <p className="text-xs text-stone-500">Made with 🌸 by <span className="text-primary-400 font-medium">LB INFOTECH</span></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
