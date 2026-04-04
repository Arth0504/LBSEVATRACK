import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import "../styles/temples.css";

const Temples = () => {
  const [temples, setTemples] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTemples();
  }, []);

  const fetchTemples = async () => {
    try {
      const res = await API.get("/temples");
      setTemples(res.data);
    } catch (err) {
      console.log("Temple fetch error");
    }
  };

  const getTempleImage = (name) => {
    if (name.toLowerCase().includes("dwarka")) return "/dwarka.png";
    if (name.toLowerCase().includes("somnath")) return "/somnath.png";
    if (name.toLowerCase().includes("ambaji")) return "/ambaji.png";
    return "/placeholder.jpg";
  };

  return (
    <div className="temples-container">

      <div className="temple-navbar">
        <button onClick={() => navigate("/")} className="back-btn">
          ← Back
        </button>
        <h2>Choose Your Temple</h2>
      </div>

      <div className="temple-grid">
        {temples.map((temple) => (
          <div key={temple._id} className="temple-card">

            <div
              className="temple-image"
              style={{
                backgroundImage: `url(${getTempleImage(temple.name)})`,
              }}
            />

            <div className="temple-content">
              <h3>{temple.name}</h3>
              <p>{temple.location}</p>

              <button
                className="main-btn"
                onClick={() => navigate(`/temple/${temple._id}`)}
              >
                View Details & Slots
              </button>

            </div>

          </div>
        ))}
      </div>

    </div>
  );
};

export default Temples;
