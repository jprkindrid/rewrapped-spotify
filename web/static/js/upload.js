document.addEventListener('DOMContentLoaded', function() {
  // DOM elements
  const uploadForm = document.getElementById('upload-form');
  const fileUpload = document.getElementById('file-upload');
  const fileNames = document.getElementById('file-names');
  const uploadButton = document.getElementById('upload-button');
  const uploadStatus = document.getElementById('upload-status');
  const resultsSection = document.getElementById('results-section');
  const totalTracksElement = document.getElementById('total-tracks');
  const totalArtistsElement = document.getElementById('total-artists');
  const totalTimeElement = document.getElementById('total-time');
  const artistsChartElement = document.getElementById('artists-chart');
  const tracksChartElement = document.getElementById('tracks-chart');
  const startDateInput = document.getElementById('start-date');
  const endDateInput = document.getElementById('end-date');
  const applyFiltersBtn = document.getElementById('apply-filters');
  const resetFiltersBtn = document.getElementById('reset-filters');
  const logoutBtn = document.getElementById('logout-button');
  const deleteBtn = document.getElementById('delete-button');
  const yearButtonsContainer = document.querySelector('.year-buttons');


  // Per-section state
  const PAGE_SIZE = 10;
  const sectionState = {
    artists: { currentPage: 1, totalPages: 1, sort: 'count' },
    tracks: { currentPage: 1, totalPages: 1, sort: 'count' }
  };

  // --- File selection ---
  fileUpload.addEventListener('change', function() {
    if (this.files.length > 0) {
      let names = Array.from(this.files).map(file => file.name).join(', ');
      fileNames.textContent = names;
      uploadButton.disabled = false;
    } else {
      fileNames.textContent = 'No files selected';
      uploadButton.disabled = true;
    }
  });

  // --- File upload ---
  uploadForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    if (fileUpload.files.length === 0) {
      alert('Please select at least one file to upload');
      return;
    }
    uploadStatus.classList.remove('hidden');
    uploadButton.disabled = true;
    try {
      const formData = new FormData();
      for (let i = 0; i < fileUpload.files.length; i++) {
        formData.append('file', fileUpload.files[i]);
      }
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      const data = await response.json();
      uploadStatus.classList.add('hidden');
      uploadButton.disabled = false;
      fileUpload.value = '';
      fileNames.textContent = 'No files selected';
      resultsSection.classList.remove('hidden');
      if (!data.error) {
        // Reset filters and pagination on new upload
        startDateInput.value = '';
        endDateInput.value = '';
        sectionState.artists.currentPage = 1;
        sectionState.tracks.currentPage = 1;
        fetchAndDisplaySection('artists');
        fetchAndDisplaySection('tracks');
      } else {
        displayNoUserData();
      }
    } catch (error) {
      uploadStatus.classList.add('hidden');
      uploadButton.disabled = false;
      displayNoUserData();
    }
  });

  // --- Filters ---
  applyFiltersBtn.addEventListener('click', function() {
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    if (startDate && endDate) {
      sectionState.artists.currentPage = 1;
      sectionState.tracks.currentPage = 1;
      fetchAndDisplaySection('artists');
      fetchAndDisplaySection('tracks');
    } else {
      alert('Please select both start and end dates');
    }
  });
  resetFiltersBtn.addEventListener('click', function() {
    startDateInput.value = '';
    endDateInput.value = '';
    sectionState.artists.currentPage = 1;
    sectionState.tracks.currentPage = 1;
    fetchAndDisplaySection('artists');
    fetchAndDisplaySection('tracks');
  });

  // --- Sort Buttons ---
  document.querySelectorAll('.sort-buttons').forEach(container => {
    const section = container.dataset.section;
    const buttons = container.querySelectorAll('.sort-button');
    buttons.forEach(button => {
      button.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        button.classList.add('active');
        sectionState[section].sort = button.dataset.sort;
        sectionState[section].currentPage = 1;
        fetchAndDisplaySection(section);
      });
    });
  });

  // --- Pagination Buttons ---
  function setupPagination(section) {
    const prev100Btn = document.getElementById(`${section}-prev-100`);
    const prev10Btn = document.getElementById(`${section}-prev-10`);
    const prevBtn = document.getElementById(`${section}-prev-page`);
    const nextBtn = document.getElementById(`${section}-next-page`);
    const next10Btn = document.getElementById(`${section}-next-10`);
    const next100Btn = document.getElementById(`${section}-next-100`);
    const pageInfo = document.getElementById(`${section}-page-info`);

    prevBtn.addEventListener('click', function() {
      if (sectionState[section].currentPage > 1) {
        sectionState[section].currentPage--;
        fetchAndDisplaySection(section);
      }
    });
    nextBtn.addEventListener('click', function() {
      if (sectionState[section].currentPage < sectionState[section].totalPages) {
        sectionState[section].currentPage++;
        fetchAndDisplaySection(section);
      }
    });

    prev10Btn.addEventListener('click', function() {
      if (sectionState[section].currentPage > 1) {
        sectionState[section].currentPage = Math.max(1, sectionState[section].currentPage - 10);
        fetchAndDisplaySection(section);
      }
    });
    next10Btn.addEventListener('click', function() {
      if (sectionState[section].currentPage < sectionState[section].totalPages) {
        sectionState[section].currentPage = Math.min(sectionState[section].totalPages, sectionState[section].currentPage + 10);
        fetchAndDisplaySection(section);
      }
    });

    prev100Btn.addEventListener('click', function() {
      if (sectionState[section].currentPage > 1) {
        sectionState[section].currentPage = Math.max(1, sectionState[section].currentPage - 100);
        fetchAndDisplaySection(section);
      }
    });
    next100Btn.addEventListener('click', function() {
      if (sectionState[section].currentPage < sectionState[section].totalPages) {
        sectionState[section].currentPage = Math.min(sectionState[section].totalPages, sectionState[section].currentPage + 100);
        fetchAndDisplaySection(section);
      }
    });

    sectionState[section].updatePaginationDisplay = function() {
      pageInfo.textContent = `Page ${sectionState[section].currentPage} of ${sectionState[section].totalPages}`;
      prevBtn.disabled = sectionState[section].currentPage <= 1;
      nextBtn.disabled = sectionState[section].currentPage >= sectionState[section].totalPages;
      prev10Btn.disabled = sectionState[section].currentPage <= 1;
      next10Btn.disabled = sectionState[section].currentPage >= sectionState[section].totalPages;
      prev100Btn.disabled = sectionState[section].currentPage <= 1;
      next100Btn.disabled = sectionState[section].currentPage >= sectionState[section].totalPages;
    };
  }
  setupPagination('artists');
  setupPagination('tracks');

  // --- Fetch and display only the requested section ---
  async function fetchAndDisplaySection(section) {
    // Show loading for the section
    if (section === 'artists') {
      artistsChartElement.innerHTML = '<p>Loading artist data...</p>';
    } else if (section === 'tracks') {
      tracksChartElement.innerHTML = '<p>Loading track data...</p>';
    }

    // Build query parameters
    const params = new URLSearchParams();
    params.append('offset_artists', (sectionState.artists.currentPage - 1) * PAGE_SIZE);
    params.append('offset_tracks', (sectionState.tracks.currentPage - 1) * PAGE_SIZE);
    params.append('limit', PAGE_SIZE);
    params.append('sort_by_artists', sectionState.artists.sort);
    params.append('sort_by_tracks', sectionState.tracks.sort);

    // Add start/end if present
    const startISO = getDateISOString(startDateInput.value, true);
    const endISO = getDateISOString(endDateInput.value, false);
    if (startISO) params.append('start', startISO);
    if (endISO) params.append('end', endISO);

    try {
      const response = await fetch(`/api/summary?${params.toString()}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('No user data');
      const data = await response.json();

      // Defensive: If backend returns error or empty
      if (data.error || (!data.top_artists && !data.top_tracks)) {
        displayNoUserData();
        return;
      }

      // Update stats (optional, or only on first load/filter)
      totalTracksElement.textContent = data.total_tracks_count ?? '-';
      totalArtistsElement.textContent = data.total_artists_count ?? '-';
      const totalHours = Math.floor((data.total_time_listening || 0) / (60000 * 60));
      const totalMinutes = Math.floor(((data.total_time_listening || 0) % (60000 * 60)) / 60000);
      totalTimeElement.textContent = `${totalHours}h ${totalMinutes}m`;

      // Only update the section that was requested
      if (section === 'artists') {
        sectionState.artists.totalPages = Math.max(1, Math.ceil((data.total_artists_count || 0) / PAGE_SIZE));
        sectionState.artists.updatePaginationDisplay();
        displayTopArtists(data.top_artists || []);
      } else if (section === 'tracks') {
        sectionState.tracks.totalPages = Math.max(1, Math.ceil((data.total_tracks_count || 0) / PAGE_SIZE));
        sectionState.tracks.updatePaginationDisplay();
        displayTopTracks(data.top_tracks || []);
      }

      resultsSection.classList.remove('hidden');
    } catch (error) {
      displayNoUserData();
    }
  }

  // --- Display functions with numbering ---
  function displayTopArtists(artists) {
    artistsChartElement.innerHTML = '';
    if (!artists.length) {
      artistsChartElement.innerHTML = '<p>No user data</p>';
      return;
    }
    const list = document.createElement('ul');
    list.className = 'stats-list';
    const startIndex = (sectionState.artists.currentPage - 1) * PAGE_SIZE;
    artists.forEach((artist, i) => {
      const minutes = Math.floor(artist.TotalMs / 60000);
      const li = document.createElement('li');
      li.innerHTML = `<span class="entry-number">${startIndex + i + 1}.</span> <strong>${artist.Name}</strong> - ${minutes} minutes (${artist.Count} plays)`;
      list.appendChild(li);
    });
    artistsChartElement.appendChild(list);
  }

  function displayTopTracks(tracks) {
    tracksChartElement.innerHTML = '';
    if (!tracks.length) {
      tracksChartElement.innerHTML = '<p>No user data</p>';
      return;
    }
    const list = document.createElement('ul');
    list.className = 'stats-list';
    const startIndex = (sectionState.tracks.currentPage - 1) * PAGE_SIZE;
    tracks.forEach((track, i) => {
      const minutes = Math.floor(track.TotalMs / 60000);
      const li = document.createElement('li');
      li.innerHTML = `<span class="entry-number">${startIndex + i + 1}.</span> <strong>${track.Name}</strong> - ${minutes} minutes (${track.Count} plays)`;
      list.appendChild(li);
    });
    tracksChartElement.appendChild(list);
  }

  function displayNoUserData() {
    totalTracksElement.textContent = '-';
    totalArtistsElement.textContent = '-';
    totalTimeElement.textContent = '-';
    artistsChartElement.innerHTML = '<p>No user data</p>';
    tracksChartElement.innerHTML = '<p>No user data</p>';
    sectionState.artists.totalPages = 1;
    sectionState.tracks.totalPages = 1;
    sectionState.artists.updatePaginationDisplay();
    sectionState.tracks.updatePaginationDisplay();
  }

  // --- Date helpers ---
  function getDateISOString(dateStr, isStart) {
    if (!dateStr) return null;
    return isStart
      ? `${dateStr}T00:00:00Z`
      : `${dateStr}T23:59:59Z`;
  }

  // --- Logout ---
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async function() {
      try {
        const response = await fetch('/auth/logout', {
          method: 'POST',
          credentials: 'include'
        });
        if (response.ok) {
          window.location.href = '/';
        } else {
          alert('Logout failed.');
        }
      } catch (err) {
        alert('Logout failed.');
      }
    });
  }

  // --- Delete User Data ---
  if (deleteBtn) {
      deleteBtn.addEventListener('click', async function(event) {
        event.preventDefault();

        if (!confirm('Are you sure you want to delete all your data?')) return;
        try {
          const response = await fetch('/api/delete', {
            method: 'DELETE',
            credentials: 'include'
          });
          if (response.ok) {
            alert('Your data has been successfully deleted')
            window.location.href = '/';
          } else {
            alert('Delete failed');
          }
        } catch (err) {
          alert('Delete call failed.');
        }
      });
    }

  // --- Year Buttons ---
  const YEAR_START = 2011;
  const YEAR_END = 2025;

  function setYearButtonsActive(year) {
    document.querySelectorAll('.year-button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.year === String(year));
    });
  }

  for (let y = YEAR_START; y <= YEAR_END; y++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'year-button';
    btn.textContent = y;
    btn.dataset.year = y;
    btn.addEventListener('click', function() {
      // Set date pickers to this year
      startDateInput.value = `${y}-01-01`;
      endDateInput.value = `${y}-12-31`;
      setYearButtonsActive(y);
      sectionState.artists.currentPage = 1;
      sectionState.tracks.currentPage = 1;
      fetchAndDisplaySection('artists');
      fetchAndDisplaySection('tracks');
    });
    yearButtonsContainer.appendChild(btn);
  }

  // Optional: clear year button highlight when filters are manually changed
  [startDateInput, endDateInput].forEach(input => {
    input.addEventListener('input', () => setYearButtonsActive(null));
  });

  // --- On page load ---
  fetchAndDisplaySection('artists');
  fetchAndDisplaySection('tracks');
});
