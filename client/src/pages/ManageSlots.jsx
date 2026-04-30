import { useEffect, useState } from "react";
import API from "../api/axios";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";

const ManageSlots = () => {
  const [temples, setTemples] = useState([]);
  const [temple, setTemple] = useState("");
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ date: "", startTime: "", endTime: "", capacity: "" });
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ capacity: "", status: "" });

  const times = () => { const t = []; for (let h = 0; h < 24; h++) for (let m = 0; m < 60; m += 30) t.push(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`); return t; };
  const timeOpts = times();
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => { API.get("/temples").then(r => setTemples(r.data)).catch(() => {}); }, []);
  useEffect(() => { if (temple) fetchSlots(); else setSlots([]); }, [temple]);

  const fetchSlots = async () => {
    setLoading(true);
    try { const r = await API.get(`/slots/temple/${temple}`); setSlots(r.data); }
    catch {} finally { setLoading(false); }
  };

  const create = async (e) => {
    e.preventDefault();
    if (!temple) { alert("Select a temple first"); return; }
    if (form.startTime >= form.endTime) { alert("End time must be after start time"); return; }
    try {
      const r = await API.post("/slots", { templeId: temple, ...form });
      alert(r.data.message);
      setForm({ date: "", startTime: "", endTime: "", capacity: "" });
      fetchSlots();
    } catch (err) { alert(err.response?.data?.message || "Error"); }
  };

  const del = async (id) => {
    if (!window.confirm("Delete this slot?")) return;
    try { await API.delete(`/slots/${id}`); fetchSlots(); } catch { alert("Delete failed"); }
  };

  const save = async (id) => {
    try { await API.put(`/slots/${id}`, editData); setEditId(null); fetchSlots(); }
    catch { alert("Update failed"); }
  };

  const statusCls = s => s === "active" ? "status-booked" : s === "full" ? "status-used" : "status-cancelled";

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Manage Slots</h1>
        <p className="page-sub">Create and manage darshan time slots</p>
      </div>

      {/* Temple select */}
      <div className="card p-6 shadow-sm">
        <label className="label">Select Temple</label>
        <select className="input max-w-sm" value={temple} onChange={e => setTemple(e.target.value)}>
          <option value="">-- Choose a temple --</option>
          {temples.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
        </select>
      </div>

      {/* Create form */}
      <div className="card p-6 shadow-sm">
        <h3 className="font-serif text-lg font-bold text-stone-800 mb-5">Generate New Slots</h3>
        <form onSubmit={create} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="label">Date</label>
            <input type="date" min={today} value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="input" required />
          </div>
          <div>
            <label className="label">Start Time</label>
            <select value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} className="input" required>
              <option value="">Select</option>
              {timeOpts.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">End Time</label>
            <select value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} className="input" required disabled={!form.startTime}>
              <option value="">Select</option>
              {timeOpts.filter(t => t > form.startTime).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Capacity</label>
            <input type="number" placeholder="e.g. 50" value={form.capacity} onChange={e => setForm({...form, capacity: e.target.value})} className="input" required />
          </div>
          <div className="flex items-end">
            <button type="submit" className="btn-primary w-full py-3 gap-2">
              <Plus size={16} /> Generate
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="card shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold text-stone-800">Slots</h3>
          {slots.length > 0 && <span className="badge-stone">{slots.length} slots</span>}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-stone-200 border-t-primary-500 rounded-full animate-spin" />
          </div>
        ) : slots.length === 0 ? (
          <div className="text-center py-12 text-stone-300 text-sm">
            {temple ? "No slots found. Create some above." : "Select a temple to view slots."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {["Date","Time","Capacity","Booked","Status","Crowd","Actions"].map(h => (
                    <th key={h} className="table-head-cell">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {slots.map(s => (
                  <tr key={s._id} className="hover:bg-stone-50 transition-colors">
                    <td className="table-cell text-stone-600">{new Date(s.date).toLocaleDateString()}</td>
                    <td className="table-cell text-stone-600 font-medium">{s.startTime} – {s.endTime}</td>

                    {editId === s._id ? (
                      <>
                        <td className="table-cell"><input type="number" value={editData.capacity} onChange={e => setEditData({...editData, capacity: e.target.value})} className="input w-20 py-1.5 text-sm" /></td>
                        <td className="table-cell text-stone-500">{s.bookedCount}</td>
                        <td className="table-cell">
                          <select value={editData.status} onChange={e => setEditData({...editData, status: e.target.value})} className="input py-1.5 text-sm">
                            <option value="active">Active</option>
                            <option value="full">Full</option>
                            <option value="closed">Closed</option>
                          </select>
                        </td>
                        <td className="table-cell text-stone-400 text-xs">{s.crowdLevel}</td>
                        <td className="table-cell">
                          <div className="flex gap-1.5">
                            <button onClick={() => save(s._id)} className="btn-primary py-1.5 px-3 text-xs gap-1"><Save size={12} /> Save</button>
                            <button onClick={() => setEditId(null)} className="btn-ghost py-1.5 px-2 text-xs"><X size={12} /></button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="table-cell text-stone-600">{s.capacity}</td>
                        <td className="table-cell text-stone-500">{s.bookedCount}</td>
                        <td className="table-cell"><span className={statusCls(s.status)}>{s.status}</span></td>
                        <td className="table-cell text-xs text-stone-400">{s.crowdLevel} ({s.percentage}%)</td>
                        <td className="table-cell">
                          <div className="flex gap-1.5">
                            <button onClick={() => { setEditId(s._id); setEditData({ capacity: s.capacity, status: s.status }); }} className="p-1.5 rounded-lg text-stone-400 hover:bg-primary-50 hover:text-primary-600 transition-colors"><Pencil size={14} /></button>
                            <button onClick={() => del(s._id)} className="p-1.5 rounded-lg text-stone-300 hover:bg-red-50 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageSlots;
