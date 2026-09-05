require("dotenv").config();
const express = require("express");
const cors = require("cors");

const db = require("./db");
const memesRoute = require("./routes/memes");
const votesRoute = require("./routes/votes");
const leaderboardRoute = require("./routes/leaderboard");
const webhookRoute = require("./routes/webhook");
const organizerRoute = require("./routes/organizer");
const imagesRoute = require("./routes/images");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || "*" }));
app.use(express.json({ limit: "10mb" })); // base64 images from Power Automate can be sizeable

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/memes", memesRoute);
app.use("/api/votes", votesRoute);
app.use("/api/leaderboard", leaderboardRoute);
app.use("/api/webhook", webhookRoute);
app.use("/api/organizer", organizerRoute);
app.use("/api/images", imagesRoute);

db.init()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Meme Arena backend running on http://localhost:${PORT}`);
      if (!process.env.WEBHOOK_SECRET) {
        console.warn("[startup] WEBHOOK_SECRET is not set — the Microsoft Forms webhook will reject all requests.");
      }
      if (!process.env.ORGANIZER_PASSCODE) {
        console.warn("[startup] ORGANIZER_PASSCODE is not set — the admin dashboard will be inaccessible.");
      }
    });
  })
  .catch((err) => {
    console.error("Failed to initialize the database. Check DATABASE_URL in your .env file.", err);
    process.exit(1);
  });

