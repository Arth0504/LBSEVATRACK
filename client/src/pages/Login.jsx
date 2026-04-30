import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", formData);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      toast.success("Login Successful 🙏");
      setLoading(true);
      setTimeout(() => navigate("/"), 1500);
    } catch {
      toast.error("Invalid email or password ❌");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-rose-25 bg-mesh flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-rose-200 border-t-blush-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="font-serif text-warm-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-rose-25 bg-mesh flex items-center justify-center px-4 py-12">
      {/* Background orbs */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-rose-100/40 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-blush-100/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="card-base p-8 md:p-10">
          {/* Icon */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-rose-100 to-blush-100 flex items-center justify-center mx-auto mb-4 shadow-soft animate-float">
              <img src="https://cdn-icons-png.flaticon.com/512/3097/3097130.png" alt="temple" className="w-9 h-9" />
            </div>
            <h1 className="font-serif text-2xl font-semibold text-warm-800">Pranam 🙏</h1>
            <p className="text-sm text-warm-400 mt-1">Seva Track par aapka swagat hai</p>
          </div>

          <div className="ornament-line mb-6"><span className="text-rose-200">🌸</span></div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-warm-500 mb-1.5">Email</label>
              <input className="input-base" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="your@email.com" required />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-warm-500 mb-1.5">Password</label>
              <input className="input-base" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required />
            </div>
            <button type="submit" className="btn-primary w-full py-3.5 text-base mt-2">
              Login 🙏
            </button>
          </form>

          <p className="text-center text-sm text-warm-400 mt-5">
            Don't have an account?{" "}
            <Link to="/register" className="text-blush-400 font-medium hover:text-blush-500 transition-colors">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
