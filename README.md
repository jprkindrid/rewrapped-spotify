# ReWrapped Spotify

Explore and visualize your Spotify listening history with interactive insights.
Upload your Spotify data and discover your top tracks, artists, listening patterns,
and trends.

**Live Demo:** https://rewrapped-spotify.pages.dev/

## About

ReWrapped Spotify is a full-stack web application that lets you:

- Securely upload your Spotify streaming history (downloaded from
  [Spotify's privacy portal](https://www.spotify.com/account/privacy/))
- Explore personalized listening insights with interactive visualizations
- Filter data by date ranges, time intervals (monthly/yearly), and sort preferences
- View ranking trends over time with bump charts
- Authenticate securely via Spotify OAuth

## Features

- **Spotify OAuth Login** – Secure authentication via Spotify
- **File Upload** – Support for Spotify's JSON or ZIP streaming history exports
- **Interactive Stats** – Top tracks, top artists, total listening time, activity
  trends
- **Bump Charts** – Visualize ranking changes over time (monthly/yearly)
- **Listening Time Charts** – Track listening hours over time (daily/monthly/yearly)
- **Date & Interval Filtering** – Filter by custom date ranges and time periods
- **Sort Options** – Sort by play count or listening time
- **Pagination & Search** – Browse listening history easily
- **Dark Mode** – Full dark/light theme support
- **Modern UI** – React + TypeScript frontend with Tailwind CSS
- **Secure Storage** – SQLite for development, Turso for production
- **Demo Mode** – Explore sample data without authentication

## Spotify API Restrictions

This app uses the Spotify API, which requires apps to be in "Development Mode" unless
they generate revenue or meet Spotify's extended quota requirements. In development mode,
only pre-approved users (added to the app's allowlist) can authenticate.

If you encounter a "Login Restricted" message when trying to log in, it means your
Spotify account hasn't been whitelisted. You can still explore the app using **Demo Mode**,
which provides sample listening data to demonstrate all features.

## Technology Stack

**Backend:**

- Go 1.25+ with `net/http`
- SQLite for development / Turso (LibSQL) for production with `sqlc` for
  type-safe queries
- Goth for Spotify OAuth
- Cloudflare R2 for blob storage (user streaming history)
- Custom LRU cache with TTL for performance optimization
- RESTful API

**Frontend:**

- React 19 with TypeScript
- Vite bundler
- TanStack Query & Router
- Tailwind CSS for styling
- Nivo Charts (Bump & Line) for visualization
- Bun package management

**Deployment:**

- Docker for containerization
- Fly.io (API) & Cloudflare Pages (frontend) for hosting

## Prerequisites

- **Go** 1.25+ ([download](https://golang.org/doc/install))
- **Node.js** 16+ and **bun** (or npm/pnpm/yarn) for frontend
- **SQLite** (included in most systems)
- **Docker** (optional, for containerized setup)
- **Spotify Developer Account**
  ([create here](https://developer.spotify.com/dashboard)) with Client ID/Secret

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/jprkindrid/rewrapped-spotify.git
cd rewrapped-spotify
```

### 2. Configure Backend

Navigate to the server directory:

```bash
cd server
```

Create a `.env` file with your configuration:

```env
# Required: Spotify OAuth
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REDIRECT_URI=http://127.0.0.1:8080/auth/spotify/callback

# Required: Authentication
JWT_SECRET=your_jwt_secret_key
SESSION_SECRET=your_session_secret_key

# Required: Frontend
FRONTEND_REDIRECT_URL=http://127.0.0.1:5173

# Required: File Storage (Cloudflare R2)
CLOUDFLARE_BUCKET_NAME=your_bucket_name
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_KEY_ID=your_key_id
CLOUDFLARE_KEY_SECRET=your_key_secret

# Note: Easily replaceable with AWS S3 or other blob storage

# Optional: Database
# For Development (SQLite - default):
DB_PATH=data/userdata.sqlite
DB_PATH_DOCKER=data/userdata.sqlite

# For Production (Turso):
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=your_turso_token

# Optional: Server
PORT=8080
# must be TRUE on deployment
PRODUCTION_BUILD=FALSE

# Optional: Demo Mode
DEMO_KEY=your_demo_key
KINDRID_USER_ID=spotify_user_id_for_demo
```

Download dependencies and build:

```bash
go mod download
make build
```

Run database migrations:

```bash
make migrate-up
```

Start the server:

```bash
make run
```

**Or use Docker:**

```bash
docker-compose up --build
```

### 3. Configure Frontend

Navigate to the frontend directory:

```bash
cd ../web
```

Install dependencies:

```bash
bun install
# or: npm install / pnpm install / yarn install
```

Start the development server:

```bash
npm run dev
```

The frontend will be available at `http://127.0.0.1:5173` and will proxy API
calls to the backend at `http://127.0.0.1:8080`.

## API Reference

The backend exposes a REST API for uploading and retrieving listening data.

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload streaming history (JSON or ZIP) |
| GET | `/api/summary` | Retrieve listening summary with filters |
| GET | `/api/bump` | Retrieve bump chart ranking trends |
| GET | `/api/listeningtime` | Retrieve listening time over intervals |
| GET | `/auth/spotify` | Begin Spotify OAuth login |
| GET | `/auth/spotify/callback` | OAuth callback handler |
| POST | `/auth/logout` | Log out |
| GET | `/health` | Health check endpoint |

### Example Requests

**Summary:**

```bash
GET /api/summary?start=2023-01-01T00:00:00Z&end=2023-12-31T23:59:59Z&offset=0&limit=10&sortBy=count
```

**Bump Chart:**

```bash
GET /api/bump?start=2023-01-01T00:00:00Z&end=2023-12-31T23:59:59Z&interval=yearly&sortBy=count
```

**Listening Time:**

```bash
GET /api/listeningtime?start=2023-01-01T00:00:00Z&end=2023-12-31T23:59:59Z&interval=monthly
```

**Query Parameters:**

- `start` (optional) – Start date in RFC3339 format
- `end` (optional) – End date in RFC3339 format
- `offset` (optional) – Pagination offset (summary only)
- `limit` (optional, default: 10) – Results per page (summary only)
- `sortBy` (optional, default: `count`) – `count` or `time`
- `interval` (optional, default: `yearly`) – `daily`, `monthly`, or `yearly` (bump/listeningtime only; bump excludes daily)

**Authentication:** Spotify OAuth required for all endpoints that access user data
(except demo mode, if enabled).

## Architecture Highlights

### LRU Cache

- Custom in-memory LRU cache with TTL expiration for user listening data
- Reduces R2 fetches from ~500ms to sub-millisecond on cache hit
- Thread-safe with `sync.Mutex` and `container/list`
- Located in `server/internal/cache/userDataCache.go`

### Blob Storage Strategy

- User listening history (~28MB JSON per user) stored in Cloudflare R2 rather than
  database rows
- Avoids SQLite/Turso row limits and reduces DB costs
- Storage operations in `server/internal/storage/`
- Configurable for AWS S3 or other providers

### Type-Safe SQL

- All database queries generated via `sqlc` for compile-time safety
- Queries defined in `server/sql/queries/`
- Schema in `server/sql/schema/`

### Bump Chart Data

- Generates ranking trends over time periods (monthly/yearly)
- Tracks top 10 items per period with ranking positions
- Located in `server/internal/bump/bumpchart.go`

## Project Structure
```
.
├── server/                          # Go backend
│   ├── cmd/                         # Entrypoint (main.go)
│   ├── internal/                    # Application code (handlers, auth, parsing, analytics)
│   │   ├── auth/                    # OAuth + JWT
│   │   ├── authcode/                # Auth code flow helpers
│   │   ├── bump/                    # Bump chart data generation
│   │   ├── cache/                   # User data LRU cache + TTL
│   │   ├── config/                  # Env/config loading
│   │   ├── constants/               # Shared constants
│   │   ├── database/                # DB access/models (sqlc outputs live under server/internal/database/)
│   │   ├── dbConn/                  # DB connection helpers
│   │   ├── handlers/                # HTTP handlers (summary, upload, bump, auth, etc.)
│   │   ├── middleware/              # Auth + demo middleware
│   │   ├── parser/                  # Spotify JSON/ZIP parsing + minification
│   │   ├── server/                  # Routes + server wiring
│   │   ├── services/                # Service layer (storage orchestration, etc.)
│   │   ├── spotify/                 # Spotify API client + metadata fetching
│   │   ├── storage/                 # Cloudflare R2 storage client (upload/download/delete)
│   │   ├── summary/                 # Analytics + aggregation logic
│   │   ├── utils/                   # Shared helpers (responses, etc.)
│   │   └── validation/              # Query param validation + tests
│   ├── sql/                         # SQL schema + queries (sqlc inputs)
│   │   ├── schema/                  # Migrations
│   │   └── queries/                 # Query definitions
│   ├── scripts/                     # Utility scripts (e.g. entrypoint)
│   ├── Dockerfile                   # Backend container build
│   ├── docker-compose.yml           # Local dev stack
│   ├── Makefile                     # Common build/run/migrate targets
│   ├── sqlc.yaml                    # sqlc configuration
│   └── fly.toml                     # Fly.io deployment config
│
├── web/                             # React + TypeScript frontend (Vite)
│   ├── src/
│   │   ├── pages/                   # Route pages (Home, Summary, Upload, Charts)
│   │   ├── components/              # Reusable UI components (NavBar, FilterControls, etc.)
│   │   ├── hooks/                   # Data fetching + auth hooks (TanStack Query)
│   │   ├── services/                # API clients/wrappers
│   │   ├── context/                 # Auth context/provider
│   │   ├── types/                   # Shared TS types (Summary, Bump, etc.)
│   │   ├── utils/                   # Helpers (formatting, conversion, theme)
│   │   ├── config/                  # Frontend constants/config
│   │   ├── routes.tsx               # TanStack Router route definitions
│   │   ├── main.tsx                 # React entrypoint
│   │   └── index.css                # Global styles
│   ├── public/                      # Static assets
│   ├── vite.config.ts               # Vite config + proxy
│   ├── tsconfig*.json               # TypeScript configs
│   ├── package.json                 # Frontend deps/scripts
│   └── bun.lock                     # Bun lockfile
│
└── README.md
```

## Roadmap

- [ ] Advanced analytics (genre filtering, time series, clustering)
- [ ] Exportable reports (CSV, JSON)
- [ ] Shareable summary links

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
