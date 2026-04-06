import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import API from "../api/axios";
import "./home.css";

const slides = [
  {
    image: "/somanth-hero.png",
    shlok: "ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् |\nउर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय मामृतात् ॥"
  },
  {
    image: "/dwarika-hero.png",
    shlok: "यदा यदा हि धर्मस्य ग्लानिर्भवति भारत ।\nअभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम् ॥"
  },
  {
    image: "/ambaji-hero.png",
    shlok: "सर्वमङ्गलमाङ्गल्ये शिवे सर्वार्थसाधिके ।\nशरण्ये त्र्यम्बके गौरी नारायणि नमोऽस्तुते ॥"
  }
];

export default function Home() {
  const [current, setCurrent] = useState(0);
  const [temples, setTemples] = useState([]);
  const [notes, setNotes] = useState([]);
  const [queryData, setQueryData] = useState({ name: "", email: "", message: "" });

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const cursorRef = useRef(null);
  const cursorDotRef = useRef(null);
  
  // Refs for scroll animations
  const sectionRefs = useRef([]);
  sectionRefs.current = [];

  const addToRefs = (el) => {
    if (el && !sectionRefs.current.includes(el)) {
      sectionRefs.current.push(el);
    }
  };

  /* AUTO SLIDER */
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  /* FETCH TEMPLES & NOTES */
  useEffect(() => {
    fetchTemples();
    fetchNotes();
  }, []);

  const fetchTemples = async () => {
    try {
      const res = await API.get("/temples");
      setTemples(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchNotes = async () => {
    try {
      const res = await API.get("/notes");
      setNotes(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  /* QUERY LOGIC */
  const handleQueryChange = (e) => {
    const { name, value } = e.target;
    setQueryData({ ...queryData, [name]: value });
  };

  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/query", queryData);
      alert("Question submitted successfully!");
      setQueryData({ name: "", email: "", message: "" });
    } catch (err) {
      console.log(err);
      alert("Failed to submit question. Please try again.");
    }
  };

  /* DARSHAN CLICK */
  const handleDarshanClick = (id) => {
    if (!token) navigate("/login");
    else navigate(`/temple/${id}`);
  };

  /* TEMPLE IMAGE LOGIC */
  const getTempleImage = (name) => {
    if (!name) return "/default-temple.png";
    const lower = name.toLowerCase();
    if (lower.includes("dwarka")) return "/dw1.png";
    if (lower.includes("somnath")) return "/Sm1.png";
    if (lower.includes("ambaji")) return "/am1.png";
    return "/default-temple.png";
  };

  /* CURSOR EFFECT */
  useEffect(() => {
    const moveCursor = (e) => {
      if (cursorRef.current && cursorDotRef.current) {
        // Smooth trailing effect for outer cursor
        cursorRef.current.animate({
          left: `${e.clientX}px`,
          top: `${e.clientY}px`
        }, { duration: 500, fill: "forwards" });
        
        // Instant follow for inner dot
        cursorDotRef.current.style.left = `${e.clientX}px`;
        cursorDotRef.current.style.top = `${e.clientY}px`;
      }
    };

    const clickEffect = () => {
      if(cursorRef.current) {
        cursorRef.current.classList.add("click");
        setTimeout(() => {
          cursorRef.current.classList.remove("click");
        }, 150);
      }
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mousedown", clickEffect);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mousedown", clickEffect);
    };
  }, []);

  /* SCROLL ANIMATIONS */
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in-visible');
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    const currents = sectionRefs.current;
    currents.forEach((ref) => {
      observer.observe(ref);
    });

    return () => {
      currents.forEach(ref => observer.unobserve(ref));
    };
  }, [temples]);

  // Generate particles
  const particles = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    animationDuration: `${Math.random() * 10 + 10}s`,
    animationDelay: `${Math.random() * 5}s`,
    size: `${Math.random() * 3 + 1}px`
  }));

  return (
    <>
      <div ref={cursorRef} className="smooth-cursor-outline"></div>
      <div ref={cursorDotRef} className="smooth-cursor-dot"></div>

      {/* Global Animated Background with Particles */}
      <div className="global-bg">
        <div className="global-light-1"></div>
        <div className="global-light-2"></div>
      </div>
      <div className="particles">
        {particles.map(p => (
          <span 
            key={p.id} 
            style={{
              left: p.left,
              width: p.size,
              height: p.size,
              animationDuration: p.animationDuration,
              animationDelay: p.animationDelay
            }}
          ></span>
        ))}
      </div>

      <Navbar />

      <div className="home-container fade-in-section" ref={addToRefs}>
        <h2 className="message">
          सदा भवानी दाहिनी, सम्मुख रहें गणेश ।<br/>
          पंचदेव रक्षा करें, ब्रह्मा विष्णु महेश ॥
        </h2>

        <div className="home-hero">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`home-hero-slide ${index === current ? 'active' : ''}`}
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="hero-overlay-glass">
                <div className="home-hero-content">
                  <div className="home-hero-shlok">
                    {slide.shlok.split("\n").map((line, i) => (
                      <p key={i} className={`stagger-text-${i}`}>{line}</p>
                    ))}
                  </div>
                  <button 
                    className="hero-cta-btn stagger-text-2"
                    onClick={() => navigate('/temples')}
                  >
                    Book Darshan
                    <span className="btn-glow"></span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="dots">
          {slides.map((_, index) => (
            <span
              key={index}
              className={`dot ${current === index ? "active" : ""}`}
              onClick={() => setCurrent(index)}
            ></span>
          ))}
        </div>
      </div>

      <section className="notice-section fade-in-section" ref={addToRefs}>
        <div className="section-header">
          <h2 className="section-title">Notice Board</h2>
          <div className="title-underline"></div>
        </div>

        <div className="notice-container">
          {!notes || notes.length === 0 ? (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#666', padding: '2rem' }}>No notices available</p>
          ) : (
            notes.map((note, index) => (
              <div 
                className="notice-card" 
                key={note._id || index}
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <h3>{note.title}</h3>
                <p>{note.message}</p>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="featured fade-in-section" ref={addToRefs}>
        <div className="section-header">
          <h2 className="section-title">Featured Temples</h2>
          <p className="section-sub">Divine places filled with eternal faith and blessings</p>
          <div className="title-underline"></div>
        </div>

        <div className="featured-grid">
          {temples.slice(0, 3).map((temple, index) => (
            <div 
              className="featured-card" 
              key={temple._id}
              style={{ animationDelay: `${index * 0.15}s` }}
              onClick={() => handleDarshanClick(temple._id)}
            >
              <div className="card-image-wrapper">
                <img src={getTempleImage(temple.name)} alt={temple.name} />
                <div className="card-gradient"></div>
              </div>
              <div className="featured-overlay">
                <div className="featured-info">
                  <h3>{temple.name}</h3>
                  <p className="temple-location">
                    <i className="location-icon">📍</i> {temple.location}
                  </p>
                </div>
                <button 
                  className="featured-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDarshanClick(temple._id);
                  }}
                >
                  View Darshan <span className="arrow">→</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="how-section fade-in-section" ref={addToRefs}>
        <div className="section-header">
          <h2 className="section-title">How It Works</h2>
          <div className="title-underline"></div>
        </div>

        <div className="how-container">
          {[
            { num: 1, title: "Register", desc: "Create account quickly" },
            { num: 2, title: "Select Temple", desc: "Choose your destination" },
            { num: 3, title: "Choose Slot", desc: "Select time of visit" },
            { num: 4, title: "Visit & Darshan", desc: "Show QR code" }
          ].map((step, idx, arr) => (
            <div className="how-step-wrapper" key={step.num}>
              <div className="how-step" style={{ animationDelay: `${idx * 0.2}s` }}>
                <div className="step-glow"></div>
                <div className="step-circle">{step.num}</div>
                <h4>{step.title}</h4>
                <p>{step.desc}</p>
              </div>
              {idx < arr.length - 1 && (
                <div className="step-arrow" style={{ animationDelay: `${idx * 0.2 + 0.1}s` }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="query-section fade-in-section" ref={addToRefs}>
        <div className="section-header">
          <h2 className="section-title">Have Any Question?</h2>
          <p className="section-sub">Ask before booking your darshan</p>
          <div className="title-underline"></div>
        </div>
        
        <form className="query-form" onSubmit={handleQuerySubmit}>
          <input 
            type="text" 
            name="name" 
            placeholder="Your Name" 
            value={queryData.name} 
            onChange={handleQueryChange} 
            required 
          />
          <input 
            type="email" 
            name="email" 
            placeholder="Your Email" 
            value={queryData.email} 
            onChange={handleQueryChange} 
            required 
          />
          <textarea 
            name="message" 
            placeholder="Your Message" 
            value={queryData.message} 
            onChange={handleQueryChange} 
            rows="4" 
            required 
          ></textarea>
          <button type="submit" className="query-btn">
            Submit Question
            <span className="btn-glow"></span>
          </button>
        </form>
      </section>

      <footer className="footer fade-in-section" ref={addToRefs}>
        <div className="footer-gradient-top"></div>
        <div className="footer-container">
          <div className="footer-col brand-col">
            <h3>SevaTrack</h3>
            <p>Digital darshan management system for peaceful temple visits.</p>
            <div className="brand-glow"></div>
          </div>
          <div className="footer-col">
            <h4>Quick Links</h4>
            <a href="/">Home</a>
            <a href="/my-bookings">My Bookings</a>
            <a href="/login">Login</a>
          </div>
          <div className="footer-col">
            <h4>Featured Temples</h4>
            {temples.slice(0, 3).map((t) => (
              <span key={t._id} onClick={() => handleDarshanClick(t._id)} className="footer-link">
                {t.name}
              </span>
            ))}
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} SevaTrack. All Rights Reserved.</p>
          <p className="madeby">Made by LB INFOTECH</p>
        </div>
      </footer> 
    </>
  );
}