import { useEffect, useState } from "react";
import API from "../api/axios";
import Navbar from "./Navbar";
import { Bell } from "lucide-react";

function Notes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/notes")
      .then(r => setNotes(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-5 md:px-8 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#fff0f2" }}>
            <Bell size={20} style={{ color: "#dd2d4a" }} />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-gray-800">Notice Board</h1>
            <p className="text-sm text-gray-400">Latest announcements and updates</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-gray-200 rounded-full animate-spin" style={{ borderTopColor: "#dd2d4a" }} />
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-150">
            <Bell size={40} className="mx-auto mb-3 text-gray-200" />
            <p className="text-gray-400">No notices available at this time.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map(note => (
              <div key={note._id} className="card p-6 hover:shadow-md transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "#fff0f2", border: "1px solid #ffadb8" }}>
                    <span className="text-base">📌</span>
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-gray-800 mb-1">{note.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{note.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notes;
