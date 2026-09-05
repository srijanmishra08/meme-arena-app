# Meme Arena

A temporary, self-hostable web app for an office meme contest: people vote on
memes submitted through a **Microsoft Form**, an **admin approves each one**
before it goes public, and there's a live leaderboard.

- **Frontend:** React + Vite (plain CSS, styled with your Schneider Electric
  brand tokens — Poppins, Life/Dark/Electric Green, the oval motif)
- **Backend:** Node.js + Express
- **Database:** PostgreSQL — images are stored directly in the database as
  base64, not on local disk (this matters for free hosting — see part 3)
- **Submissions:** come in via **Microsoft Forms → Power Automate → a webhook
  on this backend**
- **Notifications:** admins get an email the moment a new meme comes in, plus
  a live unseen-count badge on the admin dashboard

No categories, no login/password system — just a lightweight "Company ID +
email" identity check to keep voting fair.

---

## 1. Running it in VS Code

You need Node.js 18+ installed, and a Postgres database to point it at (see
below — you do **not** need Postgres installed on your machine; a free
Supabase project works fine for local dev too).

### Step 1 — Get a database connection string

Fastest option: create a free project at [supabase.com](https://supabase.com)
(takes 2 minutes, no credit card). Once created, go to
**Project Settings → Database → Connection string → URI** and copy it. It
looks like:

```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxx.supabase.co:5432/postgres
```

(Alternative: [neon.tech](https://neon.tech) works the same way. Or, if you
have Postgres installed locally already, any local connection string works
too — just set `DATABASE_SSL=false` in that case.)

### Step 2 — Backend

Open a terminal in VS Code (`` Ctrl+` ``):

```bash
cd backend
npm install
cp .env.example .env
```

Open the new `.env` file and fill in:
- `DATABASE_URL` → the connection string from Step 1
- `WEBHOOK_SECRET` → make up any long random string
- `ORGANIZER_PASSCODE` → the passcode you (the admin) will use to log into
  the admin dashboard

Then start it:

```bash
npm run dev
```

You should see `Meme Arena backend running on http://localhost:4000`. The
first run automatically creates all the database tables.

### Step 3 — Frontend

Open a **second** terminal (don't close the first one — both need to keep
running):

```bash
cd frontend
npm install
npm run dev
```

Open the printed URL (usually `http://localhost:5173`) in your browser.
Enter any company ID + email to see the voter view. Go to
`http://localhost:5173/organizer` and enter your `ORGANIZER_PASSCODE` to see
the admin dashboard.

### Try it without Microsoft Forms yet

```bash
curl -X POST "http://localhost:4000/api/webhook/ms-forms?secret=YOUR_WEBHOOK_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test meme",
    "submitterName": "Jane Doe",
    "submitterEmail": "jane@company.com",
    "imageBase64": "'"$(base64 -w0 some-image.jpg)"'",
    "imageFilename": "some-image.jpg"
  }'
```

Then go approve it at `/organizer` and watch it appear in the gallery.

---

## 2. The admin approval feature

This is already built in — you don't need to add anything. Here's exactly
how it works:

```
Someone submits a meme via the Microsoft Form
        │
        ▼
It's saved with status = "pending" — NOT visible on the public site yet
        │
        ▼
You get an email (if SMTP is configured) + it shows up on your
admin dashboard's "New" badge
        │
        ▼
You open yoursite.com/organizer, enter your passcode, review it
        │
        ├── Approve → now visible in the public gallery, votable
        └── Reject  → stays hidden permanently
```

**To use it:** go to `/organizer` on your deployed site (or
`localhost:5173/organizer` locally), enter the `ORGANIZER_PASSCODE` you set
in `.env`. You'll see tabs for **Pending / Approved / Rejected / All**.
Pending is where new submissions land — each one shows the image, title,
submitter, and Approve/Reject buttons.

**On notifications:** right now you get notified two ways:
1. **Email** — if you fill in the `SMTP_*` variables in `.env` (see the
   comments in `.env.example` — works with an Office 365 mailbox, Gmail app
   password, or any SMTP provider).
2. **Dashboard badge** — the admin dashboard polls every 15 seconds and shows
   an unseen-submission count regardless of whether email is configured, so
   this works even with zero setup.

If you'd like a third channel — e.g. a ping straight into a Teams channel —
the cleanest way is to add a **"Post message in a channel"** step to your
Power Automate flow (see below), right next to the step that calls this
backend. That way you get a native Teams notification with no extra code.

**One naming note:** the code calls this role "organizer" (routes like
`/api/organizer/...`, the file `Organizer.jsx`) rather than "admin" — same
thing, just the name used throughout. Rename it if you'd like your codebase
to say "admin" instead; it's a find-and-replace across `frontend/src/pages/Organizer.jsx`,
`backend/src/routes/organizer.js`, and the `/organizer` path in `App.jsx`.

---

## 3. Hosting it for free

This is the part worth reading carefully, because the obvious approach has a
real trap in it.

### The trap

Most "free" hosting tiers (Render's free web service, for example) do **not**
give you a persistent disk. Every time the app goes idle and spins back up —
which happens after ~15 minutes of no traffic on a free tier — the
filesystem resets to whatever was in the original deployment. If this app
stored its database and images as local files (the common approach, and
actually how an earlier version of this codebase worked), **every vote and
every submitted meme would silently vanish** the first time the site sat
idle overnight.

### The fix already built in

That's why this version stores everything — including images — in
**Postgres**, not on local disk. As long as your Postgres database is
hosted somewhere persistent (Supabase and Neon's free tiers both are — they
pause when idle but never delete your data, and un-pause automatically on
the next request), your data survives the backend restarting, redeploying,
or spinning down, because none of that touches the database.

### Recommended free setup

| Piece | Where | Cost |
|---|---|---|
| Database (+ images) | [Supabase](https://supabase.com) or [Neon](https://neon.tech) | Free (500MB–1GB+, no time limit) |
| Backend (Express API) | [Render](https://render.com) free web service | Free (spins down when idle; wakes up in ~30–60s on the next request) |
| Frontend (static site) | Render free static site, or [Netlify](https://netlify.com) / [Vercel](https://vercel.com) | Free |

Steps:

1. **Database:** create a free Supabase (or Neon) project, copy its
   connection string.
2. **Backend on Render:**
   - New → Web Service → connect your GitHub repo → root directory `backend`
   - Build command: `npm install`
   - Start command: `npm start`
   - Add all the variables from your `.env` as environment variables in
     Render's dashboard (`DATABASE_URL`, `WEBHOOK_SECRET`,
     `ORGANIZER_PASSCODE`, SMTP settings, etc.) — set `DATABASE_SSL=true`
   - Deploy. Note the URL Render gives you (e.g. `https://meme-arena-api.onrender.com`)
3. **Frontend on Render (or Netlify/Vercel):**
   - New → Static Site → same repo → root directory `frontend`
   - Build command: `npm install && npm run build`
   - Publish directory: `dist`
   - **Important:** add a rewrite rule so client-side routes work —
     on Render this is "Redirects/Rewrites": source `/*`, destination
     `/index.html`, action `Rewrite`. (Netlify: create `frontend/public/_redirects`
     containing `/*  /index.html  200`. Vercel: this is automatic.)
4. Update `frontend/src/pages/Gallery.jsx`'s `MS_FORMS_URL` and
   `backend/.env`'s `FRONTEND_ORIGIN`/`PUBLIC_APP_URL` to your real deployed
   URLs, then redeploy both.
5. Update the Power Automate flow's HTTP action to point at your deployed
   backend's `/api/webhook/ms-forms` URL instead of `localhost`.

**The only real trade-off:** Render's free backend takes 30–60 seconds to
wake up if nobody's visited in a while (the "someone opens the site after
lunch and it looks like it's loading forever" effect). For a short internal
contest this is usually a non-issue and a fair price for $0 hosting. If it
bothers you, a $7/month Render "Starter" instance removes the spin-down
entirely — everything else about this setup stays the same either way.

---

## 4. Connecting Microsoft Forms

Microsoft Forms doesn't call webhooks directly — the standard bridge is
**Power Automate** (included in most Microsoft 365 plans).

1. **Create your Form** at forms.office.com with at least:
   - Name (Text)
   - Email (Text)
   - Meme title / caption (Text)
   - Upload your meme (File upload)

2. **Go to** [make.powerautomate.com](https://make.powerautomate.com) →
   **Create** → **Automated cloud flow**.

3. **Trigger:** *Microsoft Forms* → **"When a new response is submitted"**
   → select your form.

4. **Add action:** *Microsoft Forms* → **"Get response details"**
   (Response Id = dynamic value from the trigger).

5. **Add action:** *Microsoft Forms* → **"Get file content"** — pick the
   file-upload field's dynamic value from step 4.

6. **Add action:** **HTTP** → **HTTP**.
   - Method: `POST`
   - URI: `https://YOUR-DEPLOYED-BACKEND/api/webhook/ms-forms?secret=YOUR_WEBHOOK_SECRET`
   - Headers: `Content-Type: application/json`
   - Body (build with the dynamic content picker, not by typing field names):
     ```json
     {
       "title": "@{outputs('Get_response_details')?['body/rXXX_meme_title']}",
       "submitterName": "@{outputs('Get_response_details')?['body/rXXX_name']}",
       "submitterEmail": "@{outputs('Get_response_details')?['body/rXXX_email']}",
       "imageFilename": "@{outputs('Get_response_details')?['body/rXXX_upload']?[0]?['name']}",
       "imageBase64": "@{base64(body('Get_file_content'))}"
     }
     ```

7. **Save**, submit a test response, and check:
   - Power Automate's run history (green checkmark)
   - Your `/organizer` dashboard (submission under "Pending")
   - Your inbox, if SMTP is configured

**Optional extra notification channel:** add an *Outlook* "Send an email" or
*Microsoft Teams* "Post message" action right after the HTTP action in the
same flow, so admins get pinged in Teams natively too.

---

## 5. What's intentionally simple

- **"Authentication"** is a company ID + email with no password, and the
  admin passcode is a single shared secret. Both stop casual duplicate
  votes / unauthorized access; neither stops someone determined to cheat.
- **No categories** — every submission is just a title + image.
- **About Us page** (`frontend/src/pages/AboutUs.jsx`) has `TODO`
  placeholders for the Sports & Cultural Committee's mission, events,
  members, and contact info.

---

## 6. Project structure

```
meme-arena-app/
  backend/
    src/
      server.js          Express app entry point
      db.js               Postgres connection + schema loader
      schema.sql          Table definitions
      routes/
        webhook.js         Microsoft Forms / Power Automate webhook
        images.js          Serves meme images stored as base64 in Postgres
        memes.js           Public gallery feed
        votes.js           Vote toggle + "my votes" lookup
        leaderboard.js     Top memes / top submitters
        organizer.js        Admin: moderation queue, approve/reject, manual add
      middleware/
        organizerAuth.js   Shared-passcode gate for the admin dashboard
      services/
        notify.js          Email notifications (Nodemailer)
    .env.example
  frontend/
    src/
      App.jsx
      api.js               Fetch wrapper for the backend API
      styles.css           Brand tokens + all styling
      components/
        NavBar.jsx
        MemeCard.jsx
        IdentityGate.jsx
      pages/
        Gallery.jsx
        Leaderboard.jsx
        AboutUs.jsx
        Organizer.jsx       The admin dashboard
```
