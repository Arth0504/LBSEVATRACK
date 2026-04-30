import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";

const Temples = () => {
  const [temples, setTemples] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/temples").then((r) => setTemples(r.data)).catch(() => {});
  }, []);

  const getTempleImage = (name = "") => {
    const l = name.toLowerCase();
    if (l.includes("dwarka"))  return "/dwarka.png";
    if (l.includes("somnath")) return "/somnath.png";
    if (l.includes("ambaji"))  return "/ambaji.png";
    return "/placeholder.jpg";
  };

  return (
    <div className="min-h-screen bg-rose-25 bg-mesh">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-b from-rose-50 to-transparent py-14 px-5 text-center">
        <span className="badge-rose mb-3">🛕 Sacred Destinations</span>
        <h1 className="font-serif text-4xl md:text-5xl font-semibold text-warm-800 mt-3">Choose Your Temple</h1>
        <p className="text-warm-400 mt-3 text-base max-w-md mx-auto">Select a sacred destination and begin your divine journey</p>
        <div className="ornament-line mt-5 max-w-xs mx-auto"><span className="text-rose-200 text-lg">🌸</span></div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-5 md:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {temples.map((temple) => (
            <div key={temple._id} className="card-base overflow-hidden group">
              {/* Image */}
              <div className="relative h-52 overflow-hidden">
                <img
                  src={getTempleImage(temple.name)}
                  alt={temple.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-serif text-xl font-semibold text-warm-800 mb-1">{temple.name}</h3>
                <p className="text-sm text-warm-400 mb-5">📍 {temple.location}</p>
                <button
                  onClick={() => navigate(`/temple/${temple._id}`)}
                  className="btn-primary w-full py-3"
                >
                  View Details & Slots
                </button>
              </div>
            </div>
          ))}
        </div>

        {temples.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🛕</div>
            <p className="text-warm-400 text-lg">Loading temples...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Temples;
