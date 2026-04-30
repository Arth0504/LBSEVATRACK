import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      {/* Subtle background orbs */}
      <div className="fixed top-0 left-0 w-96 h-96 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(221,45,74,0.04) 0%, transparent 65%)", transform: "translate(-30%, -30%)" }} />
      <div className="fixed bottom-0 right-0 w-96 h-96 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(221,45,74,0.03) 0%, transparent 65%)", transform: "translate(30%, 30%)" }} />

      <div className="text-center max-w-md relative z-10">
        {/* 404 number */}
        <div className="font-serif font-black leading-none select-none mb-2" style={{ fontSize: "clamp(120px, 22vw, 200px)", color: "#f0f0f0" }}>
          404
        </div>

        {/* Icon */}
        <div className="text-5xl mb-6 animate-float">🛕</div>

        {/* Text */}
        <h2 className="font-serif text-2xl font-bold text-gray-800 mb-3">Page Not Found</h2>
        <p className="text-gray-400 text-base leading-relaxed mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => navigate(-1)} className="btn-ghost gap-2 px-6 py-3">
            <ArrowLeft size={16} /> Go Back
          </button>
          <button onClick={() => navigate("/")} className="btn-primary gap-2 px-8 py-3 text-base">
            <Home size={17} /> Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
