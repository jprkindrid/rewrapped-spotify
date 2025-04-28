document.addEventListener('DOMContentLoaded', function() {
    const uploadForm = document.getElementById('upload-form');
    const fileUpload = document.getElementById('file-upload');
    const fileNames = document.getElementById('file-names');
    const uploadButton = document.getElementById('upload-button');
    const uploadStatus = document.getElementById('upload-status');
    const uploadSection = document.getElementById('upload-section');
    const resultsSection = document.getElementById('results-section');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const applyFiltersButton = document.getElementById('apply-filters');
    const resetFiltersButton = document.getElementById('reset-filters');
    const prevPageButton = document.getElementById('prev-page');
    const nextPageButton = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');
    
    // Charts
    let artistsChart, tracksChart;
    
    // Pagination and filters
    let currentOffset = 0;
    const limit = 10;
    let totalArtists = 0;
    let totalTracks = 0;
    let startDate = '';
    let endDate = '';
    
    // Check if we're on the upload page after authentication
    const urlParams = new URLSearchParams(window.location.search);
    const authenticated = urlParams.get('authenticated');
    
    if (authenticated === 'true') {
        // User has been authenticated, show a success message
        const authMessage = document.createElement('div');
        authMessage.className = 'auth-success';
        authMessage.textContent = 'Successfully authenticated with Spotify!';
        document.querySelector('header').appendChild(authMessage);
        
        // Remove the message after 5 seconds
        setTimeout(() => {
            authMessage.remove();
        }, 5000);
    }
    
    // Load data when page loads
    loadData();
    
    // Update the accept attribute to include ZIP files
    fileUpload.setAttribute('accept', '.json,.zip');
    
    // Handle file selection
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
    
    // Handle form submission
    uploadForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (fileUpload.files.length === 0) {
            alert('Please select at least one file to upload');
            return;
        }
        
        // Show loading state
        uploadStatus.classList.remove('hidden');
        uploadButton.disabled = true;
        
        // Create FormData object
        const formData = new FormData();
        for (let i = 0; i < fileUpload.files.length; i++) {
            formData.append('files', fileUpload.files[i]);
        }
        
        // Send data to server
        fetch('/api/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(`Server error: ${text}`);
                });
            }
            return response.json();
        })
        .then(data => {
            // Hide loading state
            uploadStatus.classList.add('hidden');
            uploadButton.disabled = false;
            
            // Reset file input
            fileUpload.value = '';
            fileNames.textContent = 'No files selected';
            
            // Reload data
            resetFilters();
            
            // Show success message
            alert('Data uploaded and analyzed successfully!');
        })
        .catch(error => {
            console.error('Error:', error);
            uploadStatus.classList.add('hidden');
            uploadButton.disabled = false;
            alert(`Error processing your data: ${error.message}`);
        });
    });
    
    // Handle pagination
    prevPageButton.addEventListener('click', function() {
        if (currentOffset >= limit) {
            currentOffset -= limit;
            loadData();
        }
    });
    
    nextPageButton.addEventListener('click', function() {
        if (currentOffset + limit < Math.max(totalArtists, totalTracks)) {
            currentOffset += limit;
            loadData();
        }
    });
    
    // Handle filters
    applyFiltersButton.addEventListener('click', function() {
        startDate = startDateInput.value ? formatDateForAPI(startDateInput.value) : '';
        endDate = endDateInput.value ? formatDateForAPI(endDateInput.value, true) : '';
        currentOffset = 0;
        loadData();
    });
    
    resetFiltersButton.addEventListener('click', resetFilters);
    
    function resetFilters() {
        startDateInput.value = '';
        endDateInput.value = '';
        startDate = '';
        endDate = '';
        currentOffset = 0;
        loadData();
    }
    
    // Format date for API (YYYY-MM-DDT00:00:00Z or YYYY-MM-DDT23:59:59Z)
    function formatDateForAPI(dateString, isEndDate = false) {
        const date = new Date(dateString);
        if (isEndDate) {
            date.setHours(23, 59, 59, 999);
        } else {
            date.setHours(0, 0, 0, 0);
        }
        return date.toISOString();
    }
    
    // Function to load data
    function loadData() {
        // Build query parameters
        let url = `/api/summary?offset=${currentOffset}&limit=${limit}`;
        if (startDate) {
            url += `&start=${encodeURIComponent(startDate)}`;
        }
        if (endDate) {
            url += `&end=${encodeURIComponent(endDate)}`;
        }
        
        fetch(url)
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(`Server error: ${text}`);
                });
            }
            return response.json();
        })
        .then(data => {
            // Update pagination info
            totalArtists = data.total_artists_count || 0;
            totalTracks = data.total_tracks_count || 0;
            
            const totalItems = Math.max(totalArtists, totalTracks);
            const currentPage = Math.floor(currentOffset / limit) + 1;
            const totalPages = Math.ceil(totalItems / limit) || 1;
            
            pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
            prevPageButton.disabled = currentOffset <= 0;
            nextPageButton.disabled = currentOffset + limit >= totalItems;
            
            // Display results
            displayResults(data);
            
            // Show results section
            resultsSection.classList.remove('hidden');
        })
        .catch(error => {
            console.error('Error:', error);
            alert(`Error loading data: ${error.message}`);
        });
    }
    
    // Function to display results
    function displayResults(data) {
        // Update stats
        document.getElementById('total-tracks').textContent = data.total_tracks_count || 0;
        document.getElementById('total-artists').textContent = data.total_artists_count || 0;
        document.getElementById('total-time').textContent = formatTime(data.total_time_listening || 0);
        
        // Create charts
        createArtistsChart(data.top_artists || []);
        createTracksChart(data.top_tracks || []);
    }
    
    // Format milliseconds into hours and minutes
    function formatTime(milliseconds) {
        const minutes = Math.floor(milliseconds / 60000);
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours} hr ${mins} min`;
    }
    
    // Create artists chart
    function createArtistsChart(artists) {
        const ctx = document.getElementById('artists-chart').getContext('2d');
        
        if (artistsChart) {
            artistsChart.destroy();
        }
        
        artistsChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: artists.map(a => a.artist_name),
                datasets: [{
                    label: 'Tracks Played',
                    data: artists.map(a => a.count),
                    backgroundColor: '#1DB954',
                    borderColor: '#18a449',
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Your Top Artists'
                    }
                }
            }
        });
    }
    
    // Create tracks chart
    function createTracksChart(tracks) {
        const ctx = document.getElementById('tracks-chart').getContext('2d');
        
        if (tracksChart) {
            tracksChart.destroy();
        }
        
        tracksChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: tracks.map(t => `${t.track_name} - ${t.artist_name}`),
                datasets: [{
                    label: 'Times Played',
                    data: tracks.map(t => t.count),
                    backgroundColor: '#1DB954',
                    borderColor: '#18a449',
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Your Top Tracks'
                    }
                }
            }
        });
    }
});
