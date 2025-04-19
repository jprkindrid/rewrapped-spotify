const uploadBtn           = document.getElementById('uploadBtn');
const fileInput           = document.getElementById('zipFileInput');
const resultsContainer    = document.getElementById('results');
const paginationContainer = document.getElementById('pagination');

// ───────────────────────────────────────────────────────────
// Helper: if we get a 401, kick off Spotify login
// ───────────────────────────────────────────────────────────
async function requireAuth(response) {
  if (response.status === 401) {
    // redirect to your login route
    window.location.href = '/auth/spotify';
    // throw to stop further processing
    throw new Error('Redirecting to login…');
  }
  return response;
}

// ───────────────────────────────────────────────────────────
// Upload ZIP/JSON to /api/upload
// ───────────────────────────────────────────────────────────
uploadBtn.addEventListener('click', async () => {
  if (!fileInput.files.length) {
    alert('Please choose a ZIP or JSON file.');
    return;
  }
  const fd = new FormData();
  fd.append('file', fileInput.files[0]);

  try {
    let res = await fetch('/api/upload', { method: 'POST', body: fd });
    await requireAuth(res);
    if (!res.ok) throw new Error(await res.text());
    alert('Upload successful!');
    loadPage(0); // fetch the first page of summary
  } catch (err) {
    // If it's our redirect‑trigger error, do nothing else
    if (err.message === 'Redirecting to login…') return;
    alert(err.message);
  }
});

// ───────────────────────────────────────────────────────────
// Fetch paged summary from /api/summary?offset=&limit=
// ───────────────────────────────────────────────────────────
async function loadPage(offset = 0, limit = 10) {
  resultsContainer.innerHTML = 'Loading…';
  try {
    let res = await fetch(`/api/summary?offset=${offset}&limit=${limit}`);
    await requireAuth(res);
    if (!res.ok) throw new Error('Failed to fetch summary');
    const data = await res.json();
    renderResults(data.top_artists, data.top_tracks);
    renderPagination(offset, limit, data.total_artists_count, loadPage);
  } catch (err) {
    if (err.message === 'Redirecting to login…') return;
    resultsContainer.textContent = err.message;
  }
}

// ───────────────────────────────────────────────────────────
// Render cards for artists & tracks
// ───────────────────────────────────────────────────────────
function renderResults(artists, tracks) {
  resultsContainer.innerHTML = '';

  const makeCard = (title, list) => {
    const wrap = document.createElement('div');
    wrap.className = 'card';
    wrap.innerHTML = `
      <h3 style="margin-top:0">${title}</h3>
      <pre style="white-space:pre-wrap;font-size:.85rem">${JSON.stringify(list, null, 2)}</pre>
    `;
    return wrap;
  };

  resultsContainer.appendChild(makeCard('Top Artists', artists));
  resultsContainer.appendChild(makeCard('Top Tracks',  tracks));
}

// ───────────────────────────────────────────────────────────
// Simple pagination controls
// ───────────────────────────────────────────────────────────
function renderPagination(offset, limit, total, onClick) {
  paginationContainer.innerHTML = '';
  const totalPages = Math.ceil(total / limit);
  const current    = Math.floor(offset / limit);

  if (totalPages <= 1) return;

  for (let i = 0; i < totalPages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i + 1;
    btn.className   = 'page-btn' + (i === current ? ' active' : '');
    btn.onclick     = () => onClick(i * limit, limit);
    paginationContainer.appendChild(btn);
  }
}
