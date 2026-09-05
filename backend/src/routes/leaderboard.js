const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const topMemesResult = await db.query(
      `SELECT s.id, s.title, s.submitter_name, COUNT(v.id) AS vote_count
       FROM submissions s
       LEFT JOIN votes v ON v.submission_id = s.id
       WHERE s.status = 'approved'
       GROUP BY s.id
       ORDER BY vote_count DESC, s.submitted_at ASC
       LIMIT 10`
    );

    const topSubmittersResult = await db.query(
      `SELECT submitter_name, COUNT(*) AS submission_count
       FROM submissions
       WHERE status = 'approved'
       GROUP BY submitter_name
       ORDER BY submission_count DESC
       LIMIT 10`
    );

    res.json({
      topMemes: topMemesResult.rows.map((r) => ({
        id: r.id,
        title: r.title,
        submitterName: r.submitter_name,
        imageUrl: `/api/images/${r.id}`,
        voteCount: Number(r.vote_count),
      })),
      topSubmitters: topSubmittersResult.rows.map((r) => ({
        submitterName: r.submitter_name,
        submissionCount: Number(r.submission_count),
      })),
    });
  } catch (err) {
    console.error("[leaderboard] Failed to compute leaderboard:", err);
    res.status(500).json({ error: "Failed to load leaderboard." });
  }
});

module.exports = router;
