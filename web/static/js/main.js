document.addEventListener('DOMContentLoaded', function() {
    const uploadForm = document.getElementById('upload-form');
    const fileUpload = document.getElementById('file-upload');
    const fileNames = document.getElementById('file-names');
    const uploadButton = document.getElementById('upload-button');
    const uploadStatus = document.getElementById('upload-status');
    const uploadSection = document.getElementById('upload-section');
    const resultsSection = document.getElementById('results-section');
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
    // Charts
    let artistsChart, tracksChart, activityChart;
    
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
    uploadForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (fileUpload.files.length === 0) {
            alert('Please select at least one file to upload');
            return;
        }
        
        // Show loading state
        uploadStatus.classList.remove('hidden');
        uploadButton.disabled = true;
        
        try {
            // Create FormData object
            const formData = new FormData();
            for (let i = 0; i < fileUpload.files.length; i++) {
                formData.append('files', fileUpload.files[i]);
            }
            
            // Send data to server
            const response = await fetch('/api/analyze', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            
            // Hide loading state
            uploadStatus.classList.add('hidden');
            
            // Display results
            displayResults(data);
            
            // Show results section
            uploadSection.classList.add('hidden');
            resultsSection.classList.remove('hidden');
        } catch (error) {
            console.error('Error:', error);
            uploadStatus.classList.add('hidden');
            uploadButton.disabled = false;
            alert('Error processing your data. Please try again.');
        }
    });
    
    // Function to display results
    function displayResults(data) {
        // Update stats
        document.getElementById('total-tracks').textContent = data.totalTracks || 0;
        document.getElementById('total-artists').textContent = data.uniqueArtists || 0;
        document.getElementById('total-time').textContent = formatTime(data.totalMinutesListened || 0);
        document.getElementById('most-active-day').textContent = data.mostActiveDay || 'N/A';
        
        // Create charts
        createArtistsChart(data.topArtists || []);
        createTracksChart(data.topTracks || []);
        createActivityChart(data.listeningActivity || {});
    }
    
    // Format minutes into hours and minutes
    function formatTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        return `${hours} hr ${mins} min`;
    }
    
    // Create artists chart
    function createArtistsChart(artists) {
        const ctx = document.getElementById('artists-chart').getContext('2d');
        
        // Take top 10 artists
        const topArtists = artists.slice(0, 10);
        
        if (artistsChart) {
            artistsChart.destroy();
        }
        
        artistsChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: topArtists.map(a => a.name),
                datasets: [{
                    label: 'Tracks Played',
                    data: topArtists.map(a => a.count),
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
        
        // Take top 10 tracks
        const topTracks = tracks.slice(0, 10);
        
        if (tracksChart) {
            tracksChart.destroy();
        }
        
        tracksChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: topTracks.map(t => `${t.name} - ${t.artist}`),
                datasets: [{
                    label: 'Times Played',
                    data: topTracks.map(t => t.count),
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
    
    // Create activity chart
    function createActivityChart(activity) {
        const ctx = document.getElementById('activity-chart').getContext('2d');
        
        // Prepare data for hours of day
        const hours = Array.from({length: 24}, (_, i) => i);
        const hourCounts = hours.map(hour => activity.hourly && activity.hourly[hour] || 0);
        
        if (activityChart) {
            activityChart.destroy();
        }
        
        activityChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: hours.map(h => `${h}:00`),
                datasets: [{
                    label: 'Tracks Played',
                    data: hourCounts,
                    backgroundColor: 'rgba(29, 185, 84, 0.2)',
                    borderColor: '#1DB954',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Listening Activity by Hour'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
});
