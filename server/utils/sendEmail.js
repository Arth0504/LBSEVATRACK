const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"SevaTrack 🙏" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html: text, // send html for better look
    });

    console.log("Email sent successfully ✅");
  } catch (error) {
    console.error("Email error ❌", error);
  }
};

module.exports = sendEmail;