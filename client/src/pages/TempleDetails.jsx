import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import "../styles/templeDetails.css";

const TempleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const slotsRef = useRef(null);

  const [temple, setTemple] = useState(null);
  const [allSlots, setAllSlots] = useState([]);
  const [filteredSlots, setFilteredSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

  // ===== DATE LIMIT LOGIC =====
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 2);
  maxDate.setHours(0, 0, 0, 0);

  const formatDate = (date) =>
    date.toISOString().split("T")[0];

  useEffect(() => {
    fetchTemple();
    fetchSlots();
  }, [id]);

  useEffect(() => {
    if (selectedDate) {
      const filtered = allSlots.filter((slot) => {
        const slotDate = new Date(slot.date);

        const year = slotDate.getFullYear();
        const month = String(slotDate.getMonth() + 1).padStart(2, "0");
        const day = String(slotDate.getDate()).padStart(2, "0");

        const formatted = `${year}-${month}-${day}`;

        return formatted === selectedDate;
      });

      setFilteredSlots(filtered);

      // Smooth scroll after filtering
      setTimeout(() => {
        slotsRef.current?.scrollIntoView({
          behavior: "smooth",
        });
      }, 200);
    }
  }, [selectedDate, allSlots]);

  const fetchTemple = async () => {
    try {
      const res = await API.get(`/temples/${id}`);
      setTemple(res.data);
    } catch (err) {
      console.log("Temple error", err);
    }
  };

  const fetchSlots = async () => {
    try {
      const res = await API.get(`/slots/temple/${id}`);
      setAllSlots(res.data);
    } catch (err) {
      console.log("Slot error", err);
    }
  };

  if (!temple)
    return <h2 style={{ padding: "40px" }}>Loading...</h2>;

  return (
    <div className="temple-details">

      {/* BACK BUTTON */}
      <div className="back-container">
        <button
          onClick={() => navigate("/temples")}
          className="back-btn"
        >
          ← Back to Temples
        </button>
      </div>

      {/* HERO SECTION */}
      <div className="hero-section">
        <div className="hero-overlay">
          <h1>{temple.name}</h1>
          <p>{temple.location}</p>
          <p>
            Darshan: {temple.darshanStart} - {temple.darshanEnd}
          </p>

          <button
            className="hero-btn"
            onClick={() => {
              if (!selectedDate) {
                alert("Please select a date first");
                return;
              }
              slotsRef.current?.scrollIntoView({
                behavior: "smooth",
              });
            }}
          >
            View Slots
          </button>
        </div>
      </div>

      {/* DESCRIPTION */}
      <div className="info-section">
        <h2>About Temple</h2>
        <p>{temple.description}</p>
      </div>

      {/* AARTI SECTION */}
      <div className="aarti-section">
        <h2>Aarti Timings</h2>
        <div className="aarti-grid">
          {temple.aartiTimings?.map((aarti) => (
            <div key={aarti._id} className="aarti-card">
              <h4>{aarti.name}</h4>
              <p>{aarti.time}</p>
              <small>{aarti.description}</small>
            </div>
          ))}
        </div>
      </div>

      {/* DATE SELECTION */}
      <div className="calendar-section">
        <h2>Select Date</h2>

        <input
          type="date"
          min={formatDate(today)}
          max={formatDate(maxDate)}
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />

        <p style={{ fontSize: "14px", marginTop: "5px" }}>
          Booking allowed only within next 2 months
        </p>
      </div>

      {/* SLOTS SECTION */}
      {selectedDate && (
        <div className="slots-section" ref={slotsRef}>
          <h2>Available Slots</h2>

          {filteredSlots.length === 0 ? (
            <p>No slots available for selected date</p>
          ) : (
            <div className="slot-grid">
              {filteredSlots.map((slot) => {
                  const available = slot.capacity - slot.bookedCount;
                  const occupancy = slot.bookedCount / slot.capacity;
                  
                  let densityLabel = "Low";
                  let densityColor = "#28a745"; // green
                  if (occupancy >= 0.8) {
                    densityLabel = "High";
                    densityColor = "#e04a4a"; // red
                  } else if (occupancy >= 0.5) {
                    densityLabel = "Medium";
                    densityColor = "#ffc107"; // yellow
                  }

                const isDisabled =
                  slot.status === "closed" ||
                  slot.status === "full" ||
                  available <= 0;

                return (
                  <div key={slot._id} className="slot-card">

                    <p>
                      <strong>Date:</strong>{" "}
                      {new Date(slot.date).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </p>

                    <p>
                      <strong>Time:</strong>{" "}
                      {slot.startTime} - {slot.endTime}
                    </p>

                    <p>
                      <strong>Available:</strong> {available} / {slot.capacity}
                    </p>

                    {/* Crowd Density Visualization */}
                    <div style={{ margin: "10px 0" }}>
                      <div style={{ 
                        display: "flex", 
                        justifyContent: "space-between", 
                        fontSize: "12px", 
                        marginBottom: "4px",
                        fontWeight: "600",
                        color: densityColor
                      }}>
                        <span>Crowd Density: {densityLabel}</span>
                        <span>{Math.round(occupancy * 100)}%</span>
                      </div>
                      <div style={{ 
                        width: "100%", 
                        height: "8px", 
                        background: "#eee", 
                        borderRadius: "4px",
                        overflow: "hidden" 
                      }}>
                        <div style={{ 
                          width: `${Math.round(occupancy * 100)}%`, 
                          height: "100%", 
                          background: densityColor,
                          transition: "width 0.3s ease"
                        }}></div>
                      </div>
                    </div>

                    <button
                      className="book-btn"
                      disabled={isDisabled}
                      style={{
                        background: isDisabled
                          ? "gray"
                          : "linear-gradient(135deg, var(--color-saffron), var(--color-saffron-dark))",
                        cursor: isDisabled
                          ? "not-allowed"
                          : "pointer",
                        border: "none",
                        color: "white",
                        padding: "10px",
                        borderRadius: "8px",
                        marginTop: "10px",
                        fontWeight: "bold",
                        width: "100%"
                      }}
                      onClick={() =>
                        navigate(`/book/${slot._id}`)
                      }
                    >
                      {isDisabled ? "Not Available" : "Book Now"}
                    </button>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TempleDetails;
