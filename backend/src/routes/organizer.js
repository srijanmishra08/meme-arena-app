const express = require("express");
const crypto = require("crypto");
const multer = require("multer");
const db = require("../db");
const organizerAuth = require("../middleware/organizerAuth");

const router = express.Router();

// Memory storage — we convert straight to base64 and store in Postgres,
// no local disk involved (see README -> "Hosting for free").
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
});

router.use(organizerAuth);

// List submissions by status (defaults to pending — the moderation queue)
router.get("/submissions", async (req, res) => {
  const status = req.query.status || "pending";
  const clause = status === "all" ? "1=1" : "s.status = $1";
  const params = status === "all" ? [] : [status];

  try {
    const result = await db.query(
      `SELECT s.id, s.title, s.submitter_name, s.submitter_email, s.status, s.source,
              s.submitted_at, COUNT(v.id) AS vote_count
       FROM submissions s
       LEFT JOIN votes v ON v.submission_id = s.id
       WHERE ${clause}
       GROUP BY s.id
       ORDER BY s.submitted_at DESC`,
      params
    );

    res.json(
      result.rows.map((r) => ({
        id: r.id,
        title: r.title,
        submitterName: r.submitter_name,
        submitterEmail: r.submitter_email,
        imageUrl: `/api/images/${r.id}`,
        status: r.status,
        source: r.source,
        submittedAt: Number(r.submitted_at),
        voteCount: Number(r.vote_count),
      }))
    );
  } catch (err) {
    console.error("[organizer] Failed to list submissions:", err);
    res.status(500).json({ error: "Failed to load submissions." });
  }
});

router.post("/submissions/:id/approve", async (req, res) => {
  try {
    const result = await db.query(
      `UPDATE submissions SET status = 'approved', reviewed_at = $1 WHERE id = $2`,
      [Date.now(), req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: "Not found." });
    res.json({ ok: true });
  } catch (err) {
    console.error("[organizer] Failed to approve:", err);
    res.status(500).json({ error: "Failed to approve submission." });
  }
});

router.post("/submissions/:id/reject", async (req, res) => {
  try {
    const result = await db.query(
      `UPDATE submissions SET status = 'rejected', reviewed_at = $1 WHERE id = $2`,
      [Date.now(), req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: "Not found." });
    res.json({ ok: true });
  } catch (err) {
    console.error("[organizer] Failed to reject:", err);
    res.status(500).json({ error: "Failed to reject submission." });
  }
});

// Manual fallback — add a submission directly from the admin dashboard
// (useful for memes shared in person, Slack, WhatsApp, etc. instead of the Form)
router.post("/submissions", upload.single("image"), async (req, res) => {
  const { title, submitterName, submitterEmail } = req.body || {};
  if (!title || !submitterName || !submitterEmail || !req.file) {
    return res.status(400).json({ error: "title, submitterName, submitterEmail, and image are required." });
  }
  try {
    const id = crypto.randomUUID();
    const now = Date.now();
    const base64 = req.file.buffer.toString("base64");
    await db.query(
      `INSERT INTO submissions (id, title, submitter_name, submitter_email, image_data, image_mime, status, source, submitted_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending', 'manual', $7)`,
      [id, title, submitterName, submitterEmail, base64, req.file.mimetype, now]
    );
    res.status(201).json({ ok: true, id });
  } catch (err) {
    console.error("[organizer] Failed to add manual submission:", err);
    res.status(500).json({ error: "Failed to add submission." });
  }
});

router.get("/notifications/unseen-count", async (req, res) => {
  try {
    const result = await db.query(`SELECT COUNT(*) AS c FROM notifications WHERE seen = false`);
    res.json({ unseenCount: Number(result.rows[0].c) });
  } catch (err) {
    console.error("[organizer] Failed to get unseen count:", err);
    res.status(500).json({ error: "Failed to load notifications." });
  }
});

router.post("/notifications/mark-seen", async (req, res) => {
  try {
    await db.query(`UPDATE notifications SET seen = true WHERE seen = false`);
    res.json({ ok: true });
  } catch (err) {
    console.error("[organizer] Failed to mark notifications seen:", err);
    res.status(500).json({ error: "Failed to update notifications." });
  }
});

module.exports = router;
