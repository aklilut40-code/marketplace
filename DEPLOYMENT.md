# Deployment Guide

This project has a React + Vite frontend and an Express + MongoDB backend. The quickest way to deploy and verify it is:

- Backend: Render web service
- Frontend: Render static site or Netlify

## Important links

- GitHub repo: https://github.com/aklilut40-code/marketplace
- Backend live URL: https://marketplace-backend-1szo.onrender.com
- Render frontend URL (if deployed): https://marketplace-frontend-cm21.onrender.com
- Netlify frontend URL (if deployed): https://minimarket-frontend.netlify.app

## Very important points

### 1) Backend is separate from frontend
The backend and frontend are two different deploy targets. A failed frontend deploy does not ruin the backend service.

- Backend API checks:
  - `curl -I https://marketplace-backend-1szo.onrender.com`
  - `curl -i https://marketplace-backend-1szo.onrender.com/api/products`
- If the backend responds with JSON, it is alive.

### 2) Frontend must know the backend URL at build time
The frontend uses `VITE_API_URL` in `frontend/src/api/client.js`.

When the app is built for production, it uses:

- `VITE_API_URL=https://marketplace-backend-1szo.onrender.com`

If this env var is missing, the built frontend may call the wrong origin or the same-origin path instead of the real backend.

### 3) Backend CORS must allow the frontend origin
The backend in `backend/server.js` reads `CLIENT_URLS` and whitelists those origins.

Example value:

```
CLIENT_URLS=https://marketplace-frontend-cm21.onrender.com,https://minimarket-frontend.netlify.app,http://localhost:5173
```

If the browser shows a CORS error, add the exact frontend origin there and redeploy the backend.

### 4) Use Node 18+ for the frontend
The project is Vite 8 based. Use Node 18 or newer.

Add to `frontend/package.json` if needed:

```json
"engines": {
  "node": ">=18"
}
```

## Backend deployment (Render)

Deploy the `backend/` folder as a Render Web Service.

Required environment variables:

```env
PORT=5000
MONGO_URI=<your MongoDB connection string>
JWT_SECRET=<a secure random string>
CLIENT_URLS=https://marketplace-frontend-cm21.onrender.com,https://minimarket-frontend.netlify.app,http://localhost:5173
```

Render settings:

- Build command: `npm install`
- Start command: `npm start`
- Root directory: `backend`

Then click Deploy.

## Frontend deployment (Render static site)

Deploy the `frontend/` folder as a Render Static Site.

Render settings:

- Root directory: `frontend`
- Build command: `npm run build`
- Publish directory: `dist`
- Environment variable: `VITE_API_URL=https://marketplace-backend-1szo.onrender.com`

Then redeploy.

## Frontend deployment (Netlify)

Netlify settings:

- Build command: `npm run build`
- Publish directory: `dist`
- Environment variable: `VITE_API_URL=https://marketplace-backend-1szo.onrender.com`

If the site says “Site not found”, make sure you opened the Production domain shown in Netlify, not the project dashboard URL.

## Important files to check

- `README.md`
- `backend/README.md`
- `frontend/README.md`
- `frontend/src/api/client.js`
- `frontend/vite.config.js`
- `backend/server.js`

## Quick verification checklist

1. Check backend directly:
   ```bash
   curl -i https://marketplace-backend-1szo.onrender.com/api/products
   ```
2. Set `VITE_API_URL` in the frontend hosting service before build.
3. Set `CLIENT_URLS` in Render backend to include the frontend origin.
4. Open the frontend and inspect DevTools → Network.
5. Confirm product requests go to:
   ```text
   https://marketplace-backend-1szo.onrender.com/api/products
   ```
6. If you see CORS errors, add the exact origin and redeploy the backend.

## Common issues

### Netlify site says “Site not found”
This is not an app bug; it usually means the deploy is not published, or you opened the dashboard URL instead of the production domain.

### Build fails with exit code 2
Run locally:

```bash
cd frontend
npm ci
npm run build
```

The error output will show the real issue.

### Browser shows CORS errors
Add the exact origin shown in the console to `CLIENT_URLS` on the Render backend service and redeploy.

## Final note
The core deployment logic is already documented in this repo, but the most important values are:

- Frontend env: `VITE_API_URL=https://marketplace-backend-1szo.onrender.com`
- Backend env: `CLIENT_URLS=https://marketplace-frontend-cm21.onrender.com,https://minimarket-frontend.netlify.app,http://localhost:5173`

These are the main settings that make the frontend and backend work together.
