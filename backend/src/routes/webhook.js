const express = require("express");
const crypto = require("crypto");
const db = require("../db");
const { notifyNewSubmission } = require("../services/notify");

const router = express.Router();

function guessMime(filename) {
  const ext = (filename || "").split(".").pop().toLowerCase();
  return { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", gif: "image/gif", webp: "image/webp" }[ext] || "image/jpeg";
}

// Power Automate calls this once per new Microsoft Forms response.
// See README.md -> "Connecting Microsoft Forms" for the exact flow setup.
router.post("/ms-forms", async (req, res) => {
  const secret = req.query.secret || req.header("x-webhook-secret");
  if (!process.env.WEBHOOK_SECRET || secret !== process.env.WEBHOOK_SECRET) {
    return res.status(401).json({ error: "Invalid or missing webhook secret." });
  }

  const { title, submitterName, submitterEmail, imageBase64, imageFilename } = req.body || {};

  if (!title || !submitterName || !submitterEmail || !imageBase64) {
    return res.status(400).json({
      error: "Missing required fields. Expected: title, submitterName, submitterEmail, imageBase64.",
    });
  }

  try {
    const id = crypto.randomUUID();
    const base64Data = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;
    const mime = guessMime(imageFilename);
    const now = Date.now();

    await db.query(
      `INSERT INTO submissions (id, title, submitter_name, submitter_email, image_data, image_mime, status, source, submitted_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending', 'ms-forms', $7)`,
      [id, title, submitterName, submitterEmail, base64Data, mime, now]
    );

    await db.query(
      `INSERT INTO notifications (submission_id, created_at, emailed, seen) VALUES ($1, $2, false, false)`,
      [id, now]
    );

    const submission = { id, title, submitter_name: submitterName, submitter_email: submitterEmail };
    notifyNewSubmission(submission).then((result) => {
      if (result.emailed) {
        db.query(`UPDATE notifications SET emailed = true WHERE submission_id = $1`, [id]).catch(() => {});
      }
    });

    res.status(201).json({ ok: true, id });
  } catch (err) {
    console.error("[webhook] Failed to process submission:", err);
    res.status(500).json({ error: "Failed to process submission." });
  }
});

module.exports = router;
