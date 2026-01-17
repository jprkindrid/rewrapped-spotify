# ReWrapped Spotify

Explore and visualize your Spotify listening history with interactive insights. Upload your Spotify data and discover your top tracks, artists, and listening patterns.

**Live Demo:** https://rewrapped-spotify.pages.dev/

## About

ReWrapped Spotify is a full-stack web application that lets you:
- Securely upload your Spotify streaming history (downloaded from [Spotify's privacy portal](https://www.spotify.com/account/privacy/))
- Explore personalized listening insights with interactive visualizations
- Filter data by date ranges and view detailed statistics
- Authenticate securely via Spotify OAuth

## Features

- **Spotify OAuth Login** – Secure authentication via Spotify
- **File Upload** – Support for Spotify's JSON or ZIP streaming history exports
- **Interactive Stats** – Top tracks, top artists, total listening time, activity trends
- **Date Filtering** – Filter your data by custom date ranges
- **Pagination & Search** – Easily browse through your listening history
- **Modern UI** – React + TypeScript frontend with Tailwind CSS
- **Secure Storage** – SQLite for development, Turso for production

## Technology Stack

**Backend:**
- Go 1.25+ with `net/http`
- SQLite for development / Turso (LibSQL) for production with `sqlc` for type-safe queries
- Goth for Spotify OAuth
- RESTful API

**Frontend:**
- React 19 with TypeScript
- Vite bundler
- TanStack Query & Router
- Tailwind CSS for styling
- Bun package management

**Deployment:**
- Docker for containerization
- Fly.io (API) & Cloudflare Pages (frontend) for hosting

## Prerequisites

- **Go** 1.25+ ([download](https://golang.org/doc/install))
- **Node.js** 16+ and **bun** (or npm/pnpm/yarn) for frontend
- **SQLite** (included in most systems)
- **Docker** (optional, for containerized setup)
- **Spotify Developer Account** ([create here](https://developer.spotify.com/dashboard)) with Client ID/Secret

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/jprkindrid/rewrapped-spotify.git
cd rewrapped-spotify
```

### 2. Configure Backend

Navigate to the server directory and set up environment variables:

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

Note: Easily replacable with AWS S3 Bucket

# Optional: Database
# For Development (SQLite - default):
DB_PATH=data/userdata.sqlite
DB_PATH_DOCKER=data/userdata.sqlite
# For Production (Turso):
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=your_turso_token

# Optional: Server
PORT=8080
PRODUCTION_BUILD=FALSE (must be TRUE on deployment)

# Optional: Demo Mode
DEMO_KEY: Key to authenticate demo on client in lieu of jwt token derived from user id
KINDRID_USER_ID: Whatever Spotify user ID you want to use for the demo. I used my own, hence "kindrid user ID"
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

The frontend will be available at `http://127.0.0.1:5173` and will proxy API calls to the backend at `http://127.0.0.1:8080`.

> **Note:** Make sure the backend is running before starting the frontend.

## � API Reference

The backend exposes a REST API for uploading and retrieving listening data.

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload streaming history (JSON or ZIP) |
| GET | `/api/summary` | Retrieve listening summary with filters |
| GET | `/auth/spotify` | Begin Spotify OAuth login |
| GET | `/auth/spotify/callback` | OAuth callback handler |
| POST | `/auth/logout` | Log out |

### Example Summary Request

```bash
GET /api/summary?start=2023-01-01T00:00:00Z&end=2023-12-31T23:59:59Z&offset=0&limit=10
```

**Query Parameters:**
- `start` (optional) – Start date in RFC3339 format
- `end` (optional) – End date in RFC3339 format
- `offset` (optional) – Pagination offset
- `limit` (optional, default: 10) – Results per page

**Authentication:** Spotify OAuth required for all endpoints that access user data.

## Architecture Highlights

- **LRU Cache** – Custom in-memory LRU cache with TTL expiration for user listening data. Reduces R2 fetches from ~500ms to sub-millisecond on cache hit. Thread-safe with `sync.Mutex` and `container/list`.

- **Blob Storage Strategy** – User listening history (~28MB JSON per user) stored in Cloudflare R2 rather than database rows. Avoids SQLite/Turso row limits and reduces DB costs.

- **Type-Safe SQL** – All database queries generated via `sqlc` for compile-time safety.

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Commit your work (`git commit -am 'Add your feature'`)
5. Push to the branch (`git push origin feature/your-feature`)
6. Open a Pull Request to `main`

## � Usage Guide

1. **Login with Spotify**
   - Click "Login with Spotify" on the homepage
   - Authorize the application to access your account

2. **Get Your Data**
   - Visit [Spotify Account Settings → Privacy](https://www.spotify.com/account/privacy/)
   - Request your data download (arrives via email in ~30 days)
   - Extract the ZIP file

3. **Upload Your Files**
   - Navigate to "Upload & Analyze" page
   - Upload your Spotify streaming history files (JSON or ZIP)
   - Wait for processing to complete

4. **Explore Your Stats**
   - View your top tracks and artists
   - Filter by custom date ranges
   - Analyze your listening patterns and trends

## � Project Structure

```
.
├── server/                          # Go backend
│   ├── cmd/main.go                 # Application entrypoint
│   ├── internal/
│   │   ├── auth/                   # OAuth & JWT authentication
│   │   ├── handlers/               # HTTP request handlers
│   │   ├── database/               # Database models & queries
│   │   ├── parser/                 # Spotify history parsing
│   │   ├── spotify/                # Spotify API client
│   │   ├── storage/                # File storage operations
│   │   ├── summary/                # Analytics & summary logic
│   │   └── ...                     # Other internal packages
│   ├── sql/                        # Database schema & queries
│   ├── scripts/                    # Utility scripts
│   └── Dockerfile                  # Container configuration
│
├── web/                            # React + TypeScript frontend
│   ├── src/
│   │   ├── pages/                 # Page components (Home, Summary, Upload)
│   │   ├── components/            # Reusable UI components
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── services/              # API client wrappers
│   │   ├── context/               # Auth context & providers
│   │   ├── utils/                 # Utility functions & types
│   │   ├── main.tsx               # React entry point
│   │   ├── routes.tsx             # Route definitions
│   │   └── index.css              # Global styles
│   ├── vite.config.ts             # Vite configuration with API proxy
│   ├── package.json               # Dependencies & scripts
│   └── index.html                 # HTML entry
│
└── README.md                       # This file
```

## Roadmap

- [ ] Advanced analytics (genre filtering, time series, clustering)
- [ ] Exportable reports (CSV, JSON)
- [ ] Shareable summary links
- [ ] Queryable over time charts

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
