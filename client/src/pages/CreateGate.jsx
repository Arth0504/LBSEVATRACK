import { useEffect, useState } from "react";
import API from "../api/axios";

const CreateGate = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    temple: "",
  });

  const [temples, setTemples] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTemples();
  }, []);

  const fetchTemples = async () => {
    try {
      const res = await API.get("/temples");
      setTemples(res.data);
    } catch (error) {
      console.log("Temple fetch error");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.temple) {
      alert("Please select a temple");
      return;
    }

    try {
      setLoading(true);

      await API.post("/admin/create-gate", formData);

      alert("Gate created successfully");

      setFormData({
        name: "",
        email: "",
        password: "",
        temple: "",
      });

    } catch (error) {
      alert(error.response?.data?.message || "Error creating gate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Create Gate User</h2>

      <form onSubmit={handleSubmit} style={styles.form}>

        <input
          type="text"
          name="name"
          placeholder="Gate Name"
          value={formData.name}
          onChange={handleChange}
          required
          style={styles.input}
        />

        <input
          type="email"
          name="email"
          placeholder="Gate Email"
          value={formData.email}
          onChange={handleChange}
          required
          style={styles.input}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          style={styles.input}
        />

        <select
          name="temple"
          value={formData.temple}
          onChange={handleChange}
          required
          style={styles.select}
        >
          <option value="">Select Temple</option>
          {temples.map((t) => (
            <option key={t._id} value={t._id}>
              {t.name}
            </option>
          ))}
        </select>

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Creating..." : "Create Gate"}
        </button>

      </form>
    </div>
  );
};

const styles = {
  container: {
    padding: "60px",
    background: "var(--bg-main)",
    minHeight: "100vh",
  },
  heading: {
    color: "var(--color-primary)",
    marginBottom: "30px",
  },
  form: {
    maxWidth: "400px",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid var(--border-color)",
  },
  select: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid var(--border-color)",
  },
  button: {
    background: "var(--color-primary)",
    color: "white",
    border: "none",
    padding: "10px",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default CreateGate;
