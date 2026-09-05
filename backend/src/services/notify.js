const nodemailer = require("nodemailer");

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  FROM_EMAIL,
  ORGANIZER_EMAILS, // comma-separated
  PUBLIC_APP_URL,
} = process.env;

let transporter = null;
if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
} else {
  console.warn(
    "[notify] SMTP env vars not set — email notifications are disabled. " +
      "New submissions will still be logged to the console and to the organizer dashboard."
  );
}

async function notifyNewSubmission(submission) {
  const reviewUrl = PUBLIC_APP_URL
    ? `${PUBLIC_APP_URL.replace(/\/$/, "")}/organizer`
    : "(set PUBLIC_APP_URL in .env to include a direct link)";

  console.log(
    `[notify] New meme submitted: "${submission.title}" by ${submission.submitter_name} (${submission.submitter_email})`
  );

  if (!transporter || !ORGANIZER_EMAILS) return { emailed: false };

  const recipients = ORGANIZER_EMAILS.split(",").map((s) => s.trim()).filter(Boolean);
  if (recipients.length === 0) return { emailed: false };

  try {
    await transporter.sendMail({
      from: FROM_EMAIL || SMTP_USER,
      to: recipients.join(","),
      subject: `New meme submitted: "${submission.title}"`,
      html: `
        <p>A new meme just came in for the contest.</p>
        <ul>
          <li><strong>Title:</strong> ${escapeHtml(submission.title)}</li>
          <li><strong>Submitted by:</strong> ${escapeHtml(submission.submitter_name)} (${escapeHtml(submission.submitter_email)})</li>
        </ul>
        <p>Review and approve it here: <a href="${reviewUrl}">${reviewUrl}</a></p>
      `,
    });
    return { emailed: true };
  } catch (err) {
    console.error("[notify] Failed to send email:", err.message);
    return { emailed: false, error: err.message };
  }
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

module.exports = { notifyNewSubmission };
