import { useEffect, useState } from "react";
import API from "../api/axios";
import { toast } from "react-toastify";
import { Search, Plus, Edit2, Trash2, X, Building2, User } from "lucide-react";

const ACCENT = "#dd2d4a";

const ManageGatekeepers = () => {
  const [gates, setGates] = useState([]);
  const [temples, setTemples] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  const [form, setForm] = useState({ id: "", name: "", email: "", password: "", temple: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tRes, gRes] = await Promise.all([
        API.get("/temples"),
        API.get("/admin/gatekeepers")
      ]);
      setTemples(tRes.data);
      setGates(gRes.data);
    } catch {
      toast.error("Failed to load gatekeepers");
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditMode(false);
    setForm({ id: "", name: "", email: "", password: "", temple: "" });
    setShowModal(true);
  };

  const openEdit = (g) => {
    setEditMode(true);
    setForm({ id: g._id, name: g.name, email: g.email, password: "", temple: g.temple?._id || "" });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this gatekeeper?")) return;
    try {
      await API.delete(`/admin/gate/${id}`);
      toast.success("Gatekeeper deleted");
      fetchData();
    } catch {
      toast.error("Failed to delete gatekeeper");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.temple) { toast.error("Please select a temple"); return; }
    try {
      if (editMode) {
        await API.put(`/admin/gate/${form.id}`, form);
        toast.success("Gatekeeper updated");
      } else {
        await API.post("/admin/create-gate", form);
        toast.success("Gatekeeper created");
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    }
  };

  const filtered = gates.filter(g => g.name?.toLowerCase().includes(search.toLowerCase()) || g.email?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-gray-200 rounded-full animate-spin" style={{ borderTopColor: ACCENT }} />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Manage Gatekeepers</h1>
          <p className="page-sub">Assign and manage temple entrance operators</p>
        </div>
        <button onClick={openAdd} className="btn-primary py-2.5 px-4 gap-2">
          <Plus size={18} /> Add Gatekeeper
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="input pl-10"
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "#fafafa" }}>
                <th className="table-head-cell">Name</th>
                <th className="table-head-cell">Email</th>
                <th className="table-head-cell">Assigned Temple</th>
                <th className="table-head-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-12 text-gray-300">No gatekeepers found</td></tr>
              ) : filtered.map(g => (
                <tr key={g._id} className="hover:bg-gray-50 transition-colors">
                  <td className="table-cell font-medium text-gray-800">{g.name}</td>
                  <td className="table-cell text-gray-500">{g.email}</td>
                  <td className="table-cell">
                    {g.temple ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-600 border border-red-100">
                        <Building2 size={12} /> {g.temple.name}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">Unassigned</span>
                    )}
                  </td>
                  <td className="table-cell">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(g)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={15} /></button>
                      <button onClick={() => handleDelete(g._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-fade-in shadow-xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-serif text-xl font-bold text-gray-800">{editMode ? "Edit Gatekeeper" : "Add Gatekeeper"}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:bg-gray-100 p-2 rounded-xl"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Name</label>
                <input className="input" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" className="input" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>
              <div>
                <label className="label">Password {editMode && <span className="text-xs text-gray-400">(leave blank to keep current)</span>}</label>
                <input type="password" minLength={6} className="input" required={!editMode} value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
              </div>
              <div>
                <label className="label">Assign Temple</label>
                <select className="input" required value={form.temple} onChange={e => setForm({...form, temple: e.target.value})}>
                  <option value="">-- Select --</option>
                  {temples.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
              </div>
              <button type="submit" className="btn-primary w-full py-3 mt-2">{editMode ? "Save Changes" : "Create Gatekeeper"}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default ManageGatekeepers;
