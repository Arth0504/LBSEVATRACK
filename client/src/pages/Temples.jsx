import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import { MapPin, ArrowLeft, ArrowRight } from "lucide-react";

const Temples = () => {
  const [temples, setTemples] = useState([]);
  const navigate = useNavigate();

  useEffect(() => { API.get("/temples").then(r => setTemples(r.data)).catch(() => {}); }, []);

  const getImg = (name = "") => {
    const l = name.toLowerCase();
    if (l.includes("dwarka"))  return "/dwarka.png";
    if (l.includes("somnath")) return "/somnath.png";
    if (l.includes("ambaji"))  return "/ambaji.png";
    return "/placeholder.jpg";
  };

  return (
    <div className="min-h-screen bg-warm-page">
      <Navbar />

      {/* Page header */}
      <div className="bg-warm-section border-b border-stone-200">
        <div className="section-container py-12">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm text-stone-400 hover:text-stone-700 transition-colors mb-6">
            <ArrowLeft size={16} /> Back to Home
          </button>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="badge-primary mb-3">🛕 Sacred Destinations</span>
              <h1 className="font-serif text-4xl font-bold text-stone-800 mt-2">Choose Your Temple</h1>
              <p className="text-stone-400 mt-2">Select a sacred destination and begin your divine journey</p>
            </div>
            <p className="text-sm text-stone-400 font-medium">{temples.length} temples available</p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="section-container py-12">
        {temples.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🛕</div>
            <p className="text-stone-400 text-lg">Loading temples...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {temples.map(t => (
              <div key={t._id} className="card overflow-hidden group hover:shadow-lg hover:-translate-y-1.5 transition-all duration-400 cursor-pointer"
                   onClick={() => navigate(`/temple/${t._id}`)}>
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  <img src={getImg(t.name)} alt={t.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="badge bg-white/90 text-stone-700 text-xs shadow-sm">
                      <MapPin size={11} /> {t.location}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-serif text-xl font-bold text-stone-800 mb-1">{t.name}</h3>
                  <p className="text-sm text-stone-400 mb-5 line-clamp-2">{t.description || "A sacred temple with divine blessings"}</p>
                  <button
                    onClick={e => { e.stopPropagation(); navigate(`/temple/${t._id}`); }}
                    className="btn-primary w-full py-3 text-sm"
                  >
                    View Details & Book <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Temples;
