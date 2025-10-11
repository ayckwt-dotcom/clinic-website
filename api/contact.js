// api/contact.js
import nodemailer from "nodemailer";

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  FROM_EMAIL,
  TO_EMAIL,
} = process.env;

// util: does req.body actually have keys?
const hasKeys = (v) =>
  v && typeof v === "object" && !Array.isArray(v) && Object.keys(v).length > 0;

// Read body as JSON or URL-encoded, regardless of runtime
async function readBody(req) {
  // If Vercel/Framework already parsed AND it's non-empty, use it
  if (hasKeys(req.body)) return req.body;

  // Otherwise, read the raw stream
  const chunks = [];
  for await (const c of req) chunks.push(typeof c === "string" ? Buffer.from(c) : c);
  const raw = Buffer.concat(chunks).toString("utf8");
  const ct = (req.headers["content-type"] || "").toLowerCase();

  // Try JSON
  try {
    if (ct.includes("application/json") || raw.trim().startsWith("{")) {
      return JSON.parse(raw || "{}");
    }
  } catch {
    /* fall through */
  }

  // Fallback: x-www-form-urlencoded
  if (ct.includes("application/x-www-form-urlencoded")) {
    const out = {};
    for (const [k, v] of new URLSearchParams(raw)) out[k] = v;
    return out;
  }

  return {};
}

// basic HTML escape
function esc(s = "") {
  return String(s).replace(/[&<>"']/g, (ch) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch])
  );
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const body = await readBody(req);
    console.log("CONTACT payload:", body); // check Vercel → Logs if needed

    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").trim();
    const email = String(body.email || "").trim();
    const message = String(body.message || "").trim();
    const company = String(body.company || "").trim(); // honeypot

    // bot honeypot: silently succeed
    if (company) return res.status(200).json({ ok: true });

    if (!name || !phone || !message) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT || 587),
      secure: Number(SMTP_PORT) === 465, // 465 SSL, 587 STARTTLS
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    await transporter.sendMail({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      subject: "Contact Us (Inquiry)",
      replyTo: email || undefined,
      html: `
        <h2>New Website Message</h2>
        <p><b>Name:</b> ${esc(name)}</p>
        <p><b>Phone:</b> ${esc(phone)}</p>
        <p><b>Email:</b> ${email ? esc(email) : "-"}</p>
        <p><b>Message:</b><br/>${esc(message).replace(/\n/g, "<br/>")}</p>
      `,
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("CONTACT error:", err);
    res.status(500).json({ msg: "Failed to send" });
  }
}
