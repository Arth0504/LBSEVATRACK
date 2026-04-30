import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-rose-25 bg-mesh flex items-center justify-center px-4">
      <div className="fixed top-0 left-0 w-96 h-96 bg-rose-100/40 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-blush-100/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="text-center relative z-10">
        <div className="font-serif font-bold text-rose-100 leading-none mb-4" style={{ fontSize: "clamp(100px,20vw,180px)" }}>
          404
        </div>
        <div className="text-5xl mb-6 animate-float">🛕</div>
        <h2 className="font-serif text-2xl md:text-3xl font-semibold text-warm-800 mb-3">Page Not Found</h2>
        <p className="text-warm-400 text-base max-w-sm mx-auto mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <button onClick={() => navigate("/")} className="btn-primary px-10 py-3.5 text-base">
          Go Back Home 🙏
        </button>
      </div>
    </div>
  );
};

export default NotFound;
