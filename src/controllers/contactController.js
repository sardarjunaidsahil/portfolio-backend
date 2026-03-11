const nodemailer = require("nodemailer");
const { pool } = require("../db");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

async function sendContact(req, res) {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message)
    return res.status(400).json({ success: false, message: "All fields are required." });

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ success: false, message: "Invalid email." });

  const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.ip;
  const time = new Date().toLocaleString("en-PK", { timeZone: "Asia/Karachi" });

  try {
    await pool.query(
      `INSERT INTO contacts (name, email, subject, message, ip) VALUES ($1,$2,$3,$4,$5)`,
      [name, email, subject, message, ip]
    );

    // ── Email TO YOU (notification) ──────────────────
    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.MAIL_USER}>`,
      to: process.env.MAIL_TO,
      subject: `📬 ${name} sent you a message — "${subject}"`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#08080C;font-family:'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#08080C;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#63FFB4,#4dd9a0);padding:32px 36px;border-radius:12px 12px 0 0;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <p style="margin:0 0 4px 0;font-size:12px;color:#08080C;font-weight:600;letter-spacing:2px;text-transform:uppercase;">Portfolio Contact Form</p>
                  <h1 style="margin:0;font-size:26px;color:#08080C;font-weight:800;">New Message! 📬</h1>
                </td>
                <td align="right">
                  <div style="width:52px;height:52px;background:rgba(8,8,12,0.15);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;text-align:center;line-height:52px;">✉</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Sender Info -->
        <tr>
          <td style="background:#0D0D16;padding:28px 36px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#13131f;border-radius:10px;overflow:hidden;border:1px solid rgba(99,255,180,0.1);">
              <tr>
                <td style="padding:20px 24px;">
                  <p style="margin:0 0 16px 0;font-size:11px;color:#63FFB4;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Sender Details</p>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
                        <span style="font-size:11px;color:#4a5568;text-transform:uppercase;letter-spacing:1px;">Name</span><br/>
                        <span style="font-size:16px;color:#fff;font-weight:700;">${name}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
                        <span style="font-size:11px;color:#4a5568;text-transform:uppercase;letter-spacing:1px;">Email</span><br/>
                        <a href="mailto:${email}" style="font-size:15px;color:#63FFB4;text-decoration:none;font-weight:600;">${email}</a>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
                        <span style="font-size:11px;color:#4a5568;text-transform:uppercase;letter-spacing:1px;">Subject</span><br/>
                        <span style="font-size:15px;color:#fff;font-weight:600;">${subject}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0;">
                        <span style="font-size:11px;color:#4a5568;text-transform:uppercase;letter-spacing:1px;">Received</span><br/>
                        <span style="font-size:13px;color:#8892a4;">${time} (PKT)</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Message -->
        <tr>
          <td style="background:#0D0D16;padding:20px 36px;">
            <p style="margin:0 0 10px 0;font-size:11px;color:#63FFB4;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Message</p>
            <div style="background:#13131f;border-left:3px solid #63FFB4;border-radius:0 8px 8px 0;padding:20px 24px;">
              <p style="margin:0;font-size:15px;color:#c9d1d9;line-height:1.8;">${message.replace(/\n/g, "<br/>")}</p>
            </div>
          </td>
        </tr>

        <!-- Reply Button -->
        <tr>
          <td style="background:#0D0D16;padding:20px 36px 32px;">
            <a href="mailto:${email}?subject=Re: ${subject}" style="display:inline-block;background:#63FFB4;color:#08080C;font-weight:700;font-size:14px;padding:14px 32px;border-radius:6px;text-decoration:none;letter-spacing:0.5px;">
              Reply to ${name} →
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#08080C;padding:20px 36px;border-radius:0 0 12px 12px;border-top:1px solid rgba(99,255,180,0.08);">
            <p style="margin:0;font-size:12px;color:#4a5568;text-align:center;">
              Sent via <strong style="color:#63FFB4;">junaid-portfolio</strong> contact form · ${time}
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
      `,
    });

    // ── Auto-reply TO SENDER ─────────────────────────
    await transporter.sendMail({
      from: `"Junaid Sahil" <${process.env.MAIL_USER}>`,
      to: email,
      subject: `Got your message, ${name}! I'll reply soon 👋`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#08080C;font-family:'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#08080C;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#63FFB4,#4dd9a0);padding:32px 36px;border-radius:12px 12px 0 0;">
            <h1 style="margin:0 0 6px 0;font-size:26px;color:#08080C;font-weight:800;">Hey ${name}! 👋</h1>
            <p style="margin:0;font-size:14px;color:rgba(8,8,12,0.7);font-weight:500;">Thanks for reaching out.</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#0D0D16;padding:32px 36px;">
            <p style="margin:0 0 16px 0;font-size:15px;color:#c9d1d9;line-height:1.8;">
              I've received your message and will get back to you within <strong style="color:#fff;">24 hours</strong>.
            </p>

            <!-- Message recap -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#13131f;border-radius:10px;border:1px solid rgba(99,255,180,0.1);margin:20px 0;">
              <tr>
                <td style="padding:20px 24px;">
                  <p style="margin:0 0 12px 0;font-size:11px;color:#63FFB4;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Your Message</p>
                  <p style="margin:0 0 8px 0;font-size:13px;color:#4a5568;">Subject: <span style="color:#8892a4;">${subject}</span></p>
                  <div style="border-left:3px solid rgba(99,255,180,0.3);padding-left:16px;margin-top:12px;">
                    <p style="margin:0;font-size:14px;color:#8892a4;line-height:1.7;">${message.replace(/\n/g, "<br/>")}</p>
                  </div>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 8px 0;font-size:15px;color:#c9d1d9;line-height:1.8;">
              In the meantime, feel free to check out my work:
            </p>
            <table cellpadding="0" cellspacing="0" style="margin-top:8px;">
              <tr>
                <td style="padding-right:12px;">
                  <a href="https://mauve-store.vercel.app" style="display:inline-block;background:rgba(99,255,180,0.08);border:1px solid rgba(99,255,180,0.25);color:#63FFB4;font-size:13px;font-weight:600;padding:10px 20px;border-radius:6px;text-decoration:none;">MAUVE Store ↗</a>
                </td>
                <td>
                  <a href="https://github.com/sardarjunaidsahil" style="display:inline-block;background:rgba(99,255,180,0.08);border:1px solid rgba(99,255,180,0.25);color:#63FFB4;font-size:13px;font-weight:600;padding:10px 20px;border-radius:6px;text-decoration:none;">GitHub ↗</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Signature -->
        <tr>
          <td style="background:#0D0D16;padding:24px 36px;border-top:1px solid rgba(99,255,180,0.08);">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-right:16px;">
                  <div style="width:44px;height:44px;background:linear-gradient(135deg,#63FFB4,#4dd9a0);border-radius:50%;text-align:center;line-height:44px;font-size:16px;font-weight:800;color:#08080C;">JS</div>
                </td>
                <td>
                  <p style="margin:0;font-size:15px;color:#fff;font-weight:700;">Junaid Sahil</p>
                  <p style="margin:2px 0 0;font-size:12px;color:#63FFB4;">Full Stack Developer · Lahore, Pakistan</p>
                  <p style="margin:2px 0 0;font-size:12px;color:#4a5568;">sardarjunaidsahil@gmail.com</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#08080C;padding:16px 36px;border-radius:0 0 12px 12px;">
            <p style="margin:0;font-size:11px;color:#4a5568;text-align:center;">
              This is an automated reply from Junaid Sahil's portfolio contact form.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
      `,
    });

    return res.status(200).json({ success: true, message: "Message sent!" });

  } catch (err) {
    console.error("Contact error:", err.message);
    return res.status(500).json({ success: false, message: "Failed to send. Try again." });
  }
}

async function getMessages(req, res) {
  try {
    const { rows } = await pool.query(`SELECT * FROM contacts ORDER BY created_at DESC LIMIT 50`);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { sendContact, getMessages };