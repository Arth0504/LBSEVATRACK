import { useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import API from "../api/axios";
import { ScanLine, Search, CheckCircle, XCircle, AlertCircle } from "lucide-react";

const GateVerify = () => {
  const [id, setId] = useState("");
  const [data, setData] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const qr = useRef(null);

  const verify = async (bid) => {
    try {
      setError("");
      const res = await API.post("/gates/verify", { bookingId: bid });
      setData(res.data.booking);
    } catch (e) { setError(e.response?.data?.message || "Verification Failed"); }
  };

  const startScan = async () => {
    try {
      const scanner = new Html5Qrcode("reader");
      qr.current = scanner;
      const devices = await Html5Qrcode.getCameras();
      if (!devices?.length) { alert("No camera found"); return; }
      await scanner.start(devices[0].id, { fps: 10, qrbox: 250 }, async (decoded) => {
        setId(decoded);
        await verify(decoded);
        if (qr.current) { await qr.current.stop(); await qr.current.clear(); setScanning(false); }
      }, () => {});
      setScanning(true);
    } catch { alert("Please allow camera permission."); }
  };

  const stopScan = async () => {
    try { if (qr.current && scanning) { await qr.current.stop(); await qr.current.clear(); setScanning(false); } } catch {}
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="page-header">
        <h1 className="page-title">Gate Verification</h1>
        <p className="page-sub">Scan QR code or enter booking ID manually</p>
      </div>

      {/* Manual entry */}
      <div className="card p-6 shadow-sm">
        <h3 className="font-serif text-base font-semibold text-stone-700 mb-4">Manual Entry</h3>
        <div className="flex gap-3">
          <input
            className="input flex-1"
            type="text"
            placeholder="Enter Booking ID"
            value={id}
            onChange={e => setId(e.target.value)}
            onKeyDown={e => e.key === "Enter" && verify(id)}
          />
          <button onClick={() => verify(id)} className="btn-primary px-5 gap-2">
            <Search size={16} /> Verify
          </button>
        </div>
      </div>

      {/* Scanner */}
      <div className="card p-6 shadow-sm">
        <h3 className="font-serif text-base font-semibold text-stone-700 mb-4">QR Scanner</h3>
        <div className="flex gap-3 mb-4">
          {!scanning ? (
            <button onClick={startScan} className="btn-primary gap-2"><ScanLine size={16} /> Start Scanner</button>
          ) : (
            <button onClick={stopScan} className="btn-ghost gap-2">Stop Scanner</button>
          )}
        </div>
        <div id="reader" className="rounded-xl overflow-hidden" style={{ maxWidth: "320px" }} />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          <AlertCircle size={18} className="flex-shrink-0" /> {error}
        </div>
      )}

      {/* Result */}
      {data && (
        <div className="card shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100 flex items-center gap-2">
            <CheckCircle size={18} className="text-emerald-600" />
            <h3 className="font-serif text-lg font-bold text-emerald-800">Entry Verified</h3>
          </div>

          <div className="p-6">
            <div className="flex gap-5 mb-6">
              {data.userPhoto && (
                <img src={data.userPhoto} alt="User" className="w-20 h-20 rounded-xl object-cover border-2 border-stone-150 shadow-xs flex-shrink-0" />
              )}
              <div className="space-y-1.5 text-sm">
                <p><span className="font-semibold text-stone-700">Name:</span> <span className="text-stone-600">{data.userName}</span></p>
                <p><span className="font-semibold text-stone-700">Booking ID:</span> <span className="font-mono text-xs text-stone-500">{data.bookingId}</span></p>
                <p><span className="font-semibold text-stone-700">Temple:</span> <span className="text-stone-600">{data.templeName}</span></p>
                <p><span className="font-semibold text-stone-700">Members:</span> <span className="text-stone-600">{data.totalMembers} (Adults: {data.adultCount}, Children: {data.childCount})</span></p>
              </div>
            </div>

            {data.members?.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {data.members.map((m, i) => (
                  <div key={i} className="card-muted p-3 text-center text-xs">
                    {m.photo && <img src={m.photo} alt="Member" className="w-full h-20 object-cover rounded-lg mb-2" />}
                    <p className="font-semibold text-stone-700">{m.fullName}</p>
                    <p className="text-stone-400">{m.age} yrs · {m.category}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => { alert("Entry Approved ✓"); setData(null); setId(""); }} className="btn-primary flex-1 py-3 gap-2">
                <CheckCircle size={16} /> Approve Entry
              </button>
              <button onClick={() => { alert("Entry Rejected ✕"); setData(null); setId(""); }} className="btn-danger flex-1 py-3 gap-2">
                <XCircle size={16} /> Reject Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GateVerify;
