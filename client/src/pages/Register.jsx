import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { BookOpen, ArrowRight } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return alert("Passwords do not match");
    try {
      await API.post("/auth/register", { name: form.name, email: form.email, password: form.password });
      alert("🌸 Registration successful! Please login.");
      navigate("/login");
    } catch (err) { alert(err.response?.data?.message || "Registration failed"); }
  };

  const fields = [
    { label: "Full Name",        name: "name",            type: "text",     ph: "Your full name" },
    { label: "Email Address",    name: "email",           type: "email",    ph: "you@email.com" },
    { label: "Password",         name: "password",        type: "password", ph: "Create a password" },
    { label: "Confirm Password", name: "confirmPassword", type: "password", ph: "Repeat password" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative overflow-hidden bg-gradient-to-br from-sacred-50 via-gold-50 to-white border-r border-sacred-200/50">
        <div className="absolute inset-0 bg-cover bg-center opacity-25" style={{ backgroundImage: "url(/ambaji-hero.png)" }} />
        <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-sacred-25/85 to-gold-50/70" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-accent" style={{ background: "linear-gradient(135deg, #9f766d, #654a45)" }}>
              <span className="text-white font-bold font-serif">S</span>
            </div>
            <span className="font-serif text-2xl font-bold text-stone-800">SevaTrack</span>
          </div>
          <div>
            <p className="font-devanagari text-sacred-800/80 text-xl leading-relaxed mb-6">🌸 शुभ यात्रा</p>
            <h2 className="font-serif text-3xl font-bold text-stone-800 leading-tight mb-4">
              Start Your<br />Spiritual Journey
            </h2>
            <p className="text-stone-600 text-sm leading-relaxed max-w-sm">
              Join thousands of devotees who book their darshan slots digitally.
            </p>
          </div>
          <p className="text-stone-500 text-xs">© {new Date().getFullYear()} SevaTrack</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center bg-sacred-25/40 px-6 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-accent" style={{ background: "linear-gradient(135deg, #9f766d, #654a45)" }}>
              <span className="text-white font-bold font-serif text-sm">S</span>
            </div>
            <span className="font-serif text-xl font-bold text-gray-800">SevaTrack</span>
          </div>

          <div className="mb-8">
            <h1 className="font-serif text-3xl font-bold text-gray-800 mb-2">Create Account 🌸</h1>
            <p className="text-gray-400 text-sm">Join us and begin your sacred journey</p>
          </div>

          <div className="card p-8 shadow-md">
            <form onSubmit={submit} className="space-y-4">
              {fields.map(f => (
                <div key={f.name}>
                  <label className="label">{f.label}</label>
                  <input className="input" type={f.type} name={f.name} placeholder={f.ph} value={form[f.name]} onChange={e => setForm({...form, [f.name]: e.target.value})} required />
                </div>
              ))}
              <button type="submit" className="btn-primary w-full py-3.5 text-base mt-2">
                Create Account <ArrowRight size={17} />
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-gray-400 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold transition-colors" style={{ color: "#dd2d4a" }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
