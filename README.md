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
