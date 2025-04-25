## ✅ TODO: Spotify Wrapped‑Style Web App (Capstone)

### 🎯 Goal  
Build a web app that lets users upload their Spotify data export (ZIP), parses and analyzes their listening history, and shows an interactive "Wrapped"-style dashboard.

---

### 🧱 Phase 1: Setup (2h)  
- [✅] Create frontend + backend project structure  
- [✅] Set up basic web page with file upload UI  
- [✅] Set up backend API (FastAPI or Go)  
- [✅] Connect frontend to backend  

---

### 📂 Phase 2: File Handling (4–5h)  
- [✅] Accept `.zip` file upload from frontend  
- [✅] Unzip contents on server (use temp directory)  
- [✅] Locate relevant files (e.g. `StreamingHistory*.json`, `endsong*.json`)  
- [✅] Send to JSON parser  

---

### 📄 Phase 3: JSON Parsing & Struct Conversion (6–8h)  
- [✅] Load and combine large `.json` files into one list  
- [✅] Map to Go structs (already prepared)  
- [✅] Normalize timestamp, duration, artist, etc.  
- [✅] Filter bad/incomplete entries  
- [✅] Save parsed data to memory or temp file (optional: DB)  

---

### 📊 Phase 4: Data Analysis (6–8h)  
- [✅] Calculate:  
  - [✅] Top artists  
  - [✅] Top tracks  
  - [✅] Total minutes listened  
- [✅] Generate yearly/monthly summaries  
- [✅] Return results as JSON for frontend  

---

### 🔐 Phase 5: Spotify Authentication (2–4h)  
- [✅] Set up Spotify Developer credentials (Client ID, Secret, Redirect URI)  
- [✅] Create `/login` route to redirect user to Spotify authorization URL  
- [✅] Handle `/callback` route to receive code and exchange it for access token  
- [ ] Fetch and display user profile (optional)  
- [✅] Store access token for later use (in session/memory)  

---

### 🗄️ Phase 6: Persistence & Containerization (4–6h)  
- [✅] Add SQLite driver (`github.com/mattn/go-sqlite3`) to `go.mod`  
- [✅] Create `db/schema.sql` with a `user_data` table (`user_id TEXT PRIMARY KEY, data BLOB, updated_at DATETIME`)  
- [✅] Write parameterized queries in `db/queries/*.sql` and configure `sqlc.yaml`  
- [✅] Run `sqlc generate` to produce type‑safe Go bindings  
- [✅] Wire up DB initialization in `main.go` (open `userdata.sqlite`, apply `CREATE TABLE IF NOT EXISTS …`)  
- [✅] In **UploadHandler**, serialize parsed data to JSON and call `queries.UpdateUserData(ctx, userID, blob)`  
- [✅] In **SummaryHandler**, call `queries.GetUserData(ctx, userID)`, unmarshal and return analysis JSON  
- [✅] Write a `Dockerfile` that:  
  - Builds the Go binary (incl. running `sqlc generate` if desired)  
  - Installs `sqlite3` CLI (for debugging)  
  - Copies in `web/`, `db/migrations/`, and your binary  
  - Uses an entrypoint script to run Goose migrations or `CREATE TABLE IF NOT EXISTS` before starting  
- [✅] (Optional) Add `docker-compose.yml` mounting `./data:/data` so `userdata.sqlite` persists across restarts  
- [✅] Test the Docker container end‑to‑end: upload, query summary, then restart and verify data still there  

---

### 💻 Phase 7: Frontend Visualization (8–10h)  
- [ ] Build dashboard UI in vanilla JS  
- [ ] Display:  
  - [ ] Top artists (bar chart or cards)  
  - [ ] Listening patterns over time (line/heatmap)  
  - [ ] Total minutes / most active periods (donut/pie)  
  - [ ] Searchable table of tracks (filter by artist/date)  
- [ ] Add animation or scroll transitions ("Wrapped" style)  
- [ ] Allow reset / upload another ZIP  

---

### 🧪 Phase 8: Polish & Extras (4–6h)  
- [ ] Add error handling for bad ZIPs / no data  
- [ ] Improve mobile layout/responsiveness  
- [ ] Optional: export data as image or PDF  
- [ ] Optional: add additional login/auth for saving sessions  
- [ ] Deploy to Fly.io / Vercel / Render  

---

### 🧠 Stretch Ideas  
- [ ] Cluster listening habits by mood/genre using ML  
- [ ] Add genre detection (based on Spotify metadata if available)  
- [ ] Compare multiple users (upload two sets of data)  
- [ ] Match songs to Spotify audio features (via API)  
- [ ] Build a shareable "MyWrapped" page (with public link)  
