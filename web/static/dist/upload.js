"use strict";
// Constants
const PAGE_SIZE = 10;
const YEAR_START = 2011;
const YEAR_END = 2025;
// State
const sectionState = {
    artists: { currentPage: 1, totalPages: 1, sort: 'count' },
    tracks: { currentPage: 1, totalPages: 1, sort: 'count' }
};
// Utility functions
function getDateISOString(dateStr, isStart) {
    if (!dateStr)
        return null;
    return isStart ? `${dateStr}T00:00:00Z` : `${dateStr}T23:59:59Z`;
}
function setYearButtonsActive(year) {
    document.querySelectorAll('.year-button').forEach(btn => {
        btn.classList.toggle('active', btn instanceof HTMLElement && btn.dataset.year === String(year));
    });
}
// Display functions
function displayArtists(artists) {
    const artistsChartElement = document.getElementById('artists-chart');
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
function displayTracks(tracks) {
    const tracksChartElement = document.getElementById('tracks-chart');
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
    const totalTracksElement = document.getElementById('total-tracks');
    const totalArtistsElement = document.getElementById('total-artists');
    const totalTimeElement = document.getElementById('total-time');
    const artistsChartElement = document.getElementById('artists-chart');
    const tracksChartElement = document.getElementById('tracks-chart');
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
async function fetchAndDisplaySection(section) {
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const totalTracksElement = document.getElementById('total-tracks');
    const totalArtistsElement = document.getElementById('total-artists');
    const totalTimeElement = document.getElementById('total-time');
    const artistsChartElement = document.getElementById('artists-chart');
    const tracksChartElement = document.getElementById('tracks-chart');
    const resultsSection = document.getElementById('results-section');
    // Show loading for the section
    if (section === 'artists') {
        artistsChartElement.innerHTML = '<p>Loading artist data...</p>';
    }
    else if (section === 'tracks') {
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
    if (startISO)
        params.append('start', startISO);
    if (endISO)
        params.append('end', endISO);
    try {
        const response = await fetch(`/api/summary?${params.toString()}`, {
            credentials: 'include'
        });
        if (!response.ok)
            throw new Error('No user data');
        const data = await response.json();
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
        }
        else if (section === 'tracks') {
            sectionState.tracks.totalPages = Math.max(1, Math.ceil((data.total_tracks_count || 0) / PAGE_SIZE));
            sectionState.tracks.updatePaginationDisplay?.();
            displayTracks(data.top_tracks || []);
        }
        resultsSection.classList.remove('hidden');
    }
    catch (error) {
        displayNoUserData();
    }
}
// Event handlers
function handleFileSelection() {
    const fileUpload = document.getElementById('file-upload');
    const fileNames = document.getElementById('file-names');
    const uploadButton = document.getElementById('upload-button');
    if (fileUpload.files && fileUpload.files.length > 0) {
        const names = Array.from(fileUpload.files).map(file => file.name).join(', ');
        fileNames.textContent = names;
        uploadButton.disabled = false;
    }
    else {
        fileNames.textContent = 'No files selected';
        uploadButton.disabled = true;
    }
}
async function handleFileUpload(e) {
    e.preventDefault();
    const fileUpload = document.getElementById('file-upload');
    const uploadStatus = document.getElementById('upload-status');
    const uploadButton = document.getElementById('upload-button');
    const fileNames = document.getElementById('file-names');
    const resultsSection = document.getElementById('results-section');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
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
        const data = await response.json();
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
        }
        else {
            throw new Error(data.message);
        }
    }
    catch (error) {
        uploadStatus.classList.add('hidden');
        uploadButton.disabled = false;
        displayNoUserData();
    }
}
function handleApplyFilters() {
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    if (startDate && endDate) {
        sectionState.artists.currentPage = 1;
        sectionState.tracks.currentPage = 1;
        fetchAndDisplaySection('artists');
        fetchAndDisplaySection('tracks');
    }
    else {
        alert('Please select both start and end dates');
    }
}
function handleResetFilters() {
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    startDateInput.value = '';
    endDateInput.value = '';
    sectionState.artists.currentPage = 1;
    sectionState.tracks.currentPage = 1;
    fetchAndDisplaySection('artists');
    fetchAndDisplaySection('tracks');
}
async function handleLogout() {
    try {
        const response = await fetch('/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        if (response.ok) {
            window.location.href = '/';
        }
        else {
            alert('Logout failed.');
        }
    }
    catch (err) {
        alert('Logout failed.');
    }
}
async function handleDeleteUserData(event) {
    event.preventDefault();
    if (!confirm('Are you sure you want to delete all your data?'))
        return;
    try {
        const response = await fetch('/api/delete', {
            method: 'DELETE',
            credentials: 'include'
        });
        if (response.ok) {
            alert('Your data has been successfully deleted');
            window.location.href = '/';
        }
        else {
            alert('Delete failed');
        }
    }
    catch (err) {
        alert('Delete call failed.');
    }
}
function handleYearButtonClick(year) {
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    // Set date pickers to this year
    startDateInput.value = `${year}-01-01`;
    endDateInput.value = `${year}-12-31`;
    setYearButtonsActive(year);
    sectionState.artists.currentPage = 1;
    sectionState.tracks.currentPage = 1;
    fetchAndDisplaySection('artists');
    fetchAndDisplaySection('tracks');
}
function handleDateInputChange() {
    setYearButtonsActive(null);
}
// Pagination setup
function setupPagination(section) {
    const prev100Btn = document.getElementById(`${section}-prev-100`);
    const prev10Btn = document.getElementById(`${section}-prev-10`);
    const prevBtn = document.getElementById(`${section}-prev-page`);
    const nextBtn = document.getElementById(`${section}-next-page`);
    const next10Btn = document.getElementById(`${section}-next-10`);
    const next100Btn = document.getElementById(`${section}-next-100`);
    const pageInfo = document.getElementById(`${section}-page-info`);
    const createPaginationHandler = (pageChange) => {
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
    const uploadForm = document.getElementById('upload-form');
    const fileUpload = document.getElementById('file-upload');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const applyFiltersBtn = document.getElementById('apply-filters');
    const resetFiltersBtn = document.getElementById('reset-filters');
    const logoutBtn = document.getElementById('logout-button');
    const deleteBtn = document.getElementById('delete-button');
    const yearButtonsContainer = document.querySelector('.year-buttons');
    // Event listeners
    fileUpload.addEventListener('change', handleFileSelection);
    uploadForm.addEventListener('submit', handleFileUpload);
    applyFiltersBtn.addEventListener('click', handleApplyFilters);
    resetFiltersBtn.addEventListener('click', handleResetFilters);
    // Sort buttons
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
