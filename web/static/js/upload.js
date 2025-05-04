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

  // Filters and pagination
  const startDateInput = document.getElementById('start-date');
  const endDateInput = document.getElementById('end-date');
  const applyFiltersBtn = document.getElementById('apply-filters');
  const resetFiltersBtn = document.getElementById('reset-filters');
  const prevPageBtn = document.getElementById('prev-page');
  const nextPageBtn = document.getElementById('next-page');
  const pageInfoSpan = document.getElementById('page-info');
  const logoutBtn = document.getElementById('logout-button');
  const yearButtonsContainer = document.querySelector('.year-buttons');

  // Pagination state
  const PAGE_SIZE = 10;
  let currentPage = 1;
  let totalPages = 1;

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
              currentPage = 1;
              await fetchAndDisplaySummary();
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
          currentPage = 1;
          fetchAndDisplaySummary(startDate, endDate, currentPage);
      } else {
          alert('Please select both start and end dates');
      }
  });
  resetFiltersBtn.addEventListener('click', function() {
      startDateInput.value = '';
      endDateInput.value = '';
      currentPage = 1;
      fetchAndDisplaySummary();
  });

  // --- Pagination ---
  prevPageBtn.addEventListener('click', function() {
      if (currentPage > 1) {
          currentPage--;
          fetchAndDisplaySummary(startDateInput.value, endDateInput.value, currentPage);
      }
  });
  nextPageBtn.addEventListener('click', function() {
      if (currentPage < totalPages) {
          currentPage++;
          fetchAndDisplaySummary(startDateInput.value, endDateInput.value, currentPage);
      }
  });

  function updatePagination(newTotalPages = 1) {
      totalPages = newTotalPages;
      pageInfoSpan.textContent = `Page ${currentPage}${totalPages > 0 ? ` of ${totalPages}` : ''}`;
      prevPageBtn.disabled = currentPage <= 1;
      nextPageBtn.disabled = currentPage >= totalPages;
  }

  // --- Display functions ---
  function displayNoUserData() {
      totalTracksElement.textContent = '-';
      totalArtistsElement.textContent = '-';
      totalTimeElement.textContent = '-';
      artistsChartElement.innerHTML = '<p>No user data</p>';
      tracksChartElement.innerHTML = '<p>No user data</p>';
      updatePagination(1);
  }

  function displayTopArtists(artists) {
      artistsChartElement.innerHTML = '';
      if (!artists.length) {
          artistsChartElement.innerHTML = '<p>No user data</p>';
          return;
      }
      const list = document.createElement('ul');
      list.className = 'stats-list';
      artists.forEach(artist => {
          const minutes = Math.floor(artist.TotalMs / 60000);
          const li = document.createElement('li');
          li.innerHTML = `<strong>${artist.Name}</strong> - ${minutes} minutes (${artist.Count} plays)`;
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
      tracks.forEach(track => {
          const minutes = Math.floor(track.TotalMs / 60000);
          const li = document.createElement('li');
          li.innerHTML = `<strong>${track.Name}</strong> - ${minutes} minutes (${track.Count} plays)`;
          list.appendChild(li);
      });
      tracksChartElement.appendChild(list);
  }

  // --- Date helpers ---
  function getDateISOString(dateStr, isStart) {
      if (!dateStr) return null;
      return isStart
          ? `${dateStr}T00:00:00Z`
          : `${dateStr}T23:59:59Z`;
  }

  // --- Sort Buttons ---
  const sortPreferences = {
      artists: 'count',
      tracks: 'count'
  };

  document.querySelectorAll('.sort-buttons').forEach(container => {
      const section = container.dataset.section;
      const buttons = container.querySelectorAll('.sort-button');
      buttons.forEach(button => {
          button.addEventListener('click', () => {
              // Update active state for this section only
              buttons.forEach(b => b.classList.remove('active'));
              button.classList.add('active');
              // Update sort preference for this section
              sortPreferences[section] = button.dataset.sort;
              // Fetch and display with new sort
              fetchAndDisplaySummary(
                  startDateInput.value,
                  endDateInput.value,
                  currentPage
              );
          });
      });
  });

  // --- Fetch and display summary ---
  async function fetchAndDisplaySummary(startDate = null, endDate = null, page = 1) {
      artistsChartElement.innerHTML = '<p>Loading artist data...</p>';
      tracksChartElement.innerHTML = '<p>Loading track data...</p>';

      // Build query parameters
      const params = new URLSearchParams();
      const offset = (page - 1) * PAGE_SIZE;
      params.append('offset', offset);
      params.append('limit', PAGE_SIZE);

      // Add start/end if present
      const startISO = getDateISOString(startDate, true);
      const endISO = getDateISOString(endDate, false);
      if (startISO) params.append('start', startISO);
      if (endISO) params.append('end', endISO);

      // Add sort_by_artists and sort_by_tracks
      params.append('sort_by_artists', sortPreferences.artists);
      params.append('sort_by_tracks', sortPreferences.tracks);

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

          // Use correct property names from your backend
          totalTracksElement.textContent = data.total_tracks_count ?? '-';
          totalArtistsElement.textContent = data.total_artists_count ?? '-';
          const totalHours = Math.floor((data.total_time_listening || 0) / (60000 * 60));
          const totalMinutes = Math.floor(((data.total_time_listening || 0) % (60000 * 60)) / 60000);
          totalTimeElement.textContent = `${totalHours}h ${totalMinutes}m`;

          // Pagination: calculate total pages from total_tracks_count or total_artists_count
          const totalItems = Math.max(
              data.total_tracks_count || 0,
              data.total_artists_count || 0
          );
          const newTotalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
          updatePagination(newTotalPages);

          // Lists
          displayTopArtists(data.top_artists || []);
          displayTopTracks(data.top_tracks || []);
          resultsSection.classList.remove('hidden');
      } catch (error) {
          displayNoUserData();
      }
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
          currentPage = 1;
          fetchAndDisplaySummary(startDateInput.value, endDateInput.value, currentPage);
      });
      yearButtonsContainer.appendChild(btn);
  }

  // Optional: clear year button highlight when filters are manually changed
  [startDateInput, endDateInput].forEach(input => {
      input.addEventListener('input', () => setYearButtonsActive(null));
  });

  // --- On page load ---
  fetchAndDisplaySummary();
});
