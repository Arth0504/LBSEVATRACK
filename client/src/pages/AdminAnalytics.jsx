import { useState, useRef } from "react";
import API from "../api/axios";
import { Bar } from "react-chartjs-2";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AdminAnalytics = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [stats, setStats] = useState(null);
  const reportRef = useRef();

  const fetchData = async () => {
    if (!startDate || !endDate)
      return alert("Select date range");

    const res = await API.get(
      `/admin/analytics?startDate=${startDate}&endDate=${endDate}`
    );

    setStats(res.data);
  };

  const exportPDF = async () => {
    const canvas = await html2canvas(reportRef.current);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF();
    pdf.addImage(imgData, "PNG", 10, 10, 190, 0);
    pdf.save("Temple_Analytics_Report.pdf");
  };

  const exportCSV = () => {
    if (!stats) return;
    const headers = ["Temple", "Bookings", "Visitors", "Cancelled", "Total Members"];
    const rows = Object.keys(stats).map((temple) => [
      temple,
      stats[temple].bookings,
      stats[temple].visitors,
      stats[temple].cancelled,
      stats[temple].members,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Temple_Analytics_Report.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const chartData = stats && {
    labels: Object.keys(stats),
    datasets: [
      {
        label: "Bookings",
        data: Object.values(stats).map((s) => s.bookings),
        backgroundColor: "var(--color-primary)", // saffron
      },
      {
        label: "Visitors",
        data: Object.values(stats).map((s) => s.visitors),
        backgroundColor: "var(--color-success)",
      },
      {
        label: "Cancelled",
        data: Object.values(stats).map((s) => s.cancelled),
        backgroundColor: "var(--color-warning)",
      },
      {
        label: "Total Members",
        data: Object.values(stats).map((s) => s.members),
        backgroundColor: "#007bff",
      },
    ],
  };

  return (
    <div
      style={{
        padding: "40px",
        minHeight: "100vh",
        background: "#f8f9fa",
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      <h2
        style={{
          color: "var(--color-primary)",
          marginBottom: "30px",
          fontSize: "28px",
          fontWeight: "700"
        }}
      >
        Temple Analytics Dashboard
      </h2>

      {/* Controls */}
      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
          marginBottom: "30px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />

        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />

        <button
          onClick={fetchData}
          style={{
            background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))",
            color: "white",
            border: "none",
            padding: "8px 15px",
            borderRadius: "6px",
            cursor: "pointer",
            transition: "0.3s",
          }}
        >
          Generate
        </button>

        {stats && (
          <>
            <button
              onClick={exportPDF}
              style={{
                background: "#222",
                color: "white",
                border: "none",
                padding: "8px 15px",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Export PDF
            </button>
            <button
              onClick={exportCSV}
              style={{
                background: "var(--color-success)",
                color: "white",
                border: "none",
                padding: "8px 15px",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Export CSV
            </button>
          </>
        )}
      </div>

      {/* Chart */}
      {stats && (
        <div
          ref={reportRef}
          style={{
            background: "white",
            padding: "30px",
            borderRadius: "12px",
            boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
          }}
        >
          <Bar
            data={chartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: "top",
                },
              },
            }}
          />
        </div>
      )}
    </div>
  );
};

export default AdminAnalytics;
