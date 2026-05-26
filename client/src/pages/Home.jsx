import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import API from "../api/axios";
import HomeHero from "../components/home/HomeHero";
import HomeStats from "../components/home/HomeStats";
import HomeFeatures from "../components/home/HomeFeatures";
import HomeTemplesSection from "../components/home/HomeTemplesSection";
import HomeNoticesSection from "../components/home/HomeNoticesSection";
import HomeTestimonials from "../components/home/HomeTestimonials";
import HomeCTA from "../components/home/HomeCTA";
import HomeFooter from "../components/home/HomeFooter";

const slides = [
  { image: "/somanth-hero.png", shlok: "A serene way to reserve temple visits with clarity and care" },
  { image: "/dwarika-hero.png", shlok: "Plan your darshan with quiet confidence, from booking to entry" },
  { image: "/ambaji-hero.png", shlok: "Premium scheduling for sacred journeys and peaceful arrivals" },
];

const getImg = (name = "") => {
  const l = name.toLowerCase();
  if (l.includes("dwarka")) return "/dw1.png";
  if (l.includes("somnath")) return "/Sm1.png";
  if (l.includes("ambaji")) return "/am1.png";
  return "/somanth-hero.png";
};

export default function Home() {
  const [current, setCurrent] = useState(0);
  const [temples, setTemples] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loadingTemples, setLoadingTemples] = useState(true);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const t = setInterval(() => setCurrent((p) => (p + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    API.get("/temples")
      .then((r) => setTemples(r.data))
      .catch(() => setTemples([]))
      .finally(() => setLoadingTemples(false));

    API.get("/notes")
      .then((r) => setNotes(r.data))
      .catch(() => setNotes([]))
      .finally(() => setLoadingNotes(false));
  }, []);

  const goTemple = (id) => (!token ? navigate("/login") : navigate(`/temple/${id}`));

  return (
    <div className="min-h-screen bg-gradient-to-b from-sacred-25 via-white to-sacred-50/70 text-stone-800 antialiased">
      <Navbar />

      <main>
        <HomeHero
          slides={slides}
          current={current}
          setCurrent={setCurrent}
          onBook={() => navigate("/temples")}
          onExplore={() => navigate("/temples")}
        />

        <HomeTemplesSection
          temples={temples}
          loading={loadingTemples}
          getImg={getImg}
          onTempleNavigate={goTemple}
        />

        <HomeFeatures />

        <HomeStats templeCount={temples.length} loading={loadingTemples} />

        <HomeNoticesSection notes={notes} loading={loadingNotes} />

        <HomeTestimonials />

        <HomeCTA />
      </main>

      <HomeFooter temples={temples} templesLoading={loadingTemples} onTempleClick={goTemple} />
    </div>
  );
}
