import { useEffect, useState } from "react";
import API from "../api/axios";

const GateActivity = () => {
  const [activity, setActivity] = useState(null);

  useEffect(() => {
    fetchActivity();
  }, []);

  const fetchActivity = async () => {
    try {
      const res = await API.get("/gates/my-activity");
      setActivity(res.data);
    } catch (err) {
      console.log("Activity error");
    }
  };

  return (
    <div>
      <h2>My Activity</h2>

      {activity && (
        <div className="activity-card">
          <p><strong>Entries Today:</strong> {activity.totalEntriesToday}</p>
        </div>
      )}
    </div>
  );
};

export default GateActivity;
