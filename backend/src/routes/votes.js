const express = require("express");
const db = require("../db");

const router = express.Router();

// Which memes has this person already voted for? Used to restore "liked"
// state correctly when they open the gallery from a new session/device.
router.get("/mine", async (req, res) => {
  const { voterCompanyId } = req.query;
  if (!voterCompanyId) return res.status(400).json({ error: "voterCompanyId is required." });
  try {
    const result = await db.query(`SELECT submission_id FROM votes WHERE voter_company_id = $1`, [voterCompanyId]);
    res.json({ submissionIds: result.rows.map((r) => r.submission_id) });
  } catch (err) {
    console.error("[votes] Failed to load voter's votes:", err);
    res.status(500).json({ error: "Failed to load votes." });
  }
});

// Toggle: voting again with the same companyId removes the vote.
router.post("/:submissionId", async (req, res) => {
  const { submissionId } = req.params;
  const { voterCompanyId, voterEmail } = req.body || {};

  if (!voterCompanyId || !voterEmail) {
    return res.status(400).json({ error: "voterCompanyId and voterEmail are required." });
  }

  try {
    const submission = await db.query(`SELECT id FROM submissions WHERE id = $1 AND status = 'approved'`, [submissionId]);
    if (submission.rows.length === 0) {
      return res.status(404).json({ error: "Meme not found." });
    }

    const existing = await db.query(
      `SELECT id FROM votes WHERE submission_id = $1 AND voter_company_id = $2`,
      [submissionId, voterCompanyId]
    );

    if (existing.rows.length > 0) {
      await db.query(`DELETE FROM votes WHERE id = $1`, [existing.rows[0].id]);
    } else {
      await db.query(
        `INSERT INTO votes (submission_id, voter_company_id, voter_email, created_at) VALUES ($1, $2, $3, $4)`,
        [submissionId, voterCompanyId, voterEmail, Date.now()]
      );
    }

    const countResult = await db.query(`SELECT COUNT(*) AS c FROM votes WHERE submission_id = $1`, [submissionId]);
    res.json({ voteCount: Number(countResult.rows[0].c), liked: existing.rows.length === 0 });
  } catch (err) {
    console.error("[votes] Failed to toggle vote:", err);
    res.status(500).json({ error: "Failed to toggle vote." });
  }
});

module.exports = router;
