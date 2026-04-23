import { useEffect, useState } from "react";
import axios from "axios";

function Notes() {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/notes");
      setNotes(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>📢 Notice Board</h2>

      {notes.length === 0 ? (
        <p>No notices available</p>
      ) : (
        notes.map((note) => (
          <div
            key={note._id}
            style={{
              border: "1px solid var(--border-color)",
              padding: "15px",
              marginBottom: "10px",
              borderRadius: "8px",
              background: "var(--bg-main)",
            }}
          >
            <h4>{note.title}</h4>
            <p>{note.message}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default Notes;