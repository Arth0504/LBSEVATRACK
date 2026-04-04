import { useEffect, useState } from "react";
import API from "../api/axios";
import "./manageSlots.css";

const ManageSlots = () => {
  const [temples, setTemples] = useState([]);
  const [selectedTemple, setSelectedTemple] = useState("");
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    date: "",
    startTime: "",
    endTime: "",
    capacity: "",
  });

  const [editSlotId, setEditSlotId] = useState(null);
  const [editData, setEditData] = useState({
    capacity: "",
    status: "",
  });

  // Generate 24h 30-min options
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let min = 0; min < 60; min += 30) {
        const h = String(hour).padStart(2, "0");
        const m = String(min).padStart(2, "0");
        times.push(`${h}:${m}`);
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  // Disable past dates
  const todayDate = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchTemples();
  }, []);

  useEffect(() => {
    if (selectedTemple) fetchSlots();
    else setSlots([]);
  }, [selectedTemple]);

  const fetchTemples = async () => {
    try {
      const res = await API.get("/temples");
      setTemples(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/slots/temple/${selectedTemple}`);
      setSlots(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // CREATE
  const createSlots = async (e) => {
    e.preventDefault();

    if (!selectedTemple) {
      alert("Select temple first");
      return;
    }

    if (formData.startTime >= formData.endTime) {
      alert("End time must be greater than start time");
      return;
    }

    try {
      const res = await API.post("/slots", {
        templeId: selectedTemple,
        ...formData,
      });

      alert(res.data.message);

      setFormData({
        date: "",
        startTime: "",
        endTime: "",
        capacity: "",
      });

      fetchSlots();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  // DELETE
  const deleteSlot = async (id) => {
    if (!window.confirm("Delete this slot?")) return;

    try {
      await API.delete(`/slots/${id}`);
      fetchSlots();
    } catch (err) {
      alert("Delete failed");
    }
  };

  // EDIT START
  const startEdit = (slot) => {
    setEditSlotId(slot._id);
    setEditData({
      capacity: slot.capacity,
      status: slot.status,
    });
  };

  // UPDATE
  const saveEdit = async (id) => {
    try {
      await API.put(`/slots/${id}`, editData);
      setEditSlotId(null);
      fetchSlots();
    } catch (err) {
      alert("Update failed");
    }
  };

  // End time filtered based on start time
  const filteredEndTimes = timeOptions.filter(
    (time) => time > formData.startTime
  );

  return (
    <div className="slots-container">
      <h2>Manage Slots</h2>

      {/* Temple Select */}
      <div className="selector">
        <label>Select Temple</label>
        <select
          value={selectedTemple}
          onChange={(e) => setSelectedTemple(e.target.value)}
        >
          <option value="">-- Select Temple --</option>
          {temples.map((t) => (
            <option key={t._id} value={t._id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {/* Slot Generator Form */}
      <form onSubmit={createSlots} className="slot-form">

        <input
          type="date"
          name="date"
          min={todayDate}
          value={formData.date}
          onChange={handleChange}
          required
        />

        <select
          name="startTime"
          value={formData.startTime}
          onChange={handleChange}
          required
        >
          <option value="">Start Time</option>
          {timeOptions.map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>

        <select
          name="endTime"
          value={formData.endTime}
          onChange={handleChange}
          required
          disabled={!formData.startTime}
        >
          <option value="">End Time</option>
          {filteredEndTimes.map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>

        <input
          type="number"
          name="capacity"
          placeholder="Capacity per Slot"
          value={formData.capacity}
          onChange={handleChange}
          required
        />

        <button type="submit">
          Generate 30-Min Slots
        </button>

      </form>

      {/* Slot Table */}
      <div className="slot-table">
        <h3>Upcoming Slots</h3>

        {loading ? (
          <p>Loading...</p>
        ) : slots.length === 0 ? (
          <p>No slots found</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Time (24h)</th>
                <th>Capacity</th>
                <th>Booked</th>
                <th>Status</th>
                <th>Crowd</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {slots.map((slot) => (
                <tr key={slot._id}>
                  <td>
                    {new Date(slot.date).toLocaleDateString()}
                  </td>
                  <td>
                    {slot.startTime} - {slot.endTime}
                  </td>

                  {editSlotId === slot._id ? (
                    <>
                      <td>
                        <input
                          type="number"
                          value={editData.capacity}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              capacity: e.target.value,
                            })
                          }
                        />
                      </td>
                      <td>{slot.bookedCount}</td>
                      <td>
                        <select
                          value={editData.status}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              status: e.target.value,
                            })
                          }
                        >
                          <option value="active">Active</option>
                          <option value="full">Full</option>
                          <option value="closed">Closed</option>
                        </select>
                      </td>
                      <td>
                        {slot.crowdLevel} ({slot.percentage}%)
                      </td>
                      <td>
                        <button onClick={() => saveEdit(slot._id)}>
                          Save
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{slot.capacity}</td>
                      <td>{slot.bookedCount}</td>
                      <td>{slot.status}</td>
                      <td>
                        {slot.crowdLevel} ({slot.percentage}%)
                      </td>
                      <td>
                        <button onClick={() => startEdit(slot)}>Edit</button>
                        <button onClick={() => deleteSlot(slot._id)}>
                          Delete
                        </button>
                      </td>
                    </>
                  )}

                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ManageSlots;
