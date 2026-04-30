import { useEffect, useState } from "react";
import API from "../api/axios";
import { toast } from "react-toastify";
import { Pencil, Trash2, Plus, Clock, MapPin, Save } from "lucide-react";

const ACCENT = "#dd2d4a";

const ManageTemples = () => {
  const [temples, setTemples] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [templeForm, setTempleForm] = useState({
    name: "", location: "", description: "", darshanStart: "", darshanEnd: "",
  });

  const [aartiForm, setAartiForm] = useState({ name: "", time: "", description: "" });

  useEffect(() => { fetchTemples(); }, []);

  const fetchTemples = async () => {
    try {
      setLoading(true);
      const res = await API.get("/temples");
      setTemples(res.data);
    } catch { toast.error("Failed to load temples"); }
    finally { setLoading(false); }
  };

  const selectTemple = (t) => {
    setSelected(t);
    setTempleForm({ name: t.name || "", location: t.location || "", description: t.description || "", darshanStart: t.darshanStart || "", darshanEnd: t.darshanEnd || "" });
  };

  const updateTemple = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.put(`/temples/${selected._id}`, templeForm);
      toast.success("Temple updated successfully ✓");
      fetchTemples();
    } catch { toast.error("Update failed"); }
    finally { setSaving(false); }
  };

  const addAarti = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/temples/${selected._id}/aarti`, aartiForm);
      setAartiForm({ name: "", time: "", description: "" });
      toast.success("Aarti timing added ✓");
      const res = await API.get("/temples");
      setTemples(res.data);
      const updated = res.data.find(t => t._id === selected._id);
      if (updated) setSelected(updated);
    } catch { toast.error("Failed to add aarti"); }
  };

  const deleteAarti = async (aartiId) => {
    if (!window.confirm("Delete this aarti timing?")) return;
    try {
      await API.delete(`/temples/${selected._id}/aarti/${aartiId}`);
      toast.success("Aarti deleted");
      const res = await API.get("/temples");
      setTemples(res.data);
      const updated = res.data.find(t => t._id === selected._id);
      if (updated) setSelected(updated);
    } catch { toast.error("Delete failed"); }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-gray-200 rounded-full animate-spin" style={{ borderTopColor: ACCENT }} />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Manage Temples</h1>
        <p className="page-sub">Edit temple details and aarti timings</p>
      </div>

      {/* Temple list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {temples.map(t => (
          <div
            key={t._id}
            onClick={() => selectTemple(t)}
            className={`card p-5 cursor-pointer transition-all duration-200 ${selected?._id === t._id ? "ring-2" : "hover:shadow-md"}`}
            style={selected?._id === t._id ? { ringColor: ACCENT, borderColor: ACCENT } : {}}
          >
            {selected?._id === t._id && (
              <div className="h-1 w-full rounded-t-2xl -mt-5 mb-4 -mx-5 px-5" style={{ background: `linear-gradient(90deg, ${ACCENT}, #ff7a8a)`, width: "calc(100% + 2.5rem)", marginLeft: "-1.25rem" }} />
            )}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-serif text-base font-bold text-gray-800">{t.name}</h3>
                <p className="flex items-center gap-1 text-xs text-gray-400 mt-1"><MapPin size={11} /> {t.location}</p>
                <p className="flex items-center gap-1 text-xs text-gray-400 mt-0.5"><Clock size={11} /> {t.darshanStart} – {t.darshanEnd}</p>
              </div>
              <button
                onClick={e => { e.stopPropagation(); selectTemple(t); }}
                className="p-2 rounded-lg transition-colors hover:bg-gray-50"
                style={{ color: ACCENT }}
              >
                <Pencil size={15} />
              </button>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-400">{t.aartiTimings?.length || 0} aarti timings</span>
            </div>
          </div>
        ))}
      </div>

      {/* Editor */}
      {selected && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Edit temple form */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1.5 h-6 rounded-full" style={{ background: ACCENT }} />
              <h3 className="font-serif text-lg font-bold text-gray-800">Edit: {selected.name}</h3>
            </div>
            <form onSubmit={updateTemple} className="space-y-4">
              {[
                { label: "Temple Name", name: "name", type: "text" },
                { label: "Location", name: "location", type: "text" },
                { label: "Darshan Start", name: "darshanStart", type: "text", ph: "e.g. 06:00 AM" },
                { label: "Darshan End", name: "darshanEnd", type: "text", ph: "e.g. 08:00 PM" },
              ].map(f => (
                <div key={f.name}>
                  <label className="label">{f.label}</label>
                  <input
                    className="input"
                    type={f.type}
                    name={f.name}
                    placeholder={f.ph || f.label}
                    value={templeForm[f.name]}
                    onChange={e => setTempleForm({ ...templeForm, [e.target.name]: e.target.value })}
                    required
                  />
                </div>
              ))}
              <div>
                <label className="label">Description</label>
                <textarea
                  className="input resize-none"
                  rows={3}
                  name="description"
                  placeholder="Temple description..."
                  value={templeForm.description}
                  onChange={e => setTempleForm({ ...templeForm, description: e.target.value })}
                />
              </div>
              <button type="submit" disabled={saving} className="btn-primary w-full py-3 gap-2">
                <Save size={16} /> {saving ? "Saving..." : "Update Temple"}
              </button>
            </form>
          </div>

          {/* Aarti timings */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1.5 h-6 rounded-full" style={{ background: ACCENT }} />
              <h3 className="font-serif text-lg font-bold text-gray-800">Aarti Timings</h3>
            </div>

            {/* Existing aarti list */}
            <div className="space-y-2 mb-5">
              {selected.aartiTimings?.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No aarti timings added yet</p>
              )}
              {selected.aartiTimings?.map(a => (
                <div key={a._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-150">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">{a.name}</p>
                    <p className="text-xs text-gray-400">{a.time} {a.description && `· ${a.description}`}</p>
                  </div>
                  <button
                    onClick={() => deleteAarti(a._id)}
                    className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add aarti form */}
            <div className="border-t border-gray-100 pt-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Add New Aarti</p>
              <form onSubmit={addAarti} className="space-y-3">
                <input className="input" name="name" placeholder="Aarti name (e.g. Mangla Aarti)" value={aartiForm.name} onChange={e => setAartiForm({ ...aartiForm, name: e.target.value })} required />
                <input className="input" name="time" placeholder="Time (e.g. 05:30 AM)" value={aartiForm.time} onChange={e => setAartiForm({ ...aartiForm, time: e.target.value })} required />
                <input className="input" name="description" placeholder="Description (optional)" value={aartiForm.description} onChange={e => setAartiForm({ ...aartiForm, description: e.target.value })} />
                <button type="submit" className="btn-primary w-full py-2.5 gap-2 text-sm">
                  <Plus size={15} /> Add Aarti Timing
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTemples;
