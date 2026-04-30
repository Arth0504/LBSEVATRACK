import { useEffect, useState } from "react";
import API from "../api/axios";
import { toast } from "react-toastify";
import { UserPlus, Building2 } from "lucide-react";

const ACCENT = "#dd2d4a";

const CreateGate = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", temple: "" });
  const [temples, setTemples] = useState([]);
  const [loading, setLoading] = useState(false);
  const [templesLoading, setTemplesLoading] = useState(true);

  useEffect(() => {
    API.get("/temples")
      .then(r => setTemples(r.data))
      .catch(() => toast.error("Failed to load temples"))
      .finally(() => setTemplesLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.temple) { toast.error("Please select a temple"); return; }
    setLoading(true);
    try {
      await API.post("/admin/create-gate", form);
      toast.success("Gate user created successfully ✓");
      setForm({ name: "", email: "", password: "", temple: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create gate user");
    } finally { setLoading(false); }
  };

  const fields = [
    { label: "Gate Name",  name: "name",     type: "text",     ph: "e.g. Main Gate Operator" },
    { label: "Email",      name: "email",    type: "email",    ph: "gate@temple.com" },
    { label: "Password",   name: "password", type: "password", ph: "Create a strong password" },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Create Gate User</h1>
        <p className="page-sub">Add a new gate operator for a temple</p>
      </div>

      <div className="max-w-lg">
        <div className="card p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#fff0f2", border: "1px solid #ffadb8" }}>
              <UserPlus size={20} style={{ color: ACCENT }} />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-gray-800">New Gate Account</h3>
              <p className="text-xs text-gray-400">Gate users can verify entries at the temple</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(f => (
              <div key={f.name}>
                <label className="label">{f.label}</label>
                <input
                  className="input"
                  type={f.type}
                  name={f.name}
                  placeholder={f.ph}
                  value={form[f.name]}
                  onChange={e => setForm({ ...form, [e.target.name]: e.target.value })}
                  required
                />
              </div>
            ))}

            <div>
              <label className="label">Assign Temple</label>
              {templesLoading ? (
                <div className="input flex items-center gap-2 text-gray-400">
                  <div className="w-4 h-4 border-2 border-gray-200 rounded-full animate-spin" style={{ borderTopColor: ACCENT }} />
                  Loading temples...
                </div>
              ) : (
                <select
                  className="input"
                  name="temple"
                  value={form.temple}
                  onChange={e => setForm({ ...form, temple: e.target.value })}
                  required
                >
                  <option value="">-- Select a temple --</option>
                  {temples.map(t => (
                    <option key={t._id} value={t._id}>{t.name} — {t.location}</option>
                  ))}
                </select>
              )}
            </div>

            {form.temple && (
              <div className="flex items-center gap-2 p-3 rounded-xl text-sm" style={{ background: "#fff0f2", border: "1px solid #ffadb8" }}>
                <Building2 size={15} style={{ color: ACCENT }} />
                <span className="text-gray-700">
                  Assigned to: <strong>{temples.find(t => t._id === form.temple)?.name}</strong>
                </span>
              </div>
            )}

            <button type="submit" disabled={loading || templesLoading} className="btn-primary w-full py-3.5 text-base gap-2 mt-2">
              <UserPlus size={17} /> {loading ? "Creating..." : "Create Gate User"}
            </button>
          </form>
        </div>

        {/* Info card */}
        <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-150">
          <p className="text-xs text-gray-500 leading-relaxed">
            <strong className="text-gray-700">Note:</strong> Gate users can log in with the provided credentials and verify devotee entries using QR codes or booking IDs at their assigned temple.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateGate;
