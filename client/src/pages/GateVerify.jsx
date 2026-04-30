import { useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import API from "../api/axios";
import { ScanLine, CheckCircle, XCircle, Search } from "lucide-react";

const GateVerify = () => {
  const [bookingId, setBookingId] = useState("");
  const [data, setData] = useState(null);
  const [scannerStarted, setScannerStarted] = useState(false);
  const [error, setError] = useState("");
  const qrRef = useRef(null);

  const handleVerify = async (id) => {
    try {
      setError("");
      const res = await API.post("/gates/verify", { bookingId: id });
      setData(res.data.booking);
    } catch (err) {
      setError(err.response?.data?.message || "Verification Failed");
    }
  };

  const startScanner = async () => {
    try {
      const qr = new Html5Qrcode("reader");
      qrRef.current = qr;
      const devices = await Html5Qrcode.getCameras();
      if (!devices?.length) { alert("No camera found"); return; }
      await qr.start(devices[0].id, { fps: 10, qrbox: 250 }, async (decoded) => {
        setBookingId(decoded);
        await handleVerify(decoded);
        if (qrRef.current) { await qrRef.current.stop(); await qrRef.current.clear(); setScannerStarted(false); }
      }, () => {});
      setScannerStarted(true);
    } catch { alert("Please allow camera permission."); }
  };

  const stopScanner = async () => {
    try {
      if (qrRef.current && scannerStarted) { await qrRef.current.stop(); await qrRef.current.clear(); setScannerStarted(false); }
    } catch {}
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-warm-800">Gate Verification</h1>
        <p className="text-warm-400 text-sm mt-1">Scan QR code or enter booking ID manually</p>
      </div>

      {/* Manual Entry */}
      <div className="card-base p-6">
        <h3 className="font-serif text-base font-semibold text-warm-700 mb-4">Manual Entry</h3>
        <div className="flex gap-3">
          <input
            className="input-base flex-1"
            type="text"
            placeholder="Enter Booking ID"
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleVerify(bookingId)}
          />
          <button onClick={() => handleVerify(bookingId)} className="btn-primary px-5 gap-2">
            <Search size={16} /> Verify
          </button>
        </div>
      </div>

      {/* Scanner */}
      <div className="card-base p-6">
        <h3 className="font-serif text-base font-semibold text-warm-700 mb-4">QR Scanner</h3>
        <div className="flex gap-3 mb-4">
          {!scannerStarted ? (
            <button onClick={startScanner} className="btn-primary gap-2">
              <ScanLine size={16} /> Start Scanner
            </button>
          ) : (
            <button onClick={stopScanner} className="btn-ghost gap-2">
              Stop Scanner
            </button>
          )}
        </div>
        <div id="reader" className="rounded-2xl overflow-hidden" style={{ width: "100%", maxWidth: "320px" }} />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-500 text-sm">
          <XCircle size={18} /> {error}
        </div>
      )}

      {/* Result Card */}
      {data && (
        <div className="card-base p-6 border-l-4 border-blush-300">
          <div className="flex items-center gap-2 mb-5">
            <CheckCircle size={20} className="text-blush-400" />
            <h3 className="font-serif text-lg font-semibold text-warm-800">Entry Verified</h3>
          </div>

          <div className="flex gap-5 mb-5">
            {data.userPhoto && (
              <img src={data.userPhoto} alt="User" className="w-20 h-20 rounded-2xl object-cover border-2 border-rose-100 flex-shrink-0" />
            )}
            <div className="space-y-1 text-sm text-warm-600">
              <p><span className="font-medium text-warm-700">Name:</span> {data.userName}</p>
              <p><span className="font-medium text-warm-700">Booking ID:</span> <span className="font-mono text-xs">{data.bookingId}</span></p>
              <p><span className="font-medium text-warm-700">Temple:</span> {data.templeName}</p>
              <p><span className="font-medium text-warm-700">Members:</span> {data.totalMembers} (Adults: {data.adultCount}, Children: {data.childCount})</p>
            </div>
          </div>

          {/* Members Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
            {data.members?.map((m, i) => (
              <div key={i} className="card-soft p-3 text-center text-xs">
                {m.photo && <img src={m.photo} alt="Member" className="w-full h-20 object-cover rounded-xl mb-2" />}
                <p className="font-medium text-warm-700">{m.fullName}</p>
                <p className="text-warm-400">{m.age} yrs · {m.category}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={() => { alert("Entry Approved"); setData(null); setBookingId(""); }} className="btn-primary flex-1 py-3">
              ✓ Approve Entry
            </button>
            <button onClick={() => { alert("Entry Rejected"); setData(null); setBookingId(""); }} className="btn-ghost flex-1 py-3 text-rose-400 hover:bg-rose-50 hover:border-rose-200">
              ✕ Reject Entry
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GateVerify;
