const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Point it at a free Postgres instance (Supabase, Neon, or " +
      "Render Postgres all work) — see README -> 'Hosting for free'."
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Most free hosted Postgres providers (Supabase, Neon, Render) require SSL.
  // Allow opting out for a local Postgres instance during development.
  ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: false },
});

async function init() {
  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  await pool.query(schema);
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  init,
};
