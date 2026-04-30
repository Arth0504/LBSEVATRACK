import { useEffect, useState } from "react";
import API from "../api/axios";
import { Plus, Pencil, Trash2, Save } from "lucide-react";

const ManageSlots = () => {
  const [temples, setTemples] = useState([]);
  const [selectedTemple, setSelectedTemple] = useState("");
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ date: "", startTime: "", endTime: "", capacity: "" });
  const [editSlotId, setEditSlotId] = useState(null);
  const [editData, setEditData] = useState({ capacity: "", status: "" });

  const genTimes = () => { const t = []; for (let h = 0; h < 24; h++) for (let m = 0; m < 60; m += 30) t.push(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`); return t; };
  const timeOptions = genTimes();
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => { API.get("/temples").then((r) => setTemples(r.data)).catch(() => {}); }, []);
  useEffect(() => { if (selectedTemple) fetchSlots(); else setSlots([]); }, [selectedTemple]);

  const fetchSlots = async () => {
    setLoading(true);
    try { const r = await API.get(`/slots/temple/${selectedTemple}`); setSlots(r.data); }
    catch {} finally { setLoading(false); }
  };

  const createSlots = async (e) => {
    e.preventDefault();
    if (!selectedTemple) { alert("Select temple first"); return; }
    if (formData.startTime >= formData.endTime) { alert("End time must be after start time"); return; }
    try {
      const r = await API.post("/slots", { templeId: selectedTemple, ...formData });
      alert(r.data.message);
      setFormData({ date: "", startTime: "", endTime: "", capacity: "" });
      fetchSlots();
    } catch (err) { alert(err.response?.data?.message || "Error"); }
  };

  const deleteSlot = async (id) => {
    if (!window.confirm("Delete this slot?")) return;
    try { await API.delete(`/slots/${id}`); fetchSlots(); } catch { alert("Delete failed"); }
  };

  const saveEdit = async (id) => {
    try { await API.put(`/slots/${id}`, editData); setEditSlotId(null); fetchSlots(); }
    catch { alert("Update failed"); }
  };

  const statusBadge = (s) => s === "active" ? "status-booked" : s === "full" ? "status-used" : "status-cancelled";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-warm-800">Manage Slots</h1>
        <p className="text-warm-400 text-sm mt-1">Create and manage darshan time slots</p>
      </div>

      {/* Temple Select */}
      <div className="card-base p-6">
        <label className="block text-xs font-semibold uppercase tracking-wider text-warm-400 mb-2">Select Temple</label>
        <select className="input-base max-w-sm" value={selectedTemple} onChange={(e) => setSelectedTemple(e.target.value)}>
          <option value="">-- Select Temple --</option>
          {temples.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
        </select>
      </div>

      {/* Create Form */}
      <div className="card-base p-6">
        <h3 className="font-serif text-lg font-semibold text-warm-800 mb-5">Generate Slots</h3>
        <form onSubmit={createSlots} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <input type="date" name="date" min={today} value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="input-base" required />
          <select name="startTime" value={formData.startTime} onChange={(e) => setFormData({...formData, startTime: e.target.value})} className="input-base" required>
            <option value="">Start Time</option>
            {timeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select name="endTime" value={formData.endTime} onChange={(e) => setFormData({...formData, endTime: e.target.value})} className="input-base" required disabled={!formData.startTime}>
            <option value="">End Time</option>
            {timeOptions.filter((t) => t > formData.startTime).map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <input type="number" placeholder="Capacity" value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: e.target.value})} className="input-base" required />
          <button type="submit" className="btn-primary gap-2 lg:col-span-1">
            <Plus size={16} /> Generate
          </button>
        </form>
      </div>

      {/* Slots Table */}
      <div className="card-base overflow-hidden">
        <div className="px-6 py-4 border-b border-rose-100">
          <h3 className="font-serif text-lg font-semibold text-warm-800">Upcoming Slots</h3>
        </div>
        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-rose-200 border-t-blush-400 rounded-full animate-spin" /></div>
        ) : slots.length === 0 ? (
          <div className="text-center py-12 text-warm-300 text-sm">No slots found. Select a temple and create slots.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-rose-25 border-b border-rose-100">
                <tr>
                  {["Date","Time","Capacity","Booked","Status","Crowd","Actions"].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold uppercase tracking-wider text-warm-300 px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-50">
                {slots.map((slot) => (
                  <tr key={slot._id} className="hover:bg-rose-25 transition-colors">
                    <td className="px-4 py-3 text-sm text-warm-600">{new Date(slot.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm text-warm-600">{slot.startTime} – {slot.endTime}</td>
                    {editSlotId === slot._id ? (
                      <>
                        <td className="px-4 py-3"><input type="number" value={editData.capacity} onChange={(e) => setEditData({...editData, capacity: e.target.value})} className="input-base w-20 py-1.5 text-sm" /></td>
                        <td className="px-4 py-3 text-sm text-warm-500">{slot.bookedCount}</td>
                        <td className="px-4 py-3">
                          <select value={editData.status} onChange={(e) => setEditData({...editData, status: e.target.value})} className="input-base py-1.5 text-sm">
                            <option value="active">Active</option>
                            <option value="full">Full</option>
                            <option value="closed">Closed</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-sm text-warm-400">{slot.crowdLevel}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => saveEdit(slot._id)} className="btn-primary py-1.5 px-3 text-xs gap-1"><Save size={12} /> Save</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 text-sm text-warm-600">{slot.capacity}</td>
                        <td className="px-4 py-3 text-sm text-warm-500">{slot.bookedCount}</td>
                        <td className="px-4 py-3"><span className={statusBadge(slot.status)}>{slot.status}</span></td>
                        <td className="px-4 py-3 text-sm text-warm-400">{slot.crowdLevel} ({slot.percentage}%)</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => { setEditSlotId(slot._id); setEditData({ capacity: slot.capacity, status: slot.status }); }} className="p-1.5 rounded-lg text-warm-400 hover:bg-rose-50 hover:text-blush-400 transition-colors"><Pencil size={14} /></button>
                            <button onClick={() => deleteSlot(slot._id)} className="p-1.5 rounded-lg text-warm-300 hover:bg-rose-50 hover:text-rose-400 transition-colors"><Trash2 size={14} /></button>
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
