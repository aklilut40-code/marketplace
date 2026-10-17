# Marketplace — Professional Project Documentation

[![GitHub](https://img.shields.io/badge/GitHub-marketplace-blue?logo=github)](https://github.com/aklilut40-code/marketplace) [![Live (Render Frontend)](https://img.shields.io/badge/Live-Render%20Frontend-brightgreen)](https://marketplace-frontend-cm21.onrender.com) [![Live (Netlify)](https://img.shields.io/badge/Live-Netlify-yellowgreen)](https://minimarket-frontend.netlify.app) [![API](https://img.shields.io/badge/API-Backend-orange)](https://marketplace-backend-1szo.onrender.com)

A production-minded Marketplace application example: a React + Vite single-page frontend and an Express + MongoDB (Mongoose) backend. This README explains how the system is built, how data flows end-to-end, how to run and deploy it, and how to debug common problems.

Quick links
- Repository: https://github.com/aklilut40-code/marketplace
- Live frontend (Render): https://marketplace-frontend-cm21.onrender.com
- Live frontend (Netlify): https://minimarket-frontend.netlify.app
- Live backend (API): https://marketplace-backend-1szo.onrender.com

Table of contents
- Overview
- Architecture & data flow
- Stack and key libraries
- Project layout and key files
- How the frontend is built (Vite, env inlining)
- How the backend runs (Express, CORS, uploads)
- Models (summary)
- Local development (exact commands)
- Deployment (Render + Netlify) — exact settings
- API examples (curl)
- Environment variables
- Troubleshooting checklist
- Contributing and contact

---

Overview

Marketplace is a full-stack example that demonstrates standard patterns used in production web apps: a statically built frontend served from a CDN/static host, and a JSON REST API backed by MongoDB. It includes authentication (JWT), image uploads, product CRUD, reviews, carts, and order checkout.

Architecture & data flow

Simple request flow:
```
Browser (React SPA)
  └─ axios → (VITE_API_URL or /api) → CDN / static host (serves bundle)
     └─ Backend API (Express) → Services → Mongoose → MongoDB
        └─ Uploads served from /uploads
```

- In development the Vite dev server proxies `/api` to the backend (`vite.config.js`).
- In production the built bundle calls the backend origin set by `VITE_API_URL` at build time.

Stack and key libraries
- Runtime: Node.js (recommend Node 18+)
- Frontend: React + Vite (vite@8), @vitejs/plugin-react, axios
- Backend: Express, Mongoose, multer, dotenv, cors, jsonwebtoken
- Dev tooling: nodemon (backend), Oxlint (frontend dev lint), jest/supertest (tests placeholder)

Project layout (top-level)
```
/frontend      # React + Vite SPA
/backend       # Express API, Mongoose models, routes, controllers
README.md      # this file
DEPLOYMENT.md  # deployment checklist
```
Key frontend files
- `frontend/src/api/client.js` — axios instance; computes base URL from `import.meta.env.VITE_API_URL` and resolves image URLs
- `frontend/vite.config.js` — dev proxy and env loading
- `frontend/package.json` — dev/build scripts

Key backend files
- `backend/server.js` — app entry: loads env, configures CORS, mounts routes, serves uploads
- `backend/models/` — Mongoose schemas for User, Product, Order, Review, Cart
- `backend/routes/`, `controllers/`, `services/` — request handling and business logic

How the frontend is built (important detail)
- Build command: `npm run build` (runs `vite build`) — outputs `dist/`.
- Vite inlines `import.meta.env.*` values at build time. That means `VITE_API_URL` must be set in the environment where the build runs (Render/Netlify) to produce a bundle that calls the correct backend origin.
- If `VITE_API_URL` is not set during build, the bundle will fall back to `/api` (which will point to the same origin), causing production requests to target the static host instead of the API.

How the backend runs
- `backend/server.js` connects to MongoDB (using `MONGO_URI`), registers models, sets up JSON body parsing, configures CORS using `CLIENT_URLS` (a comma-separated whitelist), mounts API routes under `/api/*`, serves `/uploads` statically, and starts listening on `process.env.PORT || 5000`.
- For hosted deployments: set env vars in Render (or your host) rather than relying on `.env` files.

Models (high-level)
- User: { name, email, passwordHash, role }
- Product: { name, description, price, stock, images[], category, seller }
- Cart: per-user items with product references and quantities
- Order: { user, items snapshot, status, total, createdAt }
- Review: { user, product, rating, comment }
(See `backend/models/` for full schemas.)

Local development — exact commands

Prerequisites: Node 18+, npm, MongoDB (Atlas or local)

1) Backend
```bash
cd backend
cp .env.example .env   # set MONGO_URI and JWT_SECRET
npm install
npm run dev
# server: http://localhost:5000
```

2) Frontend
```bash
cd frontend
# optional: cp .env.example .env
npm install
npm run dev
# dev: http://localhost:5173 (vite proxy forwards /api to backend)
```

3) Seed demo data (optional)
```bash
cd backend
npm run seed
# demo accounts: admin@example.com / password123
```

Production build (local) — ensure VITE_API_URL set
```bash
cd frontend
export VITE_API_URL=https://marketplace-backend-1szo.onrender.com
npm run build
# dist/ will contain static assets to serve
```

Deployment (exact settings)

Render — Backend (Web Service)
- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Environment variables (Render service):
  - MONGO_URI
  - JWT_SECRET
  - CLIENT_URLS (e.g. `https://marketplace-frontend-cm21.onrender.com,https://minimarket-frontend.netlify.app,http://localhost:5173`)

Render — Frontend (Static Site)
- Root directory: `frontend`
- Build command: `npm run build`
- Publish directory: `dist`
- Environment (set before build): `VITE_API_URL=https://marketplace-backend-1szo.onrender.com`

Netlify — Frontend (alternative)
- Build command: `npm run build`
- Publish directory: `dist`
- Site settings → Build & deploy → Environment: add `VITE_API_URL`

API examples (common)
1) Get products
```bash
curl -i https://marketplace-backend-1szo.onrender.com/api/products
```
2) Register / login
```bash
curl -X POST https://marketplace-backend-1szo.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"password"}'

curl -X POST https://marketplace-backend-1szo.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```
3) Authenticated request
```bash
TOKEN="<token-from-login>"
curl -H "Authorization: Bearer $TOKEN" https://marketplace-backend-1szo.onrender.com/api/users/me
```
4) Upload image (multipart)
```bash
curl -X POST "https://marketplace-backend-1szo.onrender.com/api/products/<ID>/images" \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@/path/to/file.jpg"
```

Environment variables (summary)
- Frontend (build-time): `VITE_API_URL` — production backend origin
- Backend:
  - `MONGO_URI` — MongoDB connection string
  - `JWT_SECRET` — secret for JWT signing
  - `PORT` — optional (defaults to 5000)
  - `CLIENT_URLS` — CORS whitelist (comma-separated)

Troubleshooting checklist (fast)
- Frontend still calls `/api` in production → `VITE_API_URL` not set during build. Set it and rebuild.
- CORS blocked in browser → add the exact origin shown in console to `CLIENT_URLS`, then redeploy backend.
- Build fails with exit code → reproduce locally: `cd frontend && npm ci && npm run build` and inspect the last 80 lines of the log.
- Backend DB connection errors → verify `MONGO_URI` and Atlas IP allowlist.

Contributing
- Fork, create branch, open PR. Keep secrets out of commits; use `.env.example` only.

Contact
- Maintainer: aklilut40-code — https://github.com/aklilut40-code/marketplace

License
- MIT
