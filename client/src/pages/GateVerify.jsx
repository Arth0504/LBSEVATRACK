import { useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import API from "../api/axios";

const GateVerify = () => {
  const [bookingId, setBookingId] = useState("");
  const [data, setData] = useState(null);
  const [scannerStarted, setScannerStarted] = useState(false);
  const [error, setError] = useState("");
  const qrRef = useRef(null);

  // ================= VERIFY =================
  const handleVerify = async (id) => {
    try {
      setError("");
      const res = await API.post("/gates/verify", { bookingId: id });
      setData(res.data.booking);
    } catch (error) {
      setError(error.response?.data?.message || "Verification Failed");
    }
  };

  // ================= START SCANNER =================
  const startScanner = async () => {
    try {
      const qr = new Html5Qrcode("reader");
      qrRef.current = qr;

      const devices = await Html5Qrcode.getCameras();
      if (!devices || devices.length === 0) {
        alert("No camera found");
        return;
      }

      const cameraId = devices[0].id;

      await qr.start(
        cameraId,
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          setBookingId(decodedText);
          await handleVerify(decodedText);

          if (qrRef.current) {
            await qrRef.current.stop();
            await qrRef.current.clear();
            setScannerStarted(false);
          }
        },
        () => {}
      );

      setScannerStarted(true);

    } catch (err) {
      alert("Please allow camera permission.");
    }
  };

  // ================= STOP SCANNER =================
  const stopScanner = async () => {
    try {
      if (qrRef.current && scannerStarted) {
        await qrRef.current.stop();
        await qrRef.current.clear();
        setScannerStarted(false);
      }
    } catch (err) {
      console.log("Scanner already stopped");
    }
  };

  // ================= APPROVE =================
  const approve = () => {
    alert("Entry Approved");
    setData(null);
    setBookingId("");
  };

  // ================= REJECT =================
  const reject = () => {
    alert("Entry Rejected");
    setData(null);
    setBookingId("");
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Gate Verification</h2>

      {/* MANUAL ENTRY */}
      <div style={styles.inputBox}>
        <input
          type="text"
          placeholder="Enter Booking ID"
          value={bookingId}
          onChange={(e) => setBookingId(e.target.value)}
          style={styles.input}
        />
        <button onClick={() => handleVerify(bookingId)} style={styles.button}>
          Verify
        </button>
      </div>

      {/* SCANNER CONTROL */}
      <div style={{ marginBottom: "20px" }}>
        {!scannerStarted ? (
          <button onClick={startScanner} style={styles.scanBtn}>
            Start Scanner
          </button>
        ) : (
          <button onClick={stopScanner} style={styles.stopBtn}>
            Stop Scanner
          </button>
        )}
      </div>

      {/* CAMERA AREA */}
      <div id="reader" style={{ width: "320px" }}></div>

      {error && <p style={styles.error}>{error}</p>}

      {/* RESULT CARD */}
      {data && (
        <div style={styles.card}>
          <h3 style={styles.success}>ENTRY VERIFIED</h3>

          <div style={styles.userSection}>
            {data.userPhoto && (
              <img
                src={data.userPhoto}
                alt="User"
                style={styles.userPhoto}
              />
            )}

            <div>
              <p><strong>Name:</strong> {data.userName}</p>
              <p><strong>Booking ID:</strong> {data.bookingId}</p>
              <p><strong>Temple:</strong> {data.templeName}</p>
              <p><strong>Total Members:</strong> {data.totalMembers}</p>
              <p>
                <strong>Adults:</strong> {data.adultCount} |{" "}
                <strong>Children:</strong> {data.childCount}
              </p>
            </div>
          </div>

          {/* MEMBERS */}
          <div style={styles.members}>
            {data.members.map((m, index) => (
              <div key={index} style={styles.memberCard}>
                {m.photo && (
                  <img src={m.photo} alt="Member" style={styles.memberPhoto} />
                )}
                <p>{m.fullName}</p>
                <p>{m.age} yrs</p>
                <p>{m.category}</p>
              </div>
            ))}
          </div>

          {/* BUTTONS */}
          <div style={styles.buttonGroup}>
            <button onClick={approve} style={styles.approveBtn}>
              Approve Entry
            </button>
            <button onClick={reject} style={styles.rejectBtn}>
              Reject Entry
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "40px",
    background: "#fafafa",
    minHeight: "100vh",
  },
  heading: {
    color: "#c7ad88",
    marginBottom: "20px",
  },
  inputBox: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
  },
  input: {
    padding: "8px",
    flex: 1,
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  button: {
    background: "#c7ad88",
    color: "white",
    border: "none",
    padding: "8px 15px",
    borderRadius: "6px",
  },
  scanBtn: {
    background: "#333",
    color: "white",
    padding: "8px 15px",
    borderRadius: "6px",
  },
  stopBtn: {
    background: "red",
    color: "white",
    padding: "8px 15px",
    borderRadius: "6px",
  },
  error: {
    color: "red",
    fontWeight: "bold",
  },
  card: {
    marginTop: "20px",
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  success: {
    color: "green",
  },
  userSection: {
    display: "flex",
    gap: "20px",
    alignItems: "center",
  },
  userPhoto: {
    width: "120px",
    height: "120px",
    borderRadius: "10px",
    objectFit: "cover",
  },
  members: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
    gap: "10px",
    marginTop: "20px",
  },
  memberCard: {
    border: "1px solid #eee",
    padding: "10px",
    borderRadius: "6px",
    textAlign: "center",
  },
  memberPhoto: {
    width: "100%",
    height: "100px",
    objectFit: "cover",
    borderRadius: "6px",
  },
  buttonGroup: {
    marginTop: "20px",
    display: "flex",
    gap: "15px",
  },
  approveBtn: {
    background: "green",
    color: "white",
    padding: "8px 15px",
    borderRadius: "6px",
  },
  rejectBtn: {
    background: "red",
    color: "white",
    padding: "8px 15px",
    borderRadius: "6px",
  },
};

export default GateVerify;
