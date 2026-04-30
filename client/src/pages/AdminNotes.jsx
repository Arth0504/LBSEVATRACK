import { useState, useEffect } from "react";
import API from "../api/axios";
import { toast } from "react-toastify";
import { Bell, Plus, Trash2 } from "lucide-react";

const ACCENT = "#dd2d4a";

const AdminNotes = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => { fetchNotes(); }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await API.get("/notes");
      setNotes(res.data);
    } catch { toast.error("Failed to load notices"); }
    finally { setLoading(false); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) { toast.error("Please fill all fields"); return; }
    setAdding(true);
    try {
      await API.post("/notes", { title, message });
      setTitle(""); setMessage("");
      toast.success("Notice added ✓");
      fetchNotes();
    } catch { toast.error("Failed to add notice"); }
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
        <p className="page-sub">Manage announcements visible to all users</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add notice form */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1.5 h-6 rounded-full" style={{ background: ACCENT }} />
            <h3 className="font-serif text-lg font-bold text-gray-800">Add New Notice</h3>
          </div>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="label">Notice Title</label>
              <input
                className="input"
                type="text"
                placeholder="Enter notice title..."
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Message</label>
              <textarea
                className="input resize-none"
                rows={4}
                placeholder="Enter notice message..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                required
              />
            </div>
            <button type="submit" disabled={adding} className="btn-primary w-full py-3 gap-2">
              <Plus size={16} /> {adding ? "Adding..." : "Add Notice"}
            </button>
          </form>
        </div>

        {/* Notices list */}
        <div className="space-y-4">
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
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {notes.map(note => (
                <div key={note._id} className="card p-5 hover:shadow-md transition-all duration-200">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-base" style={{ background: "#fff0f2", border: "1px solid #ffadb8" }}>
                        📌
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-serif text-base font-semibold text-gray-800 mb-1">{note.title}</h4>
                        <p className="text-sm text-gray-500 leading-relaxed">{note.message}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(note._id)}
                      className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNotes;
