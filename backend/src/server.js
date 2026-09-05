require("dotenv").config();

const db = require("./db");
const app = require("./app");

const PORT = process.env.PORT || 4000;

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
