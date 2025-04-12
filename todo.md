## ✅ TODO: Spotify Wrapped-Style Web App (Capstone)

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
- [✅]Load and combine large `.json` files into one list
- [✅] Map to Go structs (already prepared)
- [✅] Normalize timestamp, duration, artist, etc.
- [✅] Filter bad/incomplete entries
- [✅] Save parsed data to memory or temp file (optional: DB)

---

### 📊 Phase 4: Data Analysis (6–8h)
- [ ] Calculate:
  - [ ] Top artists
  - [ ] Top tracks
  - [ ] Total minutes listened
  - [ ] Most active time of day / day of week
- [ ] Optional: generate audio feature-based summaries (if available)
- [ ] Generate yearly/monthly summaries
- [ ] Return results as JSON for frontend

---

### 🔐 Phase 5: Spotify Authentication (2–4h)
- [ ] Set up Spotify Developer credentials (Client ID, Secret, Redirect URI)
- [ ] Create `/login` route to redirect user to Spotify authorization URL
- [ ] Handle `/callback` route to receive code and exchange it for access token
- [ ] Fetch and display user profile (optional)
- [ ] Store access token for later use (in session/memory)

### Phase 5.5: Optional DB
- [ ] Create a database to store/cache existing user data uploaded from zip/json
- [ ] Offload database to Turso
---

### 💻 Phase 6: Frontend Visualization (8–10h)
- [ ] Build dashboard UI in React (or Svelte/Vue)
- [ ] Display:
  - [ ] Top artists (bar chart or cards)
  - [ ] Listening patterns over time (line/heatmap)
  - [ ] Total minutes / most active periods (donut/pie)
  - [ ] Searchable table of tracks (filter by artist/date)
- [ ] Add animation or scroll transitions ("Wrapped" style)
- [ ] Allow reset / upload another ZIP

---

### 🧪 Phase 7: Polish & Extras (4–6h)
- [ ] Add error handling for bad ZIPs / no data
- [ ] Improve mobile layout/responsiveness
- [ ] Optional: export data as image or PDF
- [ ] Optional: add login/auth for saving sessions
- [ ] Deploy to Fly.io / Vercel / Render

---

### 🧠 Stretch Ideas
- [ ] Cluster listening habits by mood/genre using ML
- [ ] Add genre detection (based on Spotify metadata if available)
- [ ] Compare multiple users (upload two sets of data)
- [ ] Match songs to Spotify audio features (via API)
- [ ] Build a shareable "MyWrapped" page (with public link)
