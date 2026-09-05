const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/:id", async (req, res) => {
  try {
    const result = await db.query(
      `SELECT image_data, image_mime FROM submissions WHERE id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).end();
    const { image_data, image_mime } = result.rows[0];
    res.set("Content-Type", image_mime);
    res.set("Cache-Control", "public, max-age=31536000, immutable");
    res.send(Buffer.from(image_data, "base64"));
  } catch (err) {
    console.error("[images] Failed to serve image:", err);
    res.status(500).end();
  }
});

module.exports = router;
