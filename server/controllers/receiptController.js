const chromium = require("chrome-aws-lambda");
const puppeteer = require("puppeteer-core");
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

    // 🧪 DEBUG FIRST (IMPORTANT)
    const execPath = await chromium.executablePath;
    console.log("Executable Path:", execPath);

    // ❌ Agar chromium nahi mila → crash avoid karo
    if (!execPath) {
      return res.status(500).json({
        error: "Chromium not available on server",
      });
    }

    // 🔥 Members Table
    const membersHTML = booking.members
      .map(
        (m) => `
        <tr>
          <td>${m.fullName}</td>
          <td>${m.age}</td>
          <td>${m.gender}</td>
          <td>${m.category}</td>
        </tr>
      `
      )
      .join("");

    const html = `
    <html>
    <body>
      <h2>SevaTrack Receipt</h2>
      <p><b>Booking ID:</b> ${booking.bookingId}</p>
      <p><b>Temple:</b> ${booking.slot?.temple?.name || "N/A"}</p>
      <p><b>Date:</b> ${new Date(booking.slot?.date).toDateString()}</p>

      <h3>Members</h3>
      <table border="1" cellspacing="0" cellpadding="5">
        <tr>
          <th>Name</th>
          <th>Age</th>
          <th>Gender</th>
          <th>Category</th>
        </tr>
        ${membersHTML}
      </table>
    </body>
    </html>
    `;

    // 🚀 Launch browser
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: execPath,
      headless: true,
    });

    const page = await browser.newPage();
    await page.setContent(html);

    const pdfBuffer = await page.pdf({ format: "A4" });

    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=receipt.pdf`,
    });

    res.send(pdfBuffer);

  } catch (error) {
    console.error("❌ Receipt Error:", error);
    res.status(500).json({ error: "Receipt generation failed" });
  }
};