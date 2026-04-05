const puppeteer = require("puppeteer");
const Booking = require("../models/Booking");

exports.downloadReceipt = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: "slot",
        populate: { path: "temple" },
      })
      .populate("user");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // 🔒 Authorization Check
    if (
      booking.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // 🔥 Members Table
    const membersHTML = booking.members
      .map(
        (m) => `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #eee;">
            ${m.fullName}
          </td>
          <td style="padding:8px;border-bottom:1px solid #eee;">
            ${m.age}
          </td>
          <td style="padding:8px;border-bottom:1px solid #eee;">
            ${m.gender}
          </td>
          <td style="padding:8px;border-bottom:1px solid #eee;">
            <span style="
              padding:4px 10px;
              border-radius:20px;
              font-size:12px;
              color:white;
              background:${m.category === "child" ? "#f77f00" : "#d62828"};
            ">
              ${m.category}
            </span>
          </td>
        </tr>
        `
      )
      .join("");

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial; padding:40px; }
        .card {
          max-width:800px;
          margin:auto;
          padding:30px;
          border-radius:12px;
          border:1px solid #ddd;
        }
        h1 { color:#d62828; text-align:center; }
        table { width:100%; border-collapse:collapse; margin-top:20px; }
        td, th { padding:10px; border-bottom:1px solid #eee; text-align:left; }
        .label { font-weight:bold; width:35%; }
        .qr { text-align:center; margin-top:30px; }
        .badge {
          display:inline-block;
          padding:6px 12px;
          background:#28a745;
          color:white;
          border-radius:20px;
          font-size:12px;
        }
        .instructions {
          margin-top:30px;
          background:#fff3cd;
          padding:15px;
          border-radius:8px;
          font-size:14px;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>SevaTrack Darshan Receipt</h1>

        <table>
          <tr><td class="label">Booking ID</td><td>${booking.bookingId}</td></tr>
          <tr><td class="label">Temple</td><td>${booking.slot?.temple?.name || "N/A"}</td></tr>
          <tr><td class="label">Location</td><td>${booking.slot?.temple?.location || "N/A"}</td></tr>
          <tr><td class="label">Darshan Date</td><td>${new Date(booking.slot?.date).toDateString()}</td></tr>
          <tr><td class="label">Slot Time</td><td>${booking.slot?.startTime} - ${booking.slot?.endTime}</td></tr>
          <tr><td class="label">Total Members</td><td>${booking.totalMembers}</td></tr>
          <tr><td class="label">Status</td><td><span class="badge">${booking.status}</span></td></tr>
        </table>

        <h3>Devotee Details</h3>
        <table>
          <tr>
            <th>Name</th>
            <th>Age</th>
            <th>Gender</th>
            <th>Category</th>
          </tr>
          ${membersHTML}
        </table>

        <div class="qr">
          <h3>Scan QR at Entry</h3>
          <img src="${booking.qrCode}" width="150" />
        </div>

        <div class="instructions">
          <strong>Instructions:</strong>
          <ul>
            <li>Please arrive 15 minutes before slot time.</li>
            <li>Carry valid ID proof.</li>
            <li>Show QR code at entry gate.</li>
          </ul>
        </div>
      </div>
    </body>
    </html>
    `;

    // 🔥 FIXED Puppeteer Launch (Render Compatible)
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=SevaTrack_${booking.bookingId}.pdf`,
    });

    res.send(pdfBuffer);

  } catch (error) {
    console.error("❌ Receipt Error:", error);
    res.status(500).json({ error: "Receipt generation failed" });
  }
};