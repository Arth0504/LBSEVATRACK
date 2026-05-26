import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import jsPDF from "jspdf";
import { QRCodeCanvas } from "qrcode.react";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";
import { Download, X, ArrowLeft, Calendar, Hash, Users, BookOpen, QrCode, AlertCircle } from "lucide-react";

const ACCENT = "#dd2d4a";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [fullscreenQR, setFullscreenQR] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/bookings/my")
      .then(r => setBookings(r.data))
      .catch(() => toast.error("Failed to load bookings"))
      .finally(() => setLoading(false));
  }, []);

  const cancel = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      await API.put(`/bookings/cancel/${id}`);
      toast.success("Booking cancelled");
      const res = await API.get("/bookings/my");
      setBookings(res.data);
    } catch { toast.error("Cancel failed"); }
  };

  const generateQRData = (booking) => {
    return JSON.stringify({
      bookingId: booking.bookingId,
      userName: booking.user?.name || "N/A",
      temple: booking.slot?.temple?.name || "N/A",
      location: booking.slot?.temple?.location || "N/A",
      date: new Date(booking.slot?.date).toLocaleDateString("en-IN"),
      time: booking.slot?.startTime && booking.slot?.endTime ? `${booking.slot.startTime} - ${booking.slot.endTime}` : "N/A",
      members: booking.totalMembers,
      status: booking.status,
    });
  };

  const getTheme = (templeName) => {
    const t = (templeName || "").toLowerCase();
    if (t.includes("dwarka")) {
      return {
        bg: [255, 251, 235], // amber-50
        border: [217, 119, 6], // amber-600 (gold)
        headerBg: [30, 58, 138], // blue-900
        textDark: [30, 58, 138],
        textLight: [217, 119, 6],
        accent: [253, 230, 138], // amber-200
        hindiMsg: "Faith is yours, Service is ours"
      };
    } else if (t.includes("ambaji")) {
      return {
        bg: [255, 241, 242], // rose-50
        border: [225, 29, 72], // rose-600
        headerBg: [136, 19, 55], // rose-900 (maroon)
        textDark: [136, 19, 55],
        textLight: [225, 29, 72],
        accent: [254, 205, 211],
        hindiMsg: "Mother's Grace, Always on All"
      };
    } else if (t.includes("somnath")) {
      return {
        bg: [240, 253, 244], // green-50
        border: [34, 197, 94], // green-500
        headerBg: [20, 83, 45], // green-900
        textDark: [20, 83, 45],
        textLight: [34, 197, 94],
        accent: [187, 247, 208],
        hindiMsg: "Every Name: Shivaya"
      };
    }
    // Default Saffron
    return {
      bg: [255, 247, 237],
      border: [245, 158, 11],
      headerBg: [234, 88, 12],
      textDark: [120, 53, 15],
      textLight: [180, 83, 9],
      accent: [253, 230, 138],
      hindiMsg: "Your sacred journey begins here"
    };
  };

  const getCircularImage = async (base64OrUrl) => {
    return new Promise((resolve) => {
      if (!base64OrUrl) return resolve(null);
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const size = Math.min(img.width, img.height);
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, (img.width - size) / 2, (img.height - size) / 2, size, size, 0, 0, size, size);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => resolve(null);
      img.src = base64OrUrl;
    });
  };

  const drawPage = async (doc, data, theme, member, isMaster, pageIdx) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 12;
    const ticketWidth = pageWidth - (margin * 2);
    const ticketHeight = pageHeight - (margin * 2);
    let y = margin;
    const startX = margin;

    // 1. Draw outer ticket shape (full page bleed)
    doc.setFillColor(...theme.bg);
    doc.setDrawColor(...theme.border);
    doc.setLineWidth(0.8);
    doc.rect(startX, y, ticketWidth, ticketHeight, "FD");

    // Motif borders
    doc.setLineWidth(0.3);
    doc.rect(startX + 3, y + 3, ticketWidth - 6, ticketHeight - 6, "S");
    doc.rect(startX + 5, y + 5, ticketWidth - 10, ticketHeight - 10, "S");
    
    // Corner accents
    const cs = 12;
    doc.setLineWidth(0.8);
    doc.line(startX + 8, y + 8 + cs, startX + 8, y + 8);
    doc.line(startX + 8, y + 8, startX + 8 + cs, y + 8);
    doc.line(startX + ticketWidth - 8, y + 8 + cs, startX + ticketWidth - 8, y + 8);
    doc.line(startX + ticketWidth - 8, y + 8, startX + ticketWidth - 8 - cs, y + 8);
    doc.line(startX + 8, y + ticketHeight - 8 - cs, startX + 8, y + ticketHeight - 8);
    doc.line(startX + 8, y + ticketHeight - 8, startX + 8 + cs, y + ticketHeight - 8);
    doc.line(startX + ticketWidth - 8, y + ticketHeight - 8 - cs, startX + ticketWidth - 8, y + ticketHeight - 8);
    doc.line(startX + ticketWidth - 8, y + ticketHeight - 8, startX + ticketWidth - 8 - cs, y + ticketHeight - 8);

    // 2. Header Archway (Individual Pass only)
    if (!isMaster) {
       doc.setFillColor(...theme.headerBg);
       doc.rect(startX, y, ticketWidth, 95, "F");
       // Inner motif inside the dark arch
       doc.setDrawColor(...theme.border);
       doc.setLineWidth(0.3);
       doc.rect(startX + 3, y + 3, ticketWidth - 6, 92, "S");
       doc.rect(startX + 5, y + 5, ticketWidth - 10, 90, "S");
       
       // Upward curve cutout effect at the bottom of the arch block
       doc.setFillColor(...theme.bg);
       doc.ellipse(pageWidth/2, y + 95, ticketWidth/2, 15, 'F');
       doc.setDrawColor(...theme.border);
       doc.setLineWidth(0.5);
       doc.ellipse(pageWidth/2, y + 95, ticketWidth/2, 15, 'S');
       // Clean up bottom edge of the stroke that bled out
       doc.setFillColor(...theme.bg);
       doc.rect(startX, y + 95, ticketWidth, 16, "F");
       // Re-draw outer borders that were erased
       doc.setDrawColor(...theme.border);
       doc.setLineWidth(0.8);
       doc.line(startX, y + 95, startX, y + 112);
       doc.line(startX + ticketWidth, y + 95, startX + ticketWidth, y + 112);
       doc.setLineWidth(0.3);
       doc.line(startX+3, y+95, startX+3, y+112);
       doc.line(startX+ticketWidth-3, y+95, startX+ticketWidth-3, y+112);
       doc.line(startX+5, y+95, startX+5, y+112);
       doc.line(startX+ticketWidth-5, y+95, startX+ticketWidth-5, y+112);
    }

    // Header Text
    y += 20;
    doc.setTextColor(isMaster ? theme.textDark[0] : 255, isMaster ? theme.textDark[1] : 255, isMaster ? theme.textDark[2] : 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("SEVATRACK", pageWidth / 2, y, { align: "center" });

    y += 15;
    doc.setFontSize(isMaster ? 28 : 26);
    doc.setFont("times", "bold");
    doc.text(isMaster ? "Family Darshan" : "Darshan", pageWidth / 2, y, { align: "center" });
    if (isMaster) {
       y += 12;
       doc.text("Booking", pageWidth / 2, y, { align: "center" });
    } else {
       y += 10;
       doc.text("Pravesh Pass", pageWidth / 2, y, { align: "center" });
    }

    y += 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(isMaster ? theme.textLight[0] : 255, isMaster ? theme.textLight[1] : 255, isMaster ? theme.textLight[2] : 255);
    doc.text(isMaster ? `— ${theme.hindiMsg} —` : "Your sacred journey begins here", pageWidth / 2, y, { align: "center" });

    // Status Badge
    let badgeColor = [245, 158, 11]; // gold
    if (data.status === "used") badgeColor = [59, 130, 246]; // blue
    if (data.status === "cancelled") badgeColor = [239, 68, 68]; // red

    if (!isMaster) {
      y += 12;
      doc.setFillColor(...badgeColor);
      doc.roundedRect((pageWidth/2) - 18, y, 36, 8, 4, 4, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("VALID", pageWidth/2, y + 5.5, { align: "center" });
      y += 20;
    } else {
      y += 20;
    }

    // 3. Photo Section (Individual)
    if (!isMaster && member) {
       const imgSize = 40;
       const imgX = (pageWidth / 2) - (imgSize / 2);
       const imgY = y - 5; // Overlap the arch perfectly
       
       if (member.photo) {
         const circData = await getCircularImage(member.photo);
         if (circData) {
           doc.addImage(circData, "PNG", imgX, imgY, imgSize, imgSize);
         }
       } else {
           doc.setFillColor(...theme.accent);
           doc.circle(pageWidth/2, imgY + (imgSize/2), imgSize/2, "F");
       }
       
       // Draw gold border around circular photo
       doc.setDrawColor(...theme.border);
       doc.setLineWidth(2);
       doc.circle(pageWidth/2, imgY + (imgSize/2), imgSize/2, "S");
       doc.setDrawColor(255, 255, 255);
       doc.setLineWidth(0.5);
       doc.circle(pageWidth/2, imgY + (imgSize/2), (imgSize/2) - 1, "S");

       y += imgSize + 10;
       doc.setTextColor(...theme.textDark);
       doc.setFontSize(22);
       doc.setFont("times", "bold");
       doc.text(member.fullName || "Devotee", pageWidth/2, y, { align: "center" });

       y += 6;
       doc.setTextColor(...theme.textDark);
       doc.setFontSize(10);
       doc.setFont("helvetica", "bold");
       const ageGender = [];
       if (member.age) ageGender.push(`${member.age} Yrs`);
       if (member.gender) ageGender.push(member.gender.charAt(0).toUpperCase() + member.gender.slice(1));
       if (member.category) ageGender.push(member.category.charAt(0).toUpperCase() + member.category.slice(1));
       doc.text(ageGender.join(" • ") || "Primary Member", pageWidth/2, y, { align: "center" });
       y += 12;
    }

    // 4. Booking Details Grid
    const boxY = y;
    
    if (isMaster) {
      doc.setFillColor(theme.headerBg[0], theme.headerBg[1], theme.headerBg[2]);
      doc.roundedRect(startX + 8, boxY, ticketWidth - 16, 45, 3, 3, "F");
      // Inner motif
      doc.setDrawColor(...theme.border);
      doc.setLineWidth(0.3);
      doc.roundedRect(startX + 10, boxY + 2, ticketWidth - 20, 41, 2, 2, "S");
      
      doc.setTextColor(...theme.border);
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      
      doc.text("TEMPLE", startX + 18, boxY + 10);
      doc.text("DATE", startX + 85, boxY + 10);
      doc.text("SLOT TIME", startX + 135, boxY + 10);
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      const templeName = data.slot?.temple?.name || "Temple Darshan";
      doc.text(templeName, startX + 18, boxY + 15, { maxWidth: 65 });
      doc.text(new Date(data.slot?.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }), startX + 85, boxY + 15);
      const t = data.slot?.startTime && data.slot?.endTime ? `${data.slot.startTime} - ${data.slot.endTime}` : "N/A";
      doc.text(t, startX + 135, boxY + 15);

      doc.setDrawColor(...theme.border);
      doc.setLineWidth(0.2);
      doc.line(startX + 18, boxY + 22, startX + ticketWidth - 26, boxY + 22);

      doc.setTextColor(...theme.border);
      doc.setFontSize(7);
      doc.text("BOOKING ID", startX + 18, boxY + 30);
      doc.text("TOTAL MEMBERS", startX + 135, boxY + 30);
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont("courier", "bold");
      doc.text(data.bookingId, startX + 18, boxY + 36);
      doc.setFont("helvetica", "bold");
      doc.text(String(data.totalMembers), startX + 135, boxY + 36);
      
      y += 55;
    } else {
      // Individual grid
      doc.setDrawColor(...theme.border);
      doc.setLineWidth(0.5);
      doc.roundedRect(startX + 12, boxY, ticketWidth - 24, 38, 3, 3, "S");
      
      doc.setTextColor(...theme.textLight);
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      
      doc.text("TEMPLE", startX + 18, boxY + 9);
      doc.text("DATE", startX + 110, boxY + 9);
      
      doc.setTextColor(...theme.textDark);
      doc.setFontSize(9);
      const templeName = data.slot?.temple?.name || "Temple Darshan";
      doc.text(templeName, startX + 18, boxY + 14, { maxWidth: 85 });
      doc.text(new Date(data.slot?.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }), startX + 110, boxY + 14);
      
      doc.setDrawColor(...theme.accent);
      doc.setLineWidth(0.3);
      doc.line(startX + 18, boxY + 19, startX + ticketWidth - 30, boxY + 19);

      doc.setTextColor(...theme.textLight);
      doc.setFontSize(7);
      doc.text("SLOT TIME", startX + 18, boxY + 26);
      doc.text("BOOKING ID", startX + 110, boxY + 26);
      
      doc.setTextColor(...theme.textDark);
      doc.setFontSize(9);
      const t = data.slot?.startTime && data.slot?.endTime ? `${data.slot.startTime} - ${data.slot.endTime}` : "N/A";
      doc.text(t, startX + 18, boxY + 31);
      doc.setFont("courier", "bold");
      doc.text(data.bookingId, startX + 110, boxY + 31);

      y += 48;

      // Pass Type Bar
      doc.setFillColor(...theme.headerBg);
      doc.roundedRect(startX + 12, y, ticketWidth - 24, 16, 2, 2, "F");
      // inner motif
      doc.setDrawColor(...theme.border);
      doc.setLineWidth(0.3);
      doc.roundedRect(startX + 14, y + 2, ticketWidth - 28, 12, 1, 1, "S");

      doc.setTextColor(...theme.border);
      doc.setFontSize(6);
      doc.setFont("helvetica", "bold");
      doc.text("PASS TYPE", pageWidth / 2, y + 6, { align: "center" });
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text("Individual Entry Pass", pageWidth / 2, y + 11.5, { align: "center" });
      y += 22;
    }

    // 5. Devotees List (Master only)
    if (isMaster && data.members?.length > 0) {
      doc.setTextColor(...theme.textDark);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("VERIFIED MEMBERS", pageWidth / 2, y, { align: "center" });
      
      // Decorative line
      doc.setDrawColor(...theme.border);
      doc.setLineWidth(0.5);
      doc.line(startX + 20, y - 1, (pageWidth/2) - 25, y - 1);
      doc.line((pageWidth/2) + 25, y - 1, startX + ticketWidth - 20, y - 1);
      
      y += 12;

      for (let mIdx = 0; mIdx < data.members.length; mIdx++) {
        const m = data.members[mIdx];
        const smSize = 18;
        
        if (m.photo) {
          const circData = await getCircularImage(m.photo);
          if (circData) {
            doc.addImage(circData, "PNG", startX + 15, y - 9, smSize, smSize);
          }
        }
        // Frame
        doc.setDrawColor(...theme.border);
        doc.setLineWidth(0.8);
        doc.circle(startX + 15 + (smSize/2), y - 9 + (smSize/2), smSize/2, "S");
        
        doc.setTextColor(...theme.textDark);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(m.fullName, startX + 42, y);

        doc.setTextColor(...theme.textLight);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text(`${m.age} Yrs • ${m.gender.toUpperCase()} • ${m.category || 'Adult'}`, startX + 42, y + 5);
        
        // Status badge per member
        doc.setFillColor(...theme.textDark); // Use theme dark instead of pure green to match style
        doc.roundedRect(startX + ticketWidth - 50, y - 3, 30, 7, 3, 3, "F");
        doc.setTextColor(...theme.border);
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.text("VERIFIED", startX + ticketWidth - 35, y + 1.8, { align: "center" });

        // Divider
        if (mIdx < data.members.length - 1) {
            doc.setDrawColor(...theme.accent);
            doc.setLineWidth(0.2);
            doc.line(startX + 15, y + 12, startX + ticketWidth - 15, y + 12);
        }

        y += 20;
      }
    }

    // 6. QR Code Section (Individual only)
    if (!isMaster) {
      y = margin + 175; // Fixed position

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(...theme.border);
      doc.setLineWidth(0.8);

      const qrSize = 55;
      const qrX = (pageWidth - qrSize) / 2;
      doc.rect(qrX - 3, y, qrSize + 6, qrSize + 6, "FD"); // thick white border effect

      const qrId = `qr-${data._id}-member-${pageIdx - 1}`;
      const qrCanvas = document.getElementById(qrId) || document.getElementById(`qr-${data._id}`);
      if (qrCanvas) {
        const qrImage = qrCanvas.toDataURL("image/png", 1.0);
        doc.addImage(qrImage, "PNG", qrX, y + 3, qrSize, qrSize);
      }

      y += qrSize + 15;
      
      // Scan indicator motifs
      doc.setDrawColor(...theme.border);
      doc.setLineWidth(0.5);
      doc.line(qrX - 15, y - 2, qrX - 5, y - 2);
      doc.line(qrX - 10, y - 4, qrX - 5, y - 2);
      doc.line(qrX - 10, y, qrX - 5, y - 2);
      
      doc.line(qrX + qrSize + 5, y - 2, qrX + qrSize + 15, y - 2);
      doc.line(qrX + qrSize + 10, y - 4, qrX + qrSize + 5, y - 2);
      doc.line(qrX + qrSize + 10, y, qrX + qrSize + 5, y - 2);
      
      doc.setTextColor(...theme.textDark);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Scan at Entry Gate", pageWidth / 2, y, { align: "center" });
    }

    // Footer
    y = ticketHeight + margin - 12;
    doc.setTextColor(isMaster ? theme.textDark[0] : 255, isMaster ? theme.textDark[1] : 255, isMaster ? theme.textDark[2] : 255);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    if (isMaster) {
      doc.text("Keep this summary for reference", pageWidth / 2, y, { align: "center" });
    } else {
      doc.setFillColor(...theme.headerBg);
      doc.rect(startX, y - 6, ticketWidth, 18, "F");
      // Inner border
      doc.setDrawColor(...theme.border);
      doc.setLineWidth(0.3);
      doc.rect(startX + 3, y - 3, ticketWidth - 6, 12, "S");
      
      doc.setTextColor(255, 255, 255);
      doc.text("Please present this pass at the entry gate", pageWidth / 2, y + 4, { align: "center" });
    }
  };

  const download = async (data) => {
    const doc = new jsPDF();
    const theme = getTheme(data.slot?.temple?.name);
    
    // Page 1: Master Receipt
    await drawPage(doc, data, theme, null, true, 0);

    // Page 2+: Individual Passes
    if (data.members && data.members.length > 0) {
       for (let idx = 0; idx < data.members.length; idx++) {
          doc.addPage();
          await drawPage(doc, data, theme, data.members[idx], false, idx + 1);
       }
    }

    doc.save(`SevaTrack_Passes_${data.bookingId}.pdf`);
    toast.success("Temple Passes downloaded ✓");
  };

  const statusBar = (s) => s === "booked" ? "bg-emerald-400" : s === "used" ? "bg-blue-400" : "bg-red-300";
  const statusCls = (s) => s === "booked" ? "status-booked" : s === "used" ? "status-used" : "status-cancelled";

  return (
    <div className="min-h-screen bg-white bg-animated">
      <Navbar />

      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="section-container py-10">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-5">
            <ArrowLeft size={15} /> Back
          </button>
          <h1 className="font-serif text-3xl font-bold text-gray-800">My Bookings</h1>
          <p className="text-gray-400 mt-1.5 text-sm">{bookings.length} booking{bookings.length !== 1 ? "s" : ""} found</p>
        </div>
      </div>

      <div className="section-container py-10">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-gray-200 rounded-full animate-spin" style={{ borderTopColor: ACCENT }} />
          </div>
        ) : bookings.length === 0 ? (
          <div className="card p-16 text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "#fff0f2", border: "1px solid #ffadb8" }}>
              <BookOpen size={28} style={{ color: ACCENT }} />
            </div>
            <h3 className="font-serif text-xl font-bold text-gray-800 mb-2">No bookings yet</h3>
            <p className="text-gray-400 text-sm mb-6">Start your divine journey by booking a darshan slot</p>
            <button onClick={() => navigate("/temples")} className="btn-primary px-8 py-3">Book Darshan 🙏</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {bookings.map(b => (
              <div key={b._id} className="card overflow-hidden hover:shadow-md transition-all duration-300">
                {/* Status bar */}
                <div className={`h-1 w-full ${statusBar(b.status)}`} />

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-serif text-lg font-bold text-gray-800 leading-tight pr-2">{b.slot?.temple?.name}</h3>
                    <span className={statusCls(b.status)}>{b.status}</span>
                  </div>

                  <div className="space-y-2 mb-5">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar size={13} className="flex-shrink-0" style={{ color: ACCENT }} />
                      {new Date(b.slot?.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                    </div>
                    {b.slot?.startTime && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="text-xs" style={{ color: ACCENT }}>⏰</span>
                        {b.slot.startTime} – {b.slot.endTime}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
                      <Hash size={12} className="text-gray-300 flex-shrink-0" />
                      {b.bookingId}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Users size={13} className="text-gray-300 flex-shrink-0" />
                      {b.totalMembers} member{b.totalMembers > 1 ? "s" : ""}
                    </div>
                  </div>

                  {/* QR Code preview */}
                  {b.status === "booked" && (
                    <div className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-150 text-center">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 flex items-center justify-center gap-1.5">
                        <QrCode size={12} /> Scan at Entry Gate
                      </p>
                      <div className="inline-block p-2 bg-white rounded-lg border border-gray-200">
                        <QRCodeCanvas
                          id={`qr-${b._id}`}
                          value={generateQRData(b)}
                          size={100}
                          level="H"
                          includeMargin={false}
                          fgColor="#000000"
                          bgColor="#FFFFFF"
                        />
                      </div>
                      <button
                        onClick={() => setSelectedBooking(b)}
                        className="text-xs mt-2 px-3 py-1 rounded-lg transition-colors hover:bg-gray-100"
                        style={{ color: ACCENT }}
                      >
                        View Full Receipt
                      </button>
                    </div>
                  )}

                  <div className="flex gap-2.5 pt-4 border-t border-gray-100">
                    <button onClick={() => download(b)} className="btn-secondary flex-1 py-2.5 text-xs gap-1.5">
                      <Download size={13} /> Receipt
                    </button>
                    {b.status === "booked" && (
                      <button onClick={() => cancel(b._id)} className="btn-danger flex-1 py-2.5 text-xs gap-1.5">
                        <X size={13} /> Cancel
                      </button>
                    )}
                  </div>
                </div>

                {/* Hidden high-res QR canvas for PDF export */}
                <div className="hidden">
                  <QRCodeCanvas
                    id={`qr-${b._id}`}
                    value={generateQRData(b)}
                    size={1024}
                    level="M"
                    includeMargin={true}
                    fgColor="#000000"
                    bgColor="#FFFFFF"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full Receipt Modal */}
      {selectedBooking && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xl"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="relative w-full max-w-[420px] max-h-[95vh] overflow-y-auto overflow-x-hidden rounded-[2rem] bg-[#f8f9fa] shadow-2xl flex flex-col animate-fade-in"
            onClick={e => e.stopPropagation()}
            style={{
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.1) inset"
            }}
          >
            {/* Header/Temple Branding */}
            <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 pb-12 rounded-t-[2rem] overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
              
              {/* Close Button */}
              <button 
                onClick={() => setSelectedBooking(null)} 
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors"
              >
                <X size={16} />
              </button>

              <div className="flex items-center justify-between mb-4 mt-2">
                <div>
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Boarding Pass</p>
                  <h3 className="font-serif text-2xl font-bold text-white tracking-wide">{selectedBooking.slot?.temple?.name}</h3>
                </div>
                {/* Logo Placeholder */}
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
                   <BookOpen size={20} className="text-white/80" />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-medium text-white/70 px-2 py-1 bg-black/30 rounded border border-white/10">ID: {selectedBooking.bookingId}</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${
                  selectedBooking.status === 'booked' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 
                  selectedBooking.status === 'used' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 
                  'bg-red-500/20 text-red-300 border-red-500/30'
                }`}>
                  {selectedBooking.status}
                </span>
              </div>
            </div>

            {/* Ticket Cutout/Perforated Line Effect */}
            <div className="relative h-6 bg-[#f8f9fa] -mt-6 rounded-t-[2rem] z-10 flex items-center justify-between px-[-1rem]">
                {/* Circles for cutout */}
                <div className="absolute left-0 -ml-3 w-6 h-6 rounded-full bg-black/60 shadow-[inset_-3px_0_5px_rgba(0,0,0,0.1)]"></div>
                <div className="w-full border-t-2 border-dashed border-gray-300 mx-6"></div>
                <div className="absolute right-0 -mr-3 w-6 h-6 rounded-full bg-black/60 shadow-[inset_3px_0_5px_rgba(0,0,0,0.1)]"></div>
            </div>

            {/* Details Section */}
            <div className="px-6 py-2 bg-[#f8f9fa] z-10">
              
              <div className="grid grid-cols-2 gap-y-5 gap-x-4 mb-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Date</p>
                  <p className="text-sm font-bold text-gray-800">
                    {new Date(selectedBooking.slot?.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Time</p>
                  <p className="text-sm font-bold text-gray-800">{selectedBooking.slot?.startTime ? `${selectedBooking.slot.startTime} - ${selectedBooking.slot.endTime}` : 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Location</p>
                  <p className="text-sm font-semibold text-gray-700 leading-tight line-clamp-2">{selectedBooking.slot?.temple?.location}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Members</p>
                  <p className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                    <Users size={14} className="text-gray-400" /> {selectedBooking.totalMembers}
                  </p>
                </div>
              </div>

              {/* Devotees */}
              {selectedBooking.members?.length > 0 && (
                <div className="mb-6">
                   <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 border-b border-gray-200 pb-2">Devotees</p>
                   <div className="space-y-3">
                     {selectedBooking.members.map((m, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs">
                               {m.fullName.charAt(0).toUpperCase()}
                             </div>
                             <div>
                               <p className="text-sm font-bold text-gray-800">{m.fullName}</p>
                               <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{m.age}Y • {m.gender} • {m.category || "Adult"}</p>
                             </div>
                          </div>
                          {m.photo && (
                            <img src={m.photo} alt={m.fullName} className="w-10 h-10 rounded-lg object-cover border border-gray-200 shadow-sm" />
                          )}
                        </div>
                     ))}
                   </div>
                </div>
              )}
            </div>

            {/* Another Perforated Line for QR Section */}
            <div className="relative h-6 bg-[#f8f9fa] z-10 flex items-center justify-between">
                <div className="absolute left-0 -ml-3 w-6 h-6 rounded-full bg-black/60 shadow-[inset_-3px_0_5px_rgba(0,0,0,0.1)]"></div>
                <div className="w-full border-t-2 border-dashed border-gray-300 mx-6"></div>
                <div className="absolute right-0 -mr-3 w-6 h-6 rounded-full bg-black/60 shadow-[inset_3px_0_5px_rgba(0,0,0,0.1)]"></div>
            </div>

            {/* QR Code Section - The Stub */}
            <div className="bg-[#f8f9fa] p-6 pt-2 pb-8 rounded-b-[2rem] flex flex-col items-center z-10">
              
              <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 w-full flex flex-col items-center">
                 <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-4 flex items-center gap-2">
                    <QrCode size={12} /> Gate Verification
                 </p>
                 
                 {/* QR Canvas Container with Pure White Background and High Contrast */}
                 <div className="bg-white p-3 rounded-xl w-full flex justify-center">
                   <QRCodeCanvas
                      value={generateQRData(selectedBooking)}
                      size={320}
                      level="M"
                      includeMargin={true}
                      fgColor="#000000"
                      bgColor="#FFFFFF"
                      style={{ width: "100%", height: "auto", maxWidth: "320px", imageRendering: "pixelated" }}
                    />
                 </div>
                 
                 {/* Hidden QRs for multi-page individual PDF passes */}
                 <div className="hidden">
                    <QRCodeCanvas
                      id={`qr-${selectedBooking._id}-master`}
                      value={JSON.stringify({ bookingId: selectedBooking.bookingId })}
                      size={1024} level="M" includeMargin={true} fgColor="#000000" bgColor="#FFFFFF"
                    />
                    {selectedBooking.members?.map((m, idx) => (
                      <QRCodeCanvas
                        key={m._id || idx}
                        id={`qr-${selectedBooking._id}-member-${idx}`}
                        value={JSON.stringify({ bookingId: selectedBooking.bookingId, memberId: m._id || m.fullName })}
                        size={1024} level="M" includeMargin={true} fgColor="#000000" bgColor="#FFFFFF"
                      />
                    ))}
                 </div>
                 
                 <p className="text-xs text-gray-500 mt-4 text-center px-4">
                    Present this QR code at the entry gate scanner for instant verification.
                 </p>
              </div>

              <div className="w-full mt-6 flex gap-3">
                 <button 
                    onClick={() => setFullscreenQR(selectedBooking)}
                    className="flex-1 bg-white hover:bg-gray-50 text-gray-700 py-3 rounded-xl text-sm font-bold shadow-sm border border-gray-200 transition-colors flex justify-center items-center gap-2"
                  >
                    <QrCode size={16} /> Fullscreen
                  </button>
                  <button 
                    onClick={() => download(selectedBooking)}
                    className="flex-1 bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-xl text-sm font-bold shadow-md transition-colors flex justify-center items-center gap-2"
                  >
                    <Download size={16} /> Download
                  </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Fullscreen QR Modal */}
      {fullscreenQR && (
        <div 
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center p-6 bg-white animate-fade-in"
          onClick={() => setFullscreenQR(null)}
        >
          <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm mx-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-3xl font-bold mb-8 text-gray-900 tracking-tight">Scan at Gate</h2>
            <div className="p-4 bg-white border-4 border-gray-100 rounded-3xl shadow-2xl w-full aspect-square flex items-center justify-center">
              <QRCodeCanvas
                value={generateQRData(fullscreenQR)}
                size={360}
                level="M"
                includeMargin={true}
                fgColor="#000000"
                bgColor="#FFFFFF"
                style={{ width: "100%", height: "100%", imageRendering: "pixelated", background: "#FFFFFF" }}
              />
            </div>
            <div className="mt-8 text-center space-y-2">
              <p className="text-gray-500 font-medium uppercase tracking-widest text-xs">Booking ID</p>
              <p className="text-2xl font-mono font-bold text-gray-900">{fullscreenQR.bookingId}</p>
            </div>
            <p className="mt-4 text-emerald-600 font-semibold text-sm bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
              Brighten your screen for faster scanning
            </p>
          </div>
          <button 
            onClick={() => setFullscreenQR(null)} 
            className="mb-8 p-4 bg-gray-100 rounded-full text-gray-800 hover:bg-gray-200 transition-colors shadow-sm"
          >
            <X size={24} />
          </button>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
