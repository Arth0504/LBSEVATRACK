import { useState, useEffect } from "react";
import API from "../api/axios";
import { toast } from "react-toastify";
import { Bell, Plus, Trash2, Edit2, X, Building2, Calendar as CalIcon, Pin } from "lucide-react";

const ACCENT = "#dd2d4a";

const AdminNotes = () => {
  const [notes, setNotes] = useState([]);
  const [temples, setTemples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  
  const [form, setForm] = useState({ id: null, title: "", message: "", isPinned: false, expiryDate: "", temple: "" });
  const [editMode, setEditMode] = useState(false);

  useEffect(() => { 
    fetchNotes();
    API.get("/temples").then(res => setTemples(res.data)).catch(() => {});
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await API.get("/notes");
      setNotes(res.data);
    } catch { toast.error("Failed to load notices"); }
    finally { setLoading(false); }
  };

  const resetForm = () => {
    setForm({ id: null, title: "", message: "", isPinned: false, expiryDate: "", temple: "" });
    setEditMode(false);
  }

  const handleEdit = (note) => {
    setEditMode(true);
    setForm({
      id: note._id,
      title: note.title,
      message: note.message,
      isPinned: note.isPinned || false,
      expiryDate: note.expiryDate ? new Date(note.expiryDate).toISOString().split('T')[0] : "",
      temple: note.temple ? note.temple._id : ""
    });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) { toast.error("Please fill all required fields"); return; }
    setAdding(true);
    
    const payload = {
      title: form.title,
      message: form.message,
      isPinned: form.isPinned,
      expiryDate: form.expiryDate || null,
      temple: form.temple || null
    };

    try {
      if (editMode) {
        await API.put(`/notes/${form.id}`, payload);
        toast.success("Notice updated ✓");
      } else {
        await API.post("/notes", payload);
        toast.success("Notice added ✓");
      }
      resetForm();
      fetchNotes();
    } catch { toast.error(editMode ? "Failed to update notice" : "Failed to add notice"); }
    finally { setAdding(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this notice?")) return;
    try {
      await API.delete(`/notes/${id}`);
      toast.success("Notice deleted");
      fetchNotes();
    } catch { toast.error("Delete failed"); }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Notice Board</h1>
        <p className="page-sub">Manage announcements, pinning, and expiration</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Add/Edit notice form */}
        <div className="card p-6 xl:col-span-1 h-fit">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-6 rounded-full" style={{ background: ACCENT }} />
              <h3 className="font-serif text-lg font-bold text-gray-800">{editMode ? "Edit Notice" : "Add New Notice"}</h3>
            </div>
            {editMode && (
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
            )}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Notice Title *</label>
              <input
                className="input"
                type="text"
                placeholder="Enter notice title..."
                value={form.title}
                onChange={e => setForm({...form, title: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="label">Message *</label>
              <textarea
                className="input resize-none"
                rows={4}
                placeholder="Enter notice message..."
                value={form.message}
                onChange={e => setForm({...form, message: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="label">Assign Temple (Optional)</label>
              <select 
                className="input" 
                value={form.temple} 
                onChange={e => setForm({...form, temple: e.target.value})}
              >
                <option value="">-- All Temples --</option>
                {temples.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Expiry Date (Optional)</label>
              <input 
                type="date" 
                className="input" 
                value={form.expiryDate} 
                onChange={e => setForm({...form, expiryDate: e.target.value})} 
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="flex items-center gap-2 pt-1 pb-2">
              <input 
                type="checkbox" 
                id="isPinned" 
                className="w-4 h-4 text-sacred-600 rounded border-gray-300 focus:ring-sacred-500"
                checked={form.isPinned}
                onChange={e => setForm({...form, isPinned: e.target.checked})}
              />
              <label htmlFor="isPinned" className="text-sm text-gray-700 cursor-pointer select-none">Pin to top</label>
            </div>
            
            <button type="submit" disabled={adding} className="btn-primary w-full py-3 gap-2 mt-2">
              {editMode ? <Edit2 size={16} /> : <Plus size={16} />} 
              {adding ? "Saving..." : (editMode ? "Update Notice" : "Add Notice")}
            </button>
          </form>
        </div>

        {/* Notices list */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-6 rounded-full" style={{ background: ACCENT }} />
            <h3 className="font-serif text-lg font-bold text-gray-800">Active Notices ({notes.length})</h3>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-7 h-7 border-4 border-gray-200 rounded-full animate-spin" style={{ borderTopColor: ACCENT }} />
            </div>
          ) : notes.length === 0 ? (
            <div className="card p-10 text-center">
              <Bell size={32} className="mx-auto mb-3 text-gray-200" />
              <p className="text-gray-400 text-sm">No notices yet. Add one!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {notes.map(note => {
                const isExpired = note.expiryDate && new Date(note.expiryDate) < new Date();
                return (
                  <div key={note._id} className={`card p-5 transition-all duration-200 ${isExpired ? "opacity-60 grayscale" : "hover:shadow-md"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-base ${note.isPinned ? "bg-sacred-100 border border-sacred-200 text-sacred-600" : "bg-gray-50 border border-gray-150 text-gray-400"}`}>
                          {note.isPinned ? <Pin size={16} /> : <Bell size={16} />}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-serif text-base font-semibold text-gray-800 mb-1 flex items-center gap-2">
                            {note.title}
                            {isExpired && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500">EXPIRED</span>}
                          </h4>
                          <p className="text-sm text-gray-500 leading-relaxed mb-3">{note.message}</p>
                          <div className="flex flex-wrap gap-2 text-xs font-medium">
                            {note.temple ? (
                              <span className="inline-flex items-center gap-1 text-sacred-600 bg-sacred-50 px-2 py-1 rounded">
                                <Building2 size={12} /> {note.temple.name}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                <Building2 size={12} /> All Temples
                              </span>
                            )}
                            {note.expiryDate && (
                              <span className="inline-flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                <CalIcon size={12} /> Exp: {new Date(note.expiryDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleEdit(note)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(note._id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNotes;
