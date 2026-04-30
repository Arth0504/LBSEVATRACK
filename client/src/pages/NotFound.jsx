import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-warm-page flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="font-serif font-black text-stone-100 leading-none select-none mb-2"
             style={{ fontSize: "clamp(120px, 22vw, 200px)" }}>
          404
        </div>
        <div className="text-5xl mb-6 animate-float">🛕</div>
        <h2 className="font-serif text-2xl font-bold text-stone-800 mb-3">Page Not Found</h2>
        <p className="text-stone-400 text-base leading-relaxed mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button onClick={() => navigate("/")} className="btn-primary px-10 py-3.5 text-base gap-2">
          <Home size={17} /> Go Back Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;
