## SportsScheduler

Build and play. SportsScheduler is a web app for organizing casual sport sessions with two personas: administrators and players. Admins configure available sports and view reports; players sign up, create sessions, and join matches.

### Live App
- URL: `https://sportsschedular-1v6v.onrender.com/` (replace with the deployed URL)

### Demo Video
- Link: `https://youtu.be/sgYWH2WrrTA?si=VOgCxNOKL1AVLPCB` (Loom/YouTube/Vimeo)

### Screenshots
Add images to the repo (e.g., `docs/screenshots/`) and reference them below.

![Home](docs/screenshots/home.png)
![Admin Sports](docs/screenshots/admin-sports.png)
![Create Session](docs/screenshots/create-session.png)
![Reports](docs/screenshots/reports.png)

---

## Personas
- **Administrator**: Sets up available sports, can create/join sessions, and views reports of sessions played.
- **Player**: Signs up/signs in, creates sessions, joins existing sessions, and manages their participation.

## User Stories (Scope & Progress)
Use this checklist to track completion. Update as you build.

- [ ] **Admins can create sports**: list, create, edit sport names
- [ ] **Players can sign up and sign in**: name, email, password; sign out
- [ ] **Players can create a sport session**: select sport, prefilled team names, looking-for count, date/time, venue
- [ ] **Players can view and join sessions**: cannot join past sessions; see joined and available separately
- [ ] **Admins can create and join sessions**: same as players
- [ ] **Players can cancel their created sessions**: with reason; visible to previous joiners; clearly marked
- [ ] **Admin reports**: sessions played in a period; popularity by spor

---

## MVP Definition
To ship fast, build a vertical slice first:
- **Auth**: Admin sign-in, Player sign-up/sign-in
- **Sports**: Admin creates a sport
- **Sessions**: Admin creates a session; Player joins it

Once this works end-to-end, iterate with additional features and polish.

---

## Tech Stack
Adapt this section to your implementation.

- **Backend**: Node.js + Express (or your chosen backend)
- **Auth**: Sessions or JWTs, role-based authorization (`admin`, `player`)
- **Database**: MongoDB
- **Frontend**: React/Vite/Next.js (or server-rendered views like EJS/Handlebars)
- **Deployment**: Render (web service + managed MongoDB)

---

## Data Model (reference)
Adjust to match your schema.

- **User**: id, name, email, password_hash, role (`admin` | `player`), created_at
- **Sport**: id, name, created_by, created_at
- **Session**: id, sport_id, created_by, starts_at, venue, looking_for_count, status (`scheduled` | `cancelled` | `completed`), cancel_reason
- **SessionPlayer**: session_id, user_id, team_slot, joined_at

Key rules:
- Players cannot join past sessions.
- Creator can cancel their session with a reason.
- Admins have all player capabilities plus reports and sport management.

---

## API Sketch (example)
Replace with your actual routes.

```http
POST   /auth/signup
POST   /auth/login
POST   /auth/logout

GET    /sports           (admin)
POST   /sports           (admin)
PATCH  /sports/:id       (admin)

GET    /sessions         (all)
POST   /sessions         (player/admin)
GET    /sessions/:id     (all)
POST   /sessions/:id/join         (player/admin)
POST   /sessions/:id/cancel       (creator)

GET    /reports/sessions?from=...&to=...      (admin)
GET    /reports/popular-sports?from=...&to=... (admin)
```

Protect role-specific endpoints with middleware, e.g.:
```js
function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(401).json({ message: 'Unauthorized user.' });
}
```

For local testing of multiple roles, use different browsers or profiles so cookies don’t collide.

---

## Running Locally

1) Prerequisites
- Node.js LTS and npm (or your stack’s prerequisites)
- PostgreSQL running locally (or Docker) if using Postgres

2) Clone & Install
```bash
git clone git@github.com:your-username/SportsScheduler.git
cd SportsScheduler
npm install
```

3) Environment Variables
Create `.env` with values for your stack, for example:
```bash
DATABASE_URL=postgres://user:pass@localhost:5432/sports_scheduler
SESSION_SECRET=replace-with-a-long-random-string
PORT=3000
```

4) Database Setup
```bash
# Example with Prisma
npx prisma migrate dev
npx prisma db seed
```

5) Start
```bash
npm run dev
# or
npm start
```

6) Access
Open `http://localhost:3000`.

---

## Deployment (Render)

1) Create a Web Service
- Connect your private GitHub repo (keep it private until submission)
- Build Command: `npm ci && npm run build` (adjust as needed)
- Start Command: `npm start`

2) Provision a Database (if needed)
- Add a managed PostgreSQL on Render and set `DATABASE_URL`

3) Environment
- Set `SESSION_SECRET`, `DATABASE_URL`, and other required env vars

4) Migrations & Seed
- Run migrations on deploy or via a one-off job

5) Verify
- Visit the Live URL and create an admin/user to test flows

---

## How to Demo (suggested flow)
1) Show the homepage
2) Sign in as an admin
3) Create a sport
4) Sign up/sign in as a player
5) Create a session
6) Join an existing session
7) Show reports (admin)
8) Highlight one interesting/difficult implementation detail

---

## Interesting Implementation Notes
Document design choices and tricky parts here. For example:
- Role-based auth with session cookies vs JWTs
- Preventing joins on past sessions (server-side validations + UI guards)
- Handling cancellations and surfacing cancel reasons
- Report queries with date-range filters and aggregation

---

## Roadmap
- **Short-term**: Player-created sessions, cancellation UI, session filters, basic reports
- **Mid-term**: Conflict detection for overlapping sessions, change password, better email flows
- **Long-term**: Notifications, invitations, waitlists, calendar integrations

---

## Contributing
1) Fork the repo and create a feature branch
2) Follow the existing code style and lint rules
3) Add tests where reasonable
4) Open a PR describing the change and screenshots when relevant

---


## Notes for Reviewers
- Repository kept private until submission as per course guidelines. It will be made public before sharing on the LMS.
- Implemented features and known limitations will be listed in the checklist above and/or in release notes.



