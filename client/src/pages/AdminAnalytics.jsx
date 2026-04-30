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
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const reportRef = useRef();

  const fetchData = async () => {
    if (!startDate || !endDate) { toast.error("Please select a date range"); return; }
    setLoading(true);
    try {
      const res = await API.get(`/admin/analytics?startDate=${startDate}&endDate=${endDate}`);
      setStats(res.data);
      toast.success("Analytics loaded ✓");
    } catch { toast.error("Failed to load analytics"); }
    finally { setLoading(false); }
  };

  const exportPDF = async () => {
    if (!reportRef.current) return;
    try {
      const canvas = await html2canvas(reportRef.current);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      pdf.addImage(imgData, "PNG", 10, 10, 190, 0);
      pdf.save("Temple_Analytics_Report.pdf");
      toast.success("PDF exported ✓");
    } catch { toast.error("Export failed"); }
  };

  const exportCSV = () => {
    if (!stats) return;
    const headers = ["Temple", "Bookings", "Visitors", "Cancelled", "Total Members"];
    const rows = Object.keys(stats).map(temple => [
      temple, stats[temple].bookings, stats[temple].visitors, stats[temple].cancelled, stats[temple].members,
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

  const chartData = stats && {
    labels: Object.keys(stats),
    datasets: [
      { label: "Bookings",      data: Object.values(stats).map(s => s.bookings),  backgroundColor: "#dd2d4a" },
      { label: "Visitors",      data: Object.values(stats).map(s => s.visitors),  backgroundColor: "rgba(221,45,74,0.65)" },
      { label: "Cancelled",     data: Object.values(stats).map(s => s.cancelled), backgroundColor: "rgba(221,45,74,0.35)" },
      { label: "Total Members", data: Object.values(stats).map(s => s.members),   backgroundColor: "rgba(221,45,74,0.15)" },
    ],
  };

  const totalStats = stats ? {
    bookings:  Object.values(stats).reduce((a, s) => a + s.bookings, 0),
    visitors:  Object.values(stats).reduce((a, s) => a + s.visitors, 0),
    cancelled: Object.values(stats).reduce((a, s) => a + s.cancelled, 0),
    members:   Object.values(stats).reduce((a, s) => a + s.members, 0),
  } : null;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Temple Analytics</h1>
        <p className="page-sub">Generate reports for any date range</p>
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
          {stats && (
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

      {/* Summary cards */}
      {totalStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Bookings", value: totalStats.bookings, bg: "#fff0f2", color: ACCENT, border: "#ffadb8" },
            { label: "Total Visitors",  value: totalStats.visitors,  bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
            { label: "Cancelled",       value: totalStats.cancelled, bg: "#fff7ed", color: "#ea580c", border: "#fed7aa" },
            { label: "Total Members",   value: totalStats.members,   bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
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
      {stats && (
        <div ref={reportRef} className="card p-6">
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
      {stats && (
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-serif text-lg font-bold text-gray-800">Detailed Breakdown</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: "#fafafa" }}>
                  {["Temple", "Bookings", "Visitors", "Cancelled", "Members"].map(h => (
                    <th key={h} className="table-head-cell">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(stats).map(([temple, data]) => (
                  <tr key={temple} className="hover:bg-gray-25 transition-colors">
                    <td className="table-cell font-medium text-gray-800">{temple}</td>
                    <td className="table-cell"><span className="font-semibold" style={{ color: ACCENT }}>{data.bookings}</span></td>
                    <td className="table-cell text-emerald-600 font-semibold">{data.visitors}</td>
                    <td className="table-cell text-red-500 font-semibold">{data.cancelled}</td>
                    <td className="table-cell text-blue-600 font-semibold">{data.members}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnalytics;
