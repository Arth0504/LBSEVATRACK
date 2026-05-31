import { useState, useRef } from "react";
import API from "../api/axios";
import { Bar } from "react-chartjs-2";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "react-toastify";
import { BarChart3, Download, FileText, Calendar } from "lucide-react";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ACCENT = "#dd2d4a";

const AdminAnalytics = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const reportRef = useRef();

  const fetchData = async () => {
    if (!startDate || !endDate) { toast.error("Please select a date range"); return; }
    setLoading(true);
    try {
      const res = await API.get(`/reports?startDate=${startDate}&endDate=${endDate}`);
      setReport(res.data);
      toast.success("Analytics loaded ✓");
    } catch { toast.error("Failed to load analytics"); }
    finally { setLoading(false); }
  };

  const exportPDF = async () => {
    if (!reportRef.current) return;
    try {
      const canvas = await html2canvas(reportRef.current);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("SevaTrack_Analytics_Report.pdf");
      toast.success("PDF exported ✓");
    } catch { toast.error("Export failed"); }
  };

  const exportCSV = () => {
    if (!report || !report.templeStats) return;
    const headers = ["Temple", "Total Bookings", "Verified Entries", "Total Members"];
    const rows = report.templeStats.map(t => [
      t._id || "Unknown", t.totalBookings, t.verifiedEntries, t.totalMembers
    ]);
    const csv = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", "Temple_Analytics_Report.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success("CSV exported ✓");
  };

  const chartData = report && report.templeStats && {
    labels: report.templeStats.map(t => t._id || "Unknown"),
    datasets: [
      { label: "Bookings",      data: report.templeStats.map(t => t.totalBookings),  backgroundColor: "#dd2d4a" },
      { label: "Verified Entries",      data: report.templeStats.map(t => t.verifiedEntries),  backgroundColor: "rgba(221,45,74,0.65)" },
      { label: "Total Members", data: report.templeStats.map(t => t.totalMembers),   backgroundColor: "rgba(221,45,74,0.15)" },
    ],
  };

  const totalStats = report ? report.summary : null;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Temple Reports</h1>
        <p className="page-sub">Generate analytical reports for any date range</p>
      </div>

      {/* Controls */}
      <div className="card p-6">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="label">Start Date</label>
            <input type="date" className="input w-auto" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="label">End Date</label>
            <input type="date" className="input w-auto" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          <button onClick={fetchData} disabled={loading} className="btn-primary gap-2 py-3">
            <BarChart3 size={16} /> {loading ? "Loading..." : "Generate Report"}
          </button>
          {report && (
            <>
              <button onClick={exportPDF} className="btn-secondary gap-2 py-3">
                <FileText size={16} /> Export PDF
              </button>
              <button onClick={exportCSV} className="btn-ghost gap-2 py-3">
                <Download size={16} /> Export CSV
              </button>
            </>
          )}
        </div>
      </div>

      <div ref={reportRef} className="space-y-6 bg-white/60 p-1">
        {/* Summary cards */}
        {totalStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Bookings", value: totalStats.totalBookings, bg: "#fff0f2", color: ACCENT, border: "#ffadb8" },
              { label: "Verified Entries",  value: totalStats.totalVerifiedEntries,  bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
              { label: "Pending Entries",       value: totalStats.totalPendingEntries, bg: "#fff9f6", color: "#9f766d", border: "#e7d1c7" },
              { label: "Total Members",   value: totalStats.totalMembers,   bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
            ].map(s => (
              <div key={s.label} className="card p-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
                  <Calendar size={18} />
                </div>
                <p className="font-serif text-2xl font-bold text-gray-800">{s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Chart */}
        {report && (
          <div className="card p-6">
            <h3 className="font-serif text-lg font-bold text-gray-800 mb-6">Temple-wise Breakdown</h3>
            <Bar
              data={chartData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: "top" },
                  title: { display: false },
                },
                scales: {
                  y: { beginAtZero: true, grid: { color: "#f0f0f0" } },
                  x: { grid: { display: false } },
                },
              }}
            />
          </div>
        )}

        {/* Table breakdown */}
        {report && report.templeStats && (
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-serif text-lg font-bold text-gray-800">Detailed Breakdown</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: "#fafafa" }}>
                    {["Temple", "Bookings", "Verified", "Members"].map(h => (
                      <th key={h} className="table-head-cell">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {report.templeStats.map(t => (
                    <tr key={t._id || "unknown"} className="hover:bg-gray-25 transition-colors">
                      <td className="table-cell font-medium text-gray-800">{t._id || "Unknown"}</td>
                      <td className="table-cell"><span className="font-semibold" style={{ color: ACCENT }}>{t.totalBookings}</span></td>
                      <td className="table-cell text-emerald-600 font-semibold">{t.verifiedEntries}</td>
                      <td className="table-cell text-blue-600 font-semibold">{t.totalMembers}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;
