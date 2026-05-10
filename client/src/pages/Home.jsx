import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import API from "../api/axios";
import { MapPin, ChevronRight, Bell } from "lucide-react";
import "./home.css";

const slides = [
  { image: "/somanth-hero.png",  shlok: "ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्" },
  { image: "/dwarika-hero.png",  shlok: "यदा यदा हि धर्मस्य ग्लानिर्भवति भारत" },
  { image: "/ambaji-hero.png",   shlok: "सर्वमङ्गलमाङ्गल्ये शिवे सर्वार्थसाधिके" },
];

export default function Home() {
  const [current, setCurrent] = useState(0);
  const [temples, setTemples] = useState([]);
  const [notes, setNotes] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const t = setInterval(() => setCurrent(p => (p + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    API.get("/temples").then(r => setTemples(r.data)).catch(() => {});
    API.get("/notes").then(r => setNotes(r.data)).catch(() => {});
  }, []);

  const goTemple = (id) => !token ? navigate("/login") : navigate(`/temple/${id}`);

  const getImg = (name = "") => {
    const l = name.toLowerCase();
    if (l.includes("dwarka"))  return "/dw1.png";
    if (l.includes("somnath")) return "/Sm1.png";
    if (l.includes("ambaji"))  return "/am1.png";
    return "/somanth-hero.png";
  };

  return (
    <div className="h-page">
      <Navbar />

      {/* ── Shlok strip ── */}
      <div className="shlok-strip">
        <span className="shlok-text">{slides[current].shlok}</span>
      </div>

      {/* ── Hero Slideshow ── */}
      <section className="h-hero">
        {slides.map((s, i) => (
          <div
            key={i}
            className={`h-slide ${i === current ? "h-slide-active" : ""}`}
            style={{ backgroundImage: `url(${s.image})` }}
          />
        ))}
        <div className="h-hero-overlay" />

        <div className="h-hero-content">
          <p className="h-hero-label">🪷 Digital Darshan Booking</p>
          <h1 className="h-hero-title">
            Book Your Sacred<br />
            <span className="h-hero-accent">Darshan</span> Online
          </h1>
          <p className="h-hero-sub">Peaceful. Organized. Divine.</p>
          <div className="h-hero-btns">
            <button className="h-btn-primary" onClick={() => navigate("/temples")}>
              Book Darshan
            </button>
            <button className="h-btn-ghost" onClick={() => navigate("/temples")}>
              Explore Temples
            </button>
          </div>
        </div>

        {/* Dots */}
        <div className="h-dots">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-dot ${i === current ? "h-dot-active" : ""}`}
            />
          ))}
        </div>
      </section>

      {/* ── Featured Temples ── */}
      <section className="h-section">
        <div className="h-container">
          <div className="h-section-head">
            <span className="h-badge">🛕 Sacred Places</span>
            <h2 className="h-section-title">Featured Temples</h2>
            <p className="h-section-sub">Divine destinations filled with eternal faith</p>
          </div>

          <div className="h-temples-grid">
            {temples.slice(0, 3).map(t => (
              <div key={t._id} className="h-temple-card" onClick={() => goTemple(t._id)}>
                <img src={getImg(t.name)} alt={t.name} className="h-temple-img" />
                <div className="h-temple-overlay" />
                <div className="h-temple-info">
                  <h3 className="h-temple-name">{t.name}</h3>
                  <p className="h-temple-loc"><MapPin size={12} /> {t.location}</p>
                  <button
                    className="h-temple-btn"
                    onClick={e => { e.stopPropagation(); goTemple(t._id); }}
                  >
                    Book Darshan <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="h-center">
            <button className="h-btn-outline" onClick={() => navigate("/temples")}>
              View All Temples <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* ── Notice Board ── */}
      {notes.length > 0 && (
        <section className="h-section h-section-cream">
          <div className="h-container">
            <div className="h-section-head">
              <span className="h-badge">📢 Announcements</span>
              <h2 className="h-section-title">Notice Board</h2>
            </div>

            <div className="h-notes-grid">
              {notes.map((n, i) => (
                <div key={n._id || i} className="h-note-card">
                  <div className="h-note-icon"><Bell size={16} /></div>
                  <h4 className="h-note-title">{n.title}</h4>
                  <p className="h-note-msg">{n.message}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Footer ── */}
      <footer className="h-footer">
        <div className="h-container h-footer-inner">
          <div className="h-footer-brand">
            <span className="h-footer-logo">🛕 SevaTrack</span>
            <p className="h-footer-tagline">A digital darshan management system for peaceful, organized temple visits.</p>
          </div>
          <div className="h-footer-links">
            <h4 className="h-footer-col-title">Quick Links</h4>
            {[["Home", "/"], ["Temples", "/temples"], ["My Bookings", "/my-bookings"], ["Login", "/login"]].map(([l, p]) => (
              <a key={p} href={p} className="h-footer-link">{l}</a>
            ))}
          </div>
          <div className="h-footer-links">
            <h4 className="h-footer-col-title">Temples</h4>
            {temples.slice(0, 3).map(t => (
              <span key={t._id} className="h-footer-link" onClick={() => goTemple(t._id)}>{t.name}</span>
            ))}
          </div>
        </div>
        <div className="h-footer-bottom">
          <span>© {new Date().getFullYear()} SevaTrack. All Rights Reserved.</span>
          <span>Made with 🌸 by <strong>LB INFOTECH</strong></span>
        </div>
      </footer>
    </div>
  );
}
