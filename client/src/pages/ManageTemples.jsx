import { useEffect, useState } from "react";
import API from "../api/axios";
import "./manageTemples.css";

const ManageTemples = () => {
  const [temples, setTemples] = useState([]);
  const [selectedTemple, setSelectedTemple] = useState(null);

  const [templeForm, setTempleForm] = useState({
    name: "",
    location: "",
    description: "",
    darshanStart: "",
    darshanEnd: "",
  });

  const [aartiForm, setAartiForm] = useState({
    name: "",
    time: "",
    description: "",
  });

  useEffect(() => {
    fetchTemples();
  }, []);

  const fetchTemples = async () => {
    const res = await API.get("/temples");
    setTemples(res.data);
  };

  const handleTempleEdit = (temple) => {
    setSelectedTemple(temple);
    setTempleForm({
      name: temple.name || "",
      location: temple.location || "",
      description: temple.description || "",
      darshanStart: temple.darshanStart || "",
      darshanEnd: temple.darshanEnd || "",
    });
  };

  const handleTempleChange = (e) => {
    setTempleForm({ ...templeForm, [e.target.name]: e.target.value });
  };

  const handleAartiChange = (e) => {
    setAartiForm({ ...aartiForm, [e.target.name]: e.target.value });
  };

  const updateTemple = async (e) => {
    e.preventDefault();
    await API.put(`/temples/${selectedTemple._id}`, templeForm);
    fetchTemples();
    alert("Temple Updated");
  };

  const addAarti = async (e) => {
    e.preventDefault();
    await API.post(`/temples/${selectedTemple._id}/aarti`, aartiForm);
    setAartiForm({ name: "", time: "", description: "" });
    fetchTemples();
    alert("Aarti Added");
  };

  const deleteAarti = async (aartiId) => {
    await API.delete(`/temples/${selectedTemple._id}/aarti/${aartiId}`);
    fetchTemples();
  };

  return (
    <div className="admin-manage-container">
      <h2>Manage Temples</h2>

      <div className="admin-temple-list">
        {temples.map((temple) => (
          <div key={temple._id} className="admin-temple-card">
            <h3>{temple.name}</h3>
            <p>{temple.location}</p>
            <button onClick={() => handleTempleEdit(temple)}>
              Manage
            </button>
          </div>
        ))}
      </div>

      {selectedTemple && (
        <div className="admin-editor-section">

          <h3>Edit Temple</h3>

          <form onSubmit={updateTemple} className="admin-form">
            <input name="name" value={templeForm.name} onChange={handleTempleChange} />
            <input name="location" value={templeForm.location} onChange={handleTempleChange} />
            <input name="darshanStart" value={templeForm.darshanStart} onChange={handleTempleChange} />
            <input name="darshanEnd" value={templeForm.darshanEnd} onChange={handleTempleChange} />
            <textarea name="description" value={templeForm.description} onChange={handleTempleChange}></textarea>
            <button type="submit">Update Temple</button>
          </form>

          <h3>Aarti Timings</h3>

          {selectedTemple.aartiTimings?.map((aarti) => (
            <div key={aarti._id} className="admin-aarti-card">
              <span>
                <strong>{aarti.name}</strong> – {aarti.time}
              </span>
              <button onClick={() => deleteAarti(aarti._id)}>
                Delete
              </button>
            </div>
          ))}

          <h4>Add New Aarti</h4>

          <form onSubmit={addAarti} className="admin-form">
            <input name="name" placeholder="Aarti Name" value={aartiForm.name} onChange={handleAartiChange} required />
            <input name="time" placeholder="Time" value={aartiForm.time} onChange={handleAartiChange} required />
            <input name="description" placeholder="Description" value={aartiForm.description} onChange={handleAartiChange} />
            <button type="submit">Add Aarti</button>
          </form>

        </div>
      )}
    </div>
  );
};

export default ManageTemples;
