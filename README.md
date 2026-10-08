# MovieReader

Movie search / watchlist app with:

- **Frontend:** React 19 + Vite + Tailwind CSS (port `5173`)
- **Backend:** Express + PostgreSQL + Firebase Auth (port `5000`)

## 1. Prerequisites

Install these first:

1. **Node.js 20+** (includes npm) — https://nodejs.org/
   Verify with:
   ```bash
   node -v
   npm -v
   ```
2. **Git** (only if cloning) — https://git-scm.com/
3. **PostgreSQL 14+** (only for backend mode) — https://www.postgresql.org/download/
4. A **Firebase project** with Email/Password sign-in enabled (only for backend mode).

## 2. Download / Open the project

### Option A: Clone with Git

```bash
git clone <YOUR-REPO-URL>
cd MovieReader
```

### Option B: Download ZIP

1. Download the project ZIP.
2. Extract it.
3. Open the `MovieReader` folder in VS Code:
   - VS Code > File > Open Folder > select `MovieReader`
   - Or from terminal:
   ```bash
   cd path/to/MovieReader
   code .
   ```

Your folder should look like this:

```
MovieReader/
  package.json        # frontend
  vite.config.js
  src/
  backend/
    package.json      # backend
    src/index.js
  .env.example
  backend/.env.example
```

## 3. Run the frontend only (quickest)

Works without a database. Uses mock data / TMDB fallback.

```bash
# 1. Go to project root
cd MovieReader

# 2. Install dependencies
npm install

# 3. (Optional) enable TMDB fallback
cp .env.example .env
# On Windows CMD: copy .env.example .env
# Then edit .env and set VITE_TMDB_API_KEY=your_key

# 4. Start dev server
npm run dev
```

Open: http://localhost:5173

## 4. Run frontend + backend (full app)

You need 2 terminals.

### Terminal 1 — Backend

```bash
cd MovieReader/backend

npm install

cp .env.example .env
# On Windows CMD: copy .env.example .env
```

Edit `backend/.env`:

```ini
PORT=5000
DATABASE_URL=postgres://USER:PASSWORD@localhost:5432/moviereader
JWT_SECRET=REPLACE_WITH_LONG_RANDOM_STRING
JWT_EXPIRES_IN=7d
FRONTEND_ORIGIN=http://localhost:5173

# Firebase Admin - Option A (easiest):
FIREBASE_KEY_FILE=./service-account.json
# Download from: Firebase console > Project settings > Service accounts
# > Generate new private key, save as backend/service-account.json

# Movies API
RAPIDAPI_KEY=YOUR_RAPIDAPI_KEY
RAPIDAPI_HOST=movie-database-alternative.p.rapidapi.com
MOVIE_MOCK_FALLBACK=true
```

Create the database (once):

```bash
# Postgres must be running
createdb moviereader
# On Windows use pgAdmin or: psql -U postgres -c "CREATE DATABASE moviereader;"
```

Start backend:

```bash
npm run dev
# or production: npm start
```

Backend should be at: http://localhost:5000/api

### Terminal 2 — Frontend

```bash
cd MovieReader

npm install

cp .env.example .env
# On Windows CMD: copy .env.example .env
```

Edit root `.env`:

```ini
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_APP_ID=...
```

Get the `VITE_FIREBASE_*` values from:
Firebase console > Project settings > Your apps > Web app.

Start frontend:

```bash
npm run dev
```

Open: http://localhost:5173

## 5. Build for production

```bash
# Frontend
npm run build
npm run preview
# dist/ folder is the deployable build

# Backend
cd backend
npm start
```

## Ports

| Service  | Default URL               |
|----------|---------------------------|
| Frontend | http://localhost:5173     |
| Backend  | http://localhost:5000/api |

## Troubleshooting

- `port already in use`: stop the other process or change `PORT` (backend) / `server.port` in `vite.config.js` (frontend).
- `Cannot connect to database`: check Postgres is running and `DATABASE_URL` is correct.
- `Firebase auth errors`: make sure Email/Password sign-in is enabled and both frontend `.env` and `backend/service-account.json` are from the SAME Firebase project.
- `npm install` fails: delete `node_modules` + `package-lock.json`, run `npm install` again, and make sure Node is v20+.
- Blank page on `5173`: check terminal for errors, make sure `npm run dev` is still running.

Thought · 2ms
Created README.md in MovieReader/ with:
Prerequisites (Node 20+, Git, Postgres, Firebase)
Download: git clone + ZIP/ VS Code open instructions
Frontend-only quick run (npm install, npm run dev → http://localhost:5173)
Full frontend + backend run (2 terminals, .env setup, createdb, Firebase service account, RapidAPI key)
Production build (npm run build / npm start)
Ports table + troubleshooting
