// Lightweight shared-passcode gate for organizer-only endpoints.
// This is intentionally simple (matches the rest of the app's "basic auth"
// approach) — it is NOT secure against a determined attacker. Don't put
// anything more sensitive than contest moderation behind it.

function organizerAuth(req, res, next) {
  const passcode = req.header("x-organizer-passcode");
  if (!process.env.ORGANIZER_PASSCODE) {
    return res.status(500).json({ error: "ORGANIZER_PASSCODE is not configured on the server." });
  }
  if (!passcode || passcode !== process.env.ORGANIZER_PASSCODE) {
    return res.status(401).json({ error: "Invalid or missing organizer passcode." });
  }
  next();
}

module.exports = organizerAuth;
