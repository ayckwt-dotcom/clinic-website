// api/submit-request.js
import nodemailer from "nodemailer";

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  FROM_EMAIL, // e.g., "no-reply@6ayyeboon.com"
  TO_EMAIL    // clinic inbox (where you receive requests)
} = process.env;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { full_name, mobile } = req.body || {};
    if (!full_name?.trim() || !mobile?.trim()) {
      return res.status(400).json({ msg: "Missing fields" });
    }
    if (full_name.length > 120 || mobile.length > 30) {
      return res.status(400).json({ msg: "Invalid input" });
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT || 587),
      secure: Number(SMTP_PORT) === 465, // 465 = SSL, 587 = STARTTLS
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    const subject = "New Appointment Request";
    const html = `
      <h2>New Request</h2>
      <p><b>Name:</b> ${full_name}</p>
      <p><b>Mobile:</b> ${mobile}</p>
      <hr/>
      <p>Sent from clinic website.</p>
    `;

    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      subject,
      html
    });

    res.status(200).json({ ok: true, id: info.messageId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to send" });
  }
}
