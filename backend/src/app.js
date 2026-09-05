const express = require("express");
const cors = require("cors");

const memesRoute = require("./routes/memes");
const votesRoute = require("./routes/votes");
const leaderboardRoute = require("./routes/leaderboard");
const webhookRoute = require("./routes/webhook");
const organizerRoute = require("./routes/organizer");
const imagesRoute = require("./routes/images");

const app = express();

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || "*" }));
app.use(express.json({ limit: "10mb" })); // base64 images from Power Automate can be sizeable

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/memes", memesRoute);
app.use("/api/votes", votesRoute);
app.use("/api/leaderboard", leaderboardRoute);
app.use("/api/webhook", webhookRoute);
app.use("/api/organizer", organizerRoute);
app.use("/api/images", imagesRoute);

module.exports = app;
