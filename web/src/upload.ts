// Interfaces
interface Artist {
  Name: string;
  TotalMs: number;
  Count: number;
}

interface Track {
  Name: string;
  TotalMs: number;
  Count: number;
}

interface UploadResponse {
  message?: string;
  error?: string;
}

interface SummaryResponse {
  error?: string;
  total_tracks_count?: number;
  total_artists_count?: number;
  total_time_listening?: number;
  top_artists?: Artist[];
  top_tracks?: Track[];
}

interface SectionState {
  currentPage: number;
  totalPages: number;
  sort: string;
  updatePaginationDisplay?: () => void;
}

// Constants
const PAGE_SIZE = 10;
const YEAR_START = 2011;
const YEAR_END = 2025;

// State
const sectionState: { [key: string]: SectionState } = {
  artists: { currentPage: 1, totalPages: 1, sort: 'count' },
  tracks: { currentPage: 1, totalPages: 1, sort: 'count' }
};

// Utility functions
function getDateISOString(dateStr: string, isStart: boolean): string | null {
  if (!dateStr) return null;
  return isStart ? `${dateStr}T00:00:00Z` : `${dateStr}T23:59:59Z`;
}

function setYearButtonsActive(year: number | null): void {
  document.querySelectorAll('.year-button').forEach(btn => {
    btn.classList.toggle('active', btn instanceof HTMLElement && btn.dataset.year === String(year));
  });
}

// Display functions
function displayArtists(artists: Artist[]): void {
  const artistsChartElement = document.getElementById('artists-chart') as HTMLElement;
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

function displayTracks(tracks: Track[]): void {
  const tracksChartElement = document.getElementById('tracks-chart') as HTMLElement;
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

function displayNoUserData(): void {
  const totalTracksElement = document.getElementById('total-tracks') as HTMLElement;
  const totalArtistsElement = document.getElementById('total-artists') as HTMLElement;
  const totalTimeElement = document.getElementById('total-time') as HTMLElement;
  const artistsChartElement = document.getElementById('artists-chart') as HTMLElement;
  const tracksChartElement = document.getElementById('tracks-chart') as HTMLElement;

  totalTracksElement.textContent = '-';
  totalArtistsElement.textContent = '-';
  totalTimeElement.textContent = '-';
  artistsChartElement.innerHTML = '<p>No user data</p>';
  tracksChartElement.innerHTML = '<p>No user data</p>';
  
  sectionState.artists.totalPages = 1;
  sectionState.tracks.totalPages = 1;
  sectionState.artists.updatePaginationDisplay?.();
  sectionState.tracks.updatePaginationDisplay?.();
}

// API functions
async function fetchAndDisplaySection(section: string): Promise<void> {
  const startDateInput = document.getElementById('start-date') as HTMLInputElement;
  const endDateInput = document.getElementById('end-date') as HTMLInputElement;
  const totalTracksElement = document.getElementById('total-tracks') as HTMLElement;
  const totalArtistsElement = document.getElementById('total-artists') as HTMLElement;
  const totalTimeElement = document.getElementById('total-time') as HTMLElement;
  const artistsChartElement = document.getElementById('artists-chart') as HTMLElement;
  const tracksChartElement = document.getElementById('tracks-chart') as HTMLElement;
  const resultsSection = document.getElementById('results-section') as HTMLElement;

  // Show loading for the section
  if (section === 'artists') {
    artistsChartElement.innerHTML = '<p>Loading artist data...</p>';
  } else if (section === 'tracks') {
    tracksChartElement.innerHTML = '<p>Loading track data...</p>';
  }

  // Build query parameters
  const params = new URLSearchParams();
  params.append('offset_artists', ((sectionState.artists.currentPage - 1) * PAGE_SIZE).toString());
  params.append('offset_tracks', ((sectionState.tracks.currentPage - 1) * PAGE_SIZE).toString());
  params.append('limit', PAGE_SIZE.toString());
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
    
    const data: SummaryResponse = await response.json();

    // Defensive: If backend returns error or empty
    if (data.error || (!data.top_artists && !data.top_tracks)) {
      displayNoUserData();
      return;
    }

    // Update stats
    totalTracksElement.textContent = data.total_tracks_count?.toString() ?? '-';
    totalArtistsElement.textContent = data.total_artists_count?.toString() ?? '-';
    const totalHours = Math.floor((data.total_time_listening || 0) / (60000 * 60));
    const totalMinutes = Math.floor(((data.total_time_listening || 0) % (60000 * 60)) / 60000);
    totalTimeElement.textContent = `${totalHours}h ${totalMinutes}m`;

    // Only update the section that was requested
    if (section === 'artists') {
      sectionState.artists.totalPages = Math.max(1, Math.ceil((data.total_artists_count || 0) / PAGE_SIZE));
      sectionState.artists.updatePaginationDisplay?.();
      displayArtists(data.top_artists || []);
    } else if (section === 'tracks') {
      sectionState.tracks.totalPages = Math.max(1, Math.ceil((data.total_tracks_count || 0) / PAGE_SIZE));
      sectionState.tracks.updatePaginationDisplay?.();
      displayTracks(data.top_tracks || []);
    }

    resultsSection.classList.remove('hidden');
  } catch (error) {
    displayNoUserData();
  }
}

// Event handlers
function handleFileSelection(): void {
  const fileUpload = document.getElementById('file-upload') as HTMLInputElement;
  const fileNames = document.getElementById('file-names') as HTMLElement;
  const uploadButton = document.getElementById('upload-button') as HTMLButtonElement;

  if (fileUpload.files && fileUpload.files.length > 0) {
    const names = Array.from(fileUpload.files).map(file => file.name).join(', ');
    fileNames.textContent = names;
    uploadButton.disabled = false;
  } else {
    fileNames.textContent = 'No files selected';
    uploadButton.disabled = true;
  }
}

async function handleFileUpload(e: Event): Promise<void> {
  e.preventDefault();
  
  const fileUpload = document.getElementById('file-upload') as HTMLInputElement;
  const uploadStatus = document.getElementById('upload-status') as HTMLElement;
  const uploadButton = document.getElementById('upload-button') as HTMLButtonElement;
  const fileNames = document.getElementById('file-names') as HTMLElement;
  const resultsSection = document.getElementById('results-section') as HTMLElement;
  const startDateInput = document.getElementById('start-date') as HTMLInputElement;
  const endDateInput = document.getElementById('end-date') as HTMLInputElement;

  if (!fileUpload.files || fileUpload.files.length === 0) {
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

    const data: UploadResponse = await response.json();
    uploadStatus.classList.add('hidden');
    uploadButton.disabled = false;
    fileUpload.value = '';
    fileNames.textContent = 'No files selected';

    if (!data.error) {
      startDateInput.value = '';
      endDateInput.value = '';
      sectionState.artists.currentPage = 1;
      sectionState.tracks.currentPage = 1;
      
      fetchAndDisplaySection('artists');
      fetchAndDisplaySection('tracks');
      resultsSection.classList.remove('hidden');
    } else {
      throw new Error(data.message)
    }
  } catch (error) {
    uploadStatus.classList.add('hidden');
    uploadButton.disabled = false;
    displayNoUserData();
  }
}

function handleApplyFilters(): void {
  const startDateInput = document.getElementById('start-date') as HTMLInputElement;
  const endDateInput = document.getElementById('end-date') as HTMLInputElement;

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
}

function handleResetFilters(): void {
  const startDateInput = document.getElementById('start-date') as HTMLInputElement;
  const endDateInput = document.getElementById('end-date') as HTMLInputElement;

  startDateInput.value = '';
  endDateInput.value = '';
  sectionState.artists.currentPage = 1;
  sectionState.tracks.currentPage = 1;
  fetchAndDisplaySection('artists');
  fetchAndDisplaySection('tracks');
}

async function handleLogout(): Promise<void> {
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
}

async function handleDeleteUserData(event: Event): Promise<void> {
  event.preventDefault();

  if (!confirm('Are you sure you want to delete all your data?')) return;

  try {
    const response = await fetch('/api/delete', {
      method: 'DELETE',
      credentials: 'include'
    });

    if (response.ok) {
      alert('Your data has been successfully deleted');
      window.location.href = '/';
    } else {
      alert('Delete failed');
    }
  } catch (err) {
    alert('Delete call failed.');
  }
}

function handleYearButtonClick(year: number): void {
  const startDateInput = document.getElementById('start-date') as HTMLInputElement;
  const endDateInput = document.getElementById('end-date') as HTMLInputElement;

  // Set date pickers to this year
  startDateInput.value = `${year}-01-01`;
  endDateInput.value = `${year}-12-31`;
  setYearButtonsActive(year);
  sectionState.artists.currentPage = 1;
  sectionState.tracks.currentPage = 1;
  fetchAndDisplaySection('artists');
  fetchAndDisplaySection('tracks');
}

function handleDateInputChange(): void {
  setYearButtonsActive(null);
}

// Pagination setup
function setupPagination(section: string): void {
  const prev100Btn = document.getElementById(`${section}-prev-100`) as HTMLButtonElement;
  const prev10Btn = document.getElementById(`${section}-prev-10`) as HTMLButtonElement;
  const prevBtn = document.getElementById(`${section}-prev-page`) as HTMLButtonElement;
  const nextBtn = document.getElementById(`${section}-next-page`) as HTMLButtonElement;
  const next10Btn = document.getElementById(`${section}-next-10`) as HTMLButtonElement;
  const next100Btn = document.getElementById(`${section}-next-100`) as HTMLButtonElement;
  const pageInfo = document.getElementById(`${section}-page-info`) as HTMLElement;

  const createPaginationHandler = (pageChange: (currentPage: number, totalPages: number) => number) => {
    return () => {
      const newPage = pageChange(sectionState[section].currentPage, sectionState[section].totalPages);
      if (newPage !== sectionState[section].currentPage) {
        sectionState[section].currentPage = newPage;
        fetchAndDisplaySection(section);
      }
    };
  };

  prevBtn.addEventListener('click', createPaginationHandler((current) => Math.max(1, current - 1)));
  nextBtn.addEventListener('click', createPaginationHandler((current, total) => Math.min(total, current + 1)));
  prev10Btn.addEventListener('click', createPaginationHandler((current) => Math.max(1, current - 10)));
  next10Btn.addEventListener('click', createPaginationHandler((current, total) => Math.min(total, current + 10)));
  prev100Btn.addEventListener('click', createPaginationHandler((current) => Math.max(1, current - 100)));
  next100Btn.addEventListener('click', createPaginationHandler((current, total) => Math.min(total, current + 100)));

  sectionState[section].updatePaginationDisplay = function () {
    pageInfo.textContent = `Page ${sectionState[section].currentPage} of ${sectionState[section].totalPages}`;
    prevBtn.disabled = sectionState[section].currentPage <= 1;
    nextBtn.disabled = sectionState[section].currentPage >= sectionState[section].totalPages;
    prev10Btn.disabled = sectionState[section].currentPage <= 1;
    next10Btn.disabled = sectionState[section].currentPage >= sectionState[section].totalPages;
    prev100Btn.disabled = sectionState[section].currentPage <= 1;
    next100Btn.disabled = sectionState[section].currentPage >= sectionState[section].totalPages;
  };
}

// DOM initialization
document.addEventListener('DOMContentLoaded', () => {
  // DOM elements
  const uploadForm = document.getElementById('upload-form') as HTMLFormElement;
  const fileUpload = document.getElementById('file-upload') as HTMLInputElement;
  const startDateInput = document.getElementById('start-date') as HTMLInputElement;
  const endDateInput = document.getElementById('end-date') as HTMLInputElement;
  const applyFiltersBtn = document.getElementById('apply-filters') as HTMLButtonElement;
  const resetFiltersBtn = document.getElementById('reset-filters') as HTMLButtonElement;
  const logoutBtn = document.getElementById('logout-button') as HTMLButtonElement | null;
  const deleteBtn = document.getElementById('delete-button') as HTMLButtonElement | null;
  const yearButtonsContainer = document.querySelector('.year-buttons') as HTMLElement;

  // Event listeners
  fileUpload.addEventListener('change', handleFileSelection);
  uploadForm.addEventListener('submit', handleFileUpload);
  applyFiltersBtn.addEventListener('click', handleApplyFilters);
  resetFiltersBtn.addEventListener('click', handleResetFilters);

  // Sort buttons
  document.querySelectorAll('.sort-buttons').forEach(container => {
    const section = (container as HTMLElement).dataset.section!;
    const buttons = container.querySelectorAll('.sort-button');
    
    buttons.forEach(button => {
      button.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        button.classList.add('active');
        sectionState[section].sort = (button as HTMLElement).dataset.sort!;
        sectionState[section].currentPage = 1;
        fetchAndDisplaySection(section);
      });
    });
  });

  // Setup pagination
  setupPagination('artists');
  setupPagination('tracks');

  // Optional buttons
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  if (deleteBtn) {
    deleteBtn.addEventListener('click', handleDeleteUserData);
  }

  // Year buttons
  for (let y = YEAR_START; y <= YEAR_END; y++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'year-button';
    btn.textContent = y.toString();
    btn.dataset.year = y.toString();
    btn.addEventListener('click', () => handleYearButtonClick(y));
    yearButtonsContainer.appendChild(btn);
  }

  // Clear year button highlight when filters are manually changed
  [startDateInput, endDateInput].forEach(input => {
    input.addEventListener('input', handleDateInputChange);
  });

  // Initial load
  fetchAndDisplaySection('artists');
  fetchAndDisplaySection('tracks');
});