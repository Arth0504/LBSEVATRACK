import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) return alert("All fields are required");
    if (formData.password !== formData.confirmPassword) return alert("Passwords do not match");
    try {
      await API.post("/auth/register", { name: formData.name, email: formData.email, password: formData.password });
      alert("🌸 Shubh Yatra! Registration successful");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-rose-25 bg-mesh flex items-center justify-center px-4 py-12">
      <div className="fixed top-0 right-0 w-96 h-96 bg-rose-100/40 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-blush-100/30 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="card-base p-8 md:p-10">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-rose-100 to-blush-100 flex items-center justify-center mx-auto mb-4 shadow-soft animate-float">
              <img src="https://cdn-icons-png.flaticon.com/512/2922/2922561.png" alt="register" className="w-9 h-9" />
            </div>
            <h1 className="font-serif text-2xl font-semibold text-warm-800">🌸 Shubh Yatra</h1>
            <p className="text-sm text-warm-400 mt-1">Apni pavitra yatra shuru kare</p>
          </div>

          <div className="ornament-line mb-6"><span className="text-rose-200">🌸</span></div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {[
              { label: "Name",             name: "name",            type: "text",     placeholder: "Your full name" },
              { label: "Email",            name: "email",           type: "email",    placeholder: "your@email.com" },
              { label: "Password",         name: "password",        type: "password", placeholder: "Create password" },
              { label: "Confirm Password", name: "confirmPassword", type: "password", placeholder: "Confirm password" },
            ].map((f) => (
              <div key={f.name}>
                <label className="block text-xs font-semibold uppercase tracking-wider text-warm-500 mb-1.5">{f.label}</label>
                <input className="input-base" type={f.type} name={f.name} placeholder={f.placeholder} value={formData[f.name]} onChange={handleChange} required />
              </div>
            ))}
            <button type="submit" className="btn-primary w-full py-3.5 text-base mt-2">
              Register 🌸
            </button>
          </form>

          <p className="text-center text-sm text-warm-400 mt-5">
            Already have an account?{" "}
            <Link to="/login" className="text-blush-400 font-medium hover:text-blush-500 transition-colors">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
