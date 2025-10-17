# ReWrapped Spotify

See the demo at: https://rewrapped-spotify.pages.dev/ (frontend hosting)

ReWrapped Spotify is a web application that helps you explore and visualize your Spotify listening history. Upload your Spotify data (the Streaming History you can request from Spotify’s privacy portal) and discover your top tracks, artists, and listening patterns over time.

## 🚀 What is ReWrapped Spotify?

ReWrapped Spotify lets you securely upload your Spotify streaming history (downloaded from Spotify’s privacy portal) and provides interactive insights, such as:

- Top tracks and artists
- Total listening time
- Activity by date and hour
- Trends and patterns in your music habits

## ✨ Features

- Spotify OAuth login (backend handles OAuth flow).
- Upload Spotify Streaming History (JSON or ZIP) and parse it server-side.
- Personalized stats: top tracks, top artists, total listening time.
- Date-range filtering, pagination, and interactive summary pages.
- Modern React + Vite frontend with TypeScript and Tailwind CSS.
- Local storage of user data in SQLite (backend).

## 🛠️ Technology Stack

- Backend: Go (go 1.25), net/http, SQLite, sqlc, Goth for Spotify OAuth
- Frontend: React 19 (TypeScript), Vite, Tailwind CSS, @tanstack/react-query, @tanstack/react-router
- Tooling: Docker, pnpm (package manager used in `web/`), Vite dev server
- Hosting used by the project: Fly.io for API and Cloudflare Pages for frontend (example)

## 📦 Prerequisites

- Go (1.25+ recommended for the server) — see `server/go.mod`
- Node.js (16+ recommended) and bun (or npm/pnpm/yarn) for the frontend
- SQLite (for local DB storage)
- Docker (optional, for containerized deployment)
- A Spotify developer account (to create a Client ID/Secret and set redirect URI)

## ⚡ Setup & Development

The project contains two main parts: the backend server (in `server/`) and the frontend (in `web/`). You can run them separately during development.

1. Clone the repository:

```bash
git clone https://github.com/jprkindrid/rewrapped-spotify.git
cd rewrapped-spotify
```

2. Backend (server):

- Install Go dependencies and build:

```bash
cd server
go mod download
go build -o out ./cmd
```

- Create a `.env` (or set env vars) with your Spotify credentials. Typical vars used by the server:

```text
SPOTIFY_CLIENT_ID=""
SPOTIFY_CLIENT_SECRET=""
SPOTIFY_REDIRECT_URI="http://127.0.0.1:8080/auth/spotify/callback"
PORT=8080
DB_PATH=data/userdata.sqlite
URL_ADDR=127.0.0.1
```

- Run migrations (the repo includes `scripts/gsup.sh` which wraps goose):

```bash
./scripts/gsup.sh
```

- Start the server:

```bash
./out
```

Or use Docker Compose from the repository root:

```bash
docker-compose -f server/docker-compose.yml up --build
```

3. Frontend (web):

The frontend uses Vite + React + TypeScript and is located in `web/`. The project uses bun as the package manager (see `web/package.json`), but npm, yarn, or pnpm will also work.

Install dependencies and run the dev server:

```bash
cd web
bun install   # or `npm/pnpm install` / `yarn`
npm run dev   # starts Vite on http://127.0.0.1:5173
```

Vite's dev server proxies `/api` and `/auth` requests to the backend at http://127.0.0.1:8080 (see `web/vite.config.ts`). Run the backend first so the frontend can reach the API routes.

## 🛠️ API Overview

The backend exposes a small REST API to upload and summarize streaming history. Main endpoints used by the frontend include:

- POST /api/upload — Upload streaming history JSON or ZIP
- GET /api/summary — Retrieve a listening summary (supports start/end filters, offset, limit)
- GET /auth/spotify — Begin Spotify OAuth login
- GET /auth/spotify/callback — OAuth callback redirect for Spotify
- POST /auth/logout — Log out

Example request:

GET /api/summary?start=2023-01-01T00:00:00Z&end=2023-12-31T23:59:59Z&offset=0&limit=10

Query parameters:
- start (optional, RFC3339)
- end (optional, RFC3339)
- offset (optional)
- limit (optional, default 10)

Responses are JSON objects containing counts, top artists/tracks, and aggregated listening time.

Authentication (Spotify OAuth) is required for the endpoints that read or write user data.

## 🤝 Contributing

Contributions are very welcome! 
If you would like to contribute please fork the repo and create a pull request to the `main` branch.

## 📝 Usage

1. **Login with Spotify:** Click "Login with Spotify" on the homepage.
2. **Download your data:** Visit [Spotify Privacy Settings](https://www.spotify.com/account/privacy/) and request your data.
3. **Upload your files:** Go to the "Upload & Analyze" page and upload your streaming history files.
4. **Explore your stats:** View your top tracks, artists, and listening trends.

## 🗺️ Project Structure

Backend (`server/`):

`server/` – Go module, Dockerfile, and server-related config
`server/cmd/` – Backend entrypoint
`server/internal/` – Backend packages (auth, handlers, database, parser, spotify clients, summary)
`server/sql/` – Database schema and queries
`server/scripts/` – Helper scripts (db migrations, docker helpers)

Frontend (`web/`):

`web/package.json` — frontend scripts and dependencies (pnpm recommended)
`web/vite.config.ts` — Vite dev server and proxy config
`web/index.html` — frontend HTML entry
`web/src/main.tsx` — React entry, router + query client, AuthProvider
`web/src/routes.tsx` — route definitions
`web/src/index.css` — Tailwind and global styles
`web/src/pages/` — top-level pages
  - `HomePage/` — homepage components
  - `SummaryPage/` — app summary UI, includes `FilterControls/` and `SummaryBlock/`
  - `UploadPage/` — upload UI and file upload section
`web/src/components/ui/` — shared UI primitives (buttons, popovers, calendar)
`web/src/context/` — `AuthProvider` and context utilities
`web/src/hooks/` — React hooks (`useAuth`, `useSummaryQuery`, `useLogout`)
`web/src/services/` — API wrappers (`apiFetch`, `auth`, `summary`)
`web/src/shared-components/` — reusable UI (NavBar, Explanation, etc.)
`web/src/utils/` — helper utilities and types

## 🚧 Future Enhancements

- Artist images and richer metadata
- More advanced analytics (genre, time series, clustering)
- Exportable CSV/JSON reports and shareable summaries

## 📄 License

MIT
