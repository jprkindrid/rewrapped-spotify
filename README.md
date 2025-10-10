# ReWrapped Spotify

#  ⚠️UNDER RECONSTRUCTION⚠️

**ReWrapped Spotify** is a web application that helps you explore and visualize your Spotify listening history. Upload your Spotify data and discover your top tracks, artists, and listening patterns over time.

## 🚀 What is ReWrapped Spotify?

ReWrapped Spotify lets you securely upload your Spotify streaming history (downloaded from Spotify’s privacy portal) and provides interactive insights, such as:

- Top tracks and artists
- Total listening time
- Activity by date and hour
- Trends and patterns in your music habits

## ✨ Features

- **Spotify OAuth Login:** Secure authentication using your Spotify account.
- **Data Upload:** Supports both JSON and ZIP files from Spotify’s data export.
- **Personalized Stats:** See your most played tracks, artists, and total listening time.
- **Filtering & Pagination:** Filter results by date range and browse large histories.
- **Interactive Charts:** Visualize your listening activity and trends.
- **Privacy:** All data is stored locally in a SQLite database; nothing is shared externally.

## 🛠️ Technology Stack

- **Backend:** Go (Golang), net/http, SQLite, sqlc, Goth (Spotify OAuth)
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Database:** SQLite (local file)
- **Containerization:** Docker, Docker Compose

## 📦 Prerequisites

- Go 1.24+
- SQLite
- Docker (optional, for containerized deployment)
- Spotify account (for OAuth login)

## ⚡ Setup & Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/kindiregg/spotify-data-analyzer.git
   cd spotify-data-analyzer
   ```

2. **Download Go dependencies:**
   ```sh
   go mod download
   ```

3. **Install Goose (database migration tool):**
   ```sh
   go install github.com/pressly/goose/v3/cmd/goose@latest
   ```
   Make sure `$GOPATH/bin` (or `$HOME/go/bin`) is in your PATH.

4. **Configure environment variables:**
   - Copy `.env` and fill in your Spotify API credentials
   - Required fields:
   ```
    SPOTIFY_CLIENT_ID = "" (from your spotify dev dashboard)
    SPOTIFY_CLIENT_SECRET = "" (from your spotify dev dashboard)
    SPOTIFY_REDIRECT_URI = "" (set this in your spotify dev dashboard)
    PORT = "8080"
    DB_PATH = "data/userdata.sqlite"
    DB_PATH_DOCKER = "/data/userdata.sqlite" (absolute path for persistent db in docker)
    URL_ADDR = "127.0.0.1" (for local dev(spotify requires 127.0.0.1 instead of localhost))
    ```

5. **Run database migrations:**
   ```sh
   ./scripts/gsup.sh
   ```

6. **Start the server:**
   ```sh
   go build -o out ./cmd && ./out
   ```
   Or with Docker:
   ```sh
   docker-compose up --build
   ```

7. **Access the app:**
   - Open [http://127.0.0.1:8080](http://127.0.0.1:8080) in your browser.

## 🛠️ API Overview

The backend provides the following main RESTful endpoints:

- `POST /api/upload` — Upload your Spotify data (JSON or ZIP)
- `GET /api/summary` — Get your listening summary (supports filtering by date, pagination)
- `GET /auth/spotify` — Start Spotify OAuth login
- `GET /auth/spotify/callback` — Spotify OAuth callback
- `POST /auth/logout` — Log out of your session

### Example: Get Listening Summary

```
GET /api/summary?start=2023-01-01T00:00:00Z&end=2023-12-31T23:59:59Z&offset=0&limit=10
```

**Query Parameters:**
- `start` (optional, RFC3339): Start date for filtering
- `end` (optional, RFC3339): End date for filtering
- `offset` (optional): Pagination offset
- `limit` (optional): Pagination limit (default 10)

**Response:**
```json
{
  "offset": 0,
  "limit": 10,
  "total_artists_count": 42,
  "total_tracks_count": 100,
  "top_artists": [ ... ],
  "top_tracks": [ ... ],
  "total_time_listening": 12345678
}
```

Authentication is required for all endpoints except the homepage and login.

## 🤝 Contributing

Contributions are very welcome! 
If you would like to contribute please fork the repo and create a pull request to the `main` branch.

## 📝 Usage

1. **Login with Spotify:** Click "Login with Spotify" on the homepage.
2. **Download your data:** Visit [Spotify Privacy Settings](https://www.spotify.com/account/privacy/) and request your data.
3. **Upload your files:** Go to the "Upload & Analyze" page and upload your streaming history files.
4. **Explore your stats:** View your top tracks, artists, and listening trends.

## 🗺️ Project Structure

- `cmd/` – Main application entrypoint
- `internal/` – Backend logic (auth, handlers, database, parsing, summary)
- `web/static/` – Frontend assets (HTML, CSS, JS)
- `sql/` – Database schema and queries
- `scripts/` – Helper scripts for build and migration

## 🚧 Future Enhancements

- Artist images and richer metadata
- More advanced analytics (e.g., genre trends)
- Exportable reports
- Mobile-friendly UI

## 📄 License

MIT
