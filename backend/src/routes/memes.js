const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await db.query(
      `SELECT s.id, s.title, s.submitter_name, s.submitted_at,
              COUNT(v.id) AS vote_count
       FROM submissions s
       LEFT JOIN votes v ON v.submission_id = s.id
       WHERE s.status = 'approved'
       GROUP BY s.id
       ORDER BY s.submitted_at DESC`
    );

    res.json(
      result.rows.map((r) => ({
        id: r.id,
        title: r.title,
        submitterName: r.submitter_name,
        imageUrl: `/api/images/${r.id}`,
        submittedAt: Number(r.submitted_at),
        voteCount: Number(r.vote_count),
      }))
    );
  } catch (err) {
    console.error("[memes] Failed to list memes:", err);
    res.status(500).json({ error: "Failed to load memes." });
  }
});

module.exports = router;
