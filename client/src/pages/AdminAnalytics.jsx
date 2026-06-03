import { useState, useRef } from "react";
import API from "../api/axios";
import { Bar } from "react-chartjs-2";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "react-toastify";
import { BarChart3, Download, FileText, Calendar, AlertCircle } from "lucide-react";
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
      const res = await API.get(`/reports?filter=custom&customStart=${startDate}&customEnd=${endDate}`);
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
    if (!report?.templeWise || report.templeWise.length === 0) {
      toast.error("No data to export");
      return;
    }
    const headers = ["Temple", "Total Bookings", "Verified Entries", "Total Members"];
    const rows = report.templeWise.map(t => [
      t.templeName || "Unknown", t.bookings || 0, t.verified || 0, t.members || 0
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

  // ✅ FIXED: Defensive chart data construction
  const chartData = report?.templeWise && report.templeWise.length > 0 ? {
    labels: report.templeWise.map(t => t.templeName || "Unknown"),
    datasets: [
      { label: "Bookings",      data: report.templeWise.map(t => t.bookings || 0),  backgroundColor: "#dd2d4a" },
      { label: "Verified Entries",      data: report.templeWise.map(t => t.verified || 0),  backgroundColor: "rgba(221,45,74,0.65)" },
      { label: "Total Members", data: report.templeWise.map(t => t.members || 0),   backgroundColor: "rgba(221,45,74,0.15)" },
    ],
  } : null;

  const totalStats = report?.summary || null;

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

      {/* ✅ FIXED: Empty state when no report */}
      {!report && !loading && (
        <div className="card p-12 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-4">
            <BarChart3 size={32} className="text-stone-400" />
          </div>
          <h3 className="font-serif text-xl font-medium text-stone-700 mb-2">No Report Generated</h3>
          <p className="text-sm text-stone-500">Select a date range and click Generate Report to view analytics</p>
        </div>
      )}

      {/* ✅ FIXED: Show message when report has no data */}
      {report && totalStats && totalStats.totalBookings === 0 && (
        <div className="card p-8 text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mb-3">
            <AlertCircle size={28} className="text-amber-500" />
          </div>
          <h3 className="font-serif text-lg font-medium text-stone-700 mb-1">No Data Available</h3>
          <p className="text-sm text-stone-500">No bookings found for the selected date range</p>
        </div>
      )}

      <div ref={reportRef} className="space-y-6 bg-white/60 p-1">
        {/* Summary cards */}
        {totalStats && totalStats.totalBookings > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Bookings", value: totalStats.totalBookings || 0, bg: "#fff0f2", color: ACCENT, border: "#ffadb8" },
              { label: "Verified Entries",  value: totalStats.verifiedEntries || 0,  bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
              { label: "Pending Entries",       value: totalStats.pendingEntries || 0, bg: "#fff9f6", color: "#9f766d", border: "#e7d1c7" },
              { label: "Total Members",   value: totalStats.totalMembers || 0,   bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
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

        {/* ✅ FIXED: Chart with defensive checks */}
        {chartData && chartData.labels && chartData.labels.length > 0 && (
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

        {/* ✅ FIXED: Table breakdown with defensive checks */}
        {report?.templeWise && report.templeWise.length > 0 && (
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
                  {report.templeWise.map((t, idx) => (
                    <tr key={t.templeId || idx} className="hover:bg-gray-25 transition-colors">
                      <td className="table-cell font-medium text-gray-800">{t.templeName || "Unknown"}</td>
                      <td className="table-cell"><span className="font-semibold" style={{ color: ACCENT }}>{t.bookings || 0}</span></td>
                      <td className="table-cell text-emerald-600 font-semibold">{t.verified || 0}</td>
                      <td className="table-cell text-blue-600 font-semibold">{t.members || 0}</td>
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
