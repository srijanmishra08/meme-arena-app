-- Meme Arena database schema (PostgreSQL)
-- Images are stored as base64 text directly in the database (not on local
-- disk) so the app works correctly on free hosts whose filesystem does not
-- persist between restarts (see README -> "Hosting for free").

CREATE TABLE IF NOT EXISTS submissions (
  id              TEXT PRIMARY KEY,
  title           TEXT NOT NULL,
  submitter_name  TEXT NOT NULL,
  submitter_email TEXT NOT NULL,
  image_data      TEXT NOT NULL,             -- base64-encoded image
  image_mime      TEXT NOT NULL DEFAULT 'image/jpeg',
  status          TEXT NOT NULL DEFAULT 'pending',   -- pending | approved | rejected
  source          TEXT NOT NULL DEFAULT 'ms-forms',  -- ms-forms | manual
  submitted_at    BIGINT NOT NULL,
  reviewed_at     BIGINT
);

CREATE TABLE IF NOT EXISTS votes (
  id                SERIAL PRIMARY KEY,
  submission_id     TEXT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  voter_company_id  TEXT NOT NULL,
  voter_email       TEXT NOT NULL,
  created_at        BIGINT NOT NULL,
  UNIQUE(submission_id, voter_company_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id             SERIAL PRIMARY KEY,
  submission_id  TEXT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  created_at     BIGINT NOT NULL,
  emailed        BOOLEAN NOT NULL DEFAULT FALSE,
  seen           BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_votes_submission ON votes(submission_id);
