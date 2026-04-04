import { useState, useEffect } from "react";
import API from "../api/axios";
import "./adminNotes.css";

const AdminNotes = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await API.get("/notes");
      setNotes(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleAdd = async () => {
    if (!title || !message) return alert("Fill all fields");

    try {
      await API.post("/notes", { title, message });
      setTitle("");
      setMessage("");
      fetchNotes();
    } catch (err) {
      alert("Error adding note");
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/notes/${id}`);
      fetchNotes();
    } catch (err) {
      alert("Error deleting note");
    }
  };

  return (
    <div className="admin-notes">

      <h2>📢 Manage Notice Board</h2>

      {/* 🔥 FORM */}
      <div className="note-form">
        <input
          type="text"
          placeholder="Enter Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Enter Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <button onClick={handleAdd}>Add Note</button>
      </div>

      {/* 🔥 NOTES LIST */}
      <div className="note-list">
        {notes.length === 0 ? (
          <p>No notes available</p>
        ) : (
          notes.map((note) => (
            <div className="note-item" key={note._id}>
              <h4>{note.title}</h4>
              <p>{note.message}</p>

              <button onClick={() => handleDelete(note._id)}>
                Delete
              </button>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default AdminNotes;