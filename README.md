# Marketplace Project — Getting Started

This covers everything to install and verify **before** handing the build prompt
to Antigravity AI.

## Prerequisites

| Tool | Purpose | Check | Install |
|---|---|---|---|
| Node.js (LTS, 18+) | Runs the Express backend and the Vite frontend | `node -v` | [nodejs.org](https://nodejs.org) (npm comes bundled) |
| npm | Installs project packages | `npm -v` | Comes with Node.js |
| MongoDB | The database | — | See below |
| Git | Version control | `git --version` | [git-scm.com](https://git-scm.com) |
| Antigravity AI | Builds the project | — | Whatever install path it gives you |

### MongoDB — pick one

**Option A: MongoDB Atlas (recommended)**

1. Sign up at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Create a free-tier cluster.
3. Under **Database Access**, create a user with a password.
4. Under **Network Access**, allow your current IP (or `0.0.0.0/0` for testing).
5. Click **Connect** → **Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/marketplace
   ```
6. Save this — it goes into `MONGO_URI` in the backend's `.env` file later.

No local service to run; works from any network with internet access.

**Option B: Local MongoDB**

- Mac: `brew install mongodb-community`
- Windows: download the MSI installer from [mongodb.com](https://www.mongodb.com/try/download/community)
- Start it with `mongod` (or as a background service) before running the backend.
- Connection string: `mongodb://127.0.0.1:27017/marketplace`

### Recommended, not required

- **Postman** or the VS Code **Thunder Client** extension — test API endpoints directly without needing the frontend built yet.
- **VS Code** — common editor choice; check whether Antigravity integrates with it as an extension.
- **MongoDB Compass** — a GUI to inspect your database while developing.

### Not needed for this project

- No PostgreSQL or SQL client — this project uses MongoDB/Mongoose only.
- No Docker — not required at this scope.

## Verify your setup

Run these before starting:

```bash
node -v      # should print v18.x.x or higher
npm -v       # should print a version number
git --version
```

If you're using Atlas, confirm you have the full connection string saved somewhere
handy — you'll paste it into `.env` as soon as the backend scaffold exists.

## Next step

Once the checks above pass, hand Antigravity the build prompt for the full
Marketplace project (backend: Express + MongoDB/Mongoose; frontend: React + Vite).
When it creates the backend's `.env.example`, copy it to `.env` and fill in:

```
MONGO_URI=<your Atlas connection string or local URI>
JWT_SECRET=<any long random string>
PORT=5000
```

Then:
```bash
cd backend && npm install && npm run dev
cd frontend && npm install && npm run dev
```

---

## Recent changes (applied 2026-10-15)
These are the repository updates applied while debugging the deployed frontend/backend setup. They document what was changed and why — follow the verification steps below after deploying.

1) Frontend: use VITE_API_URL at build time for API base
- File: `frontend/src/api/client.js`
- Change: Axios client now uses the environment variable `VITE_API_URL` (when present) as the backend origin and falls back to the dev proxy (`/api`) for local development.
- Purpose: Allows the built frontend to call the Render backend (or any other origin) by setting `VITE_API_URL` at build time.
- Verification: After building the frontend, requests should go to `${VITE_API_URL}/api/...` (or `/api/...` when running locally with Vite dev server).

2) Frontend: dev proxy reads VITE_API_URL (optional)
- File: `frontend/vite.config.js`
- Change: Dev proxy target now prefers `VITE_API_URL` if present, else falls back to `http://localhost:5000`.
- Purpose: Lets local dev use a custom backend origin without editing code.

3) Frontend: document env example
- File: `frontend/.env.example`
- Change: Added `VITE_API_URL=https://marketplace-backend-1szo.onrender.com` as an example.
- Purpose: Shows the recommended production backend origin for this project.

4) Backend: optional, configurable CORS origins
- File: `backend/server.js`
- Change: Replaced the permissive `app.use(cors())` with a configurable CORS setup that:
  - Accepts a `CLIENT_URLS` environment variable (comma-separated list) to whitelist origins.
  - Falls back to a sensible default list that includes local dev origins and the Render frontend URL (`https://marketplace-frontend-cm21.onrender.com`).
- Purpose: Make cross-origin requests optional and explicit so the API can be called from deployed frontends while remaining friendly for local dev.
- Env var example: `CLIENT_URLS=https://marketplace-frontend-cm21.onrender.com,http://localhost:5173`

## Deployment notes
- Frontend (Render or Netlify): set `VITE_API_URL` to the backend origin *before* building the frontend. Example:
  - `VITE_API_URL=https://marketplace-backend-1szo.onrender.com`
  - On Render: add this in the frontend service Environment variables and redeploy the frontend.
  - On Netlify: add the same env var in Site settings → Build & deploy → Environment.

- Backend (Render): if you change `CLIENT_URLS`, redeploy/restart the backend so the new CORS settings take effect.

## Quick verification checklist
1. Backend reachable directly (should return JSON):
   `curl https://marketplace-backend-1szo.onrender.com/api/products`
2. Set `VITE_API_URL` on the frontend host (Render/Netlify) and redeploy the frontend.
3. Open the frontend site and check DevTools → Network. The product fetch should go to:
   `https://marketplace-backend-1szo.onrender.com/api/products`
4. If you see a CORS error, add the exact origin shown in the console to `CLIENT_URLS` and redeploy the backend.

If you want, I can append a short section to the frontend and backend README files summarizing the same changes and the exact env vars to set — say so and I will update those files as well.