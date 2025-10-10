// api/contact.js (ESM because your package.json has "type":"module")
import nodemailer from "nodemailer";

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL, TO_EMAIL } = process.env;

// Fallback JSON parser (Vercel Node functions don't always parse req.body)
async function readJson(req) {
  if (req.body) return req.body;
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString("utf8");
  try { return JSON.parse(raw || "{}"); } catch { return {}; }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { name, phone, email, message, company } = await readJson(req);

    // bot honeypot: silently succeed
    if (company) return res.status(200).json({ ok: true });

    if (!name?.trim() || !phone?.trim() || !message?.trim()) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT || 587),
      secure: Number(SMTP_PORT) === 465, // 465 SSL, 587 STARTTLS
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    await transporter.sendMail({
      from: FROM_EMAIL,             // for Gmail SMTP this should be your Gmail address
      to: TO_EMAIL,                 // same inbox as bookings
      subject: "New Website Message",
      replyTo: email || undefined,  // lets reception reply directly to the sender
      html: `
        <h2>New Website Message</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Email:</b> ${email || "-"}</p>
        <p><b>Message:</b><br/>${(message || "").replace(/\n/g,"<br/>")}</p>
      `,
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to send" });
  }
}
