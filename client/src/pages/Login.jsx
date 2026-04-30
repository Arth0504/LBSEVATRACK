import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { toast } from "react-toastify";
import { BookOpen, ArrowRight } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      toast.success("Login Successful 🙏");
      setLoading(true);
      setTimeout(() => navigate("/"), 1200);
    } catch { toast.error("Invalid email or password ❌"); }
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-gray-200 rounded-full animate-spin mx-auto mb-4" style={{ borderTopColor: "#dd2d4a" }} />
        <p className="font-serif text-gray-600 text-lg">Signing you in...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative overflow-hidden"
           style={{ background: "linear-gradient(135deg, #1e1e1e 0%, #141414 100%)" }}>
        <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: "url(/somanth-hero.png)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(221,45,74,0.18) 0%, transparent 60%)" }} />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #dd2d4a, #b8203a)", boxShadow: "0 4px 14px rgba(221,45,74,0.35)" }}>
              <span className="text-white font-bold font-serif">S</span>
            </div>
            <span className="font-serif text-2xl font-bold text-white">SevaTrack</span>
          </div>
          <div>
            <p className="font-devanagari text-white/60 text-xl leading-relaxed mb-6">
              ॐ नमः शिवाय 🙏
            </p>
            <h2 className="font-serif text-3xl font-bold text-white leading-tight mb-4">
              Your Sacred Journey<br />Begins Here
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Book darshan slots at India's most sacred temples. Simple, peaceful, and organized.
            </p>
          </div>
          <p className="text-gray-600 text-xs">© {new Date().getFullYear()} SevaTrack</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #dd2d4a, #b8203a)" }}>
              <span className="text-white font-bold font-serif text-sm">S</span>
            </div>
            <span className="font-serif text-xl font-bold text-gray-800">SevaTrack</span>
          </div>

          <div className="mb-8">
            <h1 className="font-serif text-3xl font-bold text-gray-800 mb-2">Welcome back 🙏</h1>
            <p className="text-gray-400 text-sm">Sign in to continue your darshan journey</p>
          </div>

          <div className="card p-8 shadow-md">
            <form onSubmit={submit} className="space-y-5">
              <div>
                <label className="label">Email Address</label>
                <input className="input" type="email" name="email" placeholder="you@email.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
              </div>
              <div>
                <label className="label">Password</label>
                <input className="input" type="password" name="password" placeholder="••••••••" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
              </div>
              <button type="submit" className="btn-primary w-full py-3.5 text-base mt-2">
                Sign In <ArrowRight size={17} />
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-gray-400 mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold transition-colors" style={{ color: "#dd2d4a" }}>Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
