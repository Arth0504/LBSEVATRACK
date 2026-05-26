import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import { MapPin, ArrowLeft, ArrowRight, Search } from "lucide-react";

const Temples = () => {
  const [temples, setTemples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;

    API.get("/temples")
      .then((r) => {
        if (!alive) return;
        setTemples(Array.isArray(r.data) ? r.data : []);
        setError("");
      })
      .catch((err) => {
        if (!alive) return;
        setTemples([]);
        setError(err.response?.data?.message || err.userMessage || "Failed to load temples");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const getImg = (name = "") => {
    const l = name.toLowerCase();
    if (l.includes("dwarka")) return "/dwarka.png";
    if (l.includes("somnath")) return "/somnath.png";
    if (l.includes("ambaji")) return "/ambaji.png";
    return "/hero-combined.jpg";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sacred-25 via-white to-sacred-50/70">
      <Navbar />

      <header className="relative overflow-hidden border-b border-sacred-200/60 bg-sacred-25 pt-28">
        <div className="pointer-events-none absolute inset-0 bg-serene-waves opacity-55" />
        <div className="pointer-events-none absolute inset-0 bg-mesh-1 opacity-80" />
        <div className="section-container relative py-14 md:py-20">
          <button onClick={() => navigate("/")} className="mb-8 flex items-center gap-2 text-sm text-stone-500 transition-colors hover:text-sacred-800">
            <ArrowLeft size={16} /> Back to Home
          </button>
          <div className="mx-auto max-w-3xl text-center">
            <span className="badge-accent mb-4">Sacred Destinations</span>
            <h1 className="mt-4 font-serif text-5xl font-medium text-stone-800 md:text-7xl">Choose Your Temple</h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-stone-600">
              Select a serene destination and continue into the live booking flow with refined details and clear availability.
            </p>
            <p className="mt-5 text-sm font-medium text-stone-500">
              {loading ? "Loading temples..." : `${temples.length} temples available`}
            </p>
          </div>
        </div>
      </header>

      <main className="section-container py-12 md:py-16">
        {loading ? (
          <div className="py-24 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-sacred-200 bg-white/70 text-sacred-600 shadow-sm">
              <Search size={22} />
            </div>
            <p className="text-lg text-stone-500">Loading temples...</p>
          </div>
        ) : error ? (
          <div className="py-24 text-center">
            <p className="text-lg text-stone-500">{error}</p>
            <button onClick={() => window.location.reload()} className="btn-primary mt-5 px-8 py-3">Try Again</button>
          </div>
        ) : temples.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-lg text-stone-500">No temples are available yet.</p>
          </div>
        ) : (
          <div className="mx-auto max-w-5xl space-y-6">
            {temples.map((t) => (
              <article
                key={t._id}
                className="group flex cursor-pointer flex-col overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/72 p-3 shadow-card backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-sacred-200 hover:bg-white/85 hover:shadow-card-hover md:flex-row md:gap-5"
                onClick={() => navigate(`/temple/${t._id}`)}
              >
                <div className="relative h-56 overflow-hidden rounded-[1.25rem] md:h-auto md:w-72 md:shrink-0">
                  <img src={getImg(t.name)} alt={t.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-card-overlay" />
                </div>

                <div className="flex flex-1 flex-col justify-center p-5 md:px-3 md:py-7">
                  <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full border border-sacred-200 bg-sacred-50/80 px-3 py-1 text-xs font-medium text-sacred-700">
                    <MapPin size={12} /> {t.location}
                  </span>
                  <h3 className="font-serif text-3xl font-medium text-stone-800 md:text-4xl">{t.name}</h3>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600">
                    {t.description || "A sacred temple with a calm digital booking path for your next darshan."}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/temple/${t._id}`);
                    }}
                    className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-sacred-800 px-5 py-2.5 text-sm font-semibold text-white shadow-accent transition-all hover:bg-sacred-900 hover:shadow-glow-sm"
                  >
                    View Details & Book <ArrowRight size={15} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Temples;
