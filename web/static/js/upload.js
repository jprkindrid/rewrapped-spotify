document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const uploadForm = document.getElementById('upload-form');
    const fileUpload = document.getElementById('file-upload');
    const fileNames = document.getElementById('file-names');
    const uploadButton = document.getElementById('upload-button');
    const uploadStatus = document.getElementById('upload-status');
    const resultsSection = document.getElementById('results-section');
    
    // Create a results container if it doesn't exist
    let resultsContainer = document.getElementById('results-container');
    if (!resultsContainer) {
        resultsContainer = document.createElement('div');
        resultsContainer.id = 'results-container';
        resultsSection.appendChild(resultsContainer);
    }
    
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
            
            // Use 'file' as the field name as expected by the server
            for (let i = 0; i < fileUpload.files.length; i++) {
                formData.append('file', fileUpload.files[i]);
            }
            
            // Send data to server
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });
            
            // Get the response as text first for debugging
            const text = await response.text();
            
            // Try to parse as JSON
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                data = { error: 'Failed to parse response as JSON', rawResponse: text };
            }
            
            // Hide loading state
            uploadStatus.classList.add('hidden');
            uploadButton.disabled = false;
            
            // Reset file input
            fileUpload.value = '';
            fileNames.textContent = 'No files selected';
            
            // Show results section
            resultsSection.classList.remove('hidden');
            
            // Display the upload response
            displayUploadResponse(data);
            
            // If it was successful, fetch and display the summary data
            if (!data.error) {
                await fetchAndDisplaySummary();
            }
        } catch (error) {
            uploadStatus.classList.add('hidden');
            uploadButton.disabled = false;
            displayError(error.message);
        }
    });
    
    function displayUploadResponse(data) {
        const uploadDiv = document.createElement('div');
        uploadDiv.className = 'response-section';
        uploadDiv.innerHTML = `
            <h3>Upload Response:</h3>
            <pre style="margin-top: 10px;">${JSON.stringify(data, null, 2)}</pre>
        `;
        resultsContainer.innerHTML = '';
        resultsContainer.appendChild(uploadDiv);
    }
    
    function displayError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'response-section';
        errorDiv.innerHTML = `
            <h3>Error:</h3>
            <pre style="margin-top: 10px; color: red;">${message}</pre>
        `;
        resultsContainer.innerHTML = '';
        resultsContainer.appendChild(errorDiv);
    }
    
    async function fetchAndDisplaySummary() {
        const summaryDiv = document.createElement('div');
        summaryDiv.className = 'response-section';
        summaryDiv.innerHTML = '<h3>Summary Data:</h3><p>Loading...</p>';
        resultsContainer.appendChild(summaryDiv);
        
        try {
            const response = await fetch('/api/summary', {
                credentials: 'include'
            });
            
            const text = await response.text();
            
            let data;
            try {
                data = JSON.parse(text);
                
                // Create a formatted summary display
                let summaryHtml = '<h3>Summary Data:</h3>';
                
                // Add top artists section
                summaryHtml += '<h4 style="margin-top: 20px;">Top Artists:</h4><ul>';
                for (const artist of data.top_artists) {
                    const minutes = Math.floor(artist.TotalMs / 60000);
                    summaryHtml += `<li>${artist.Name} - ${minutes} minutes (${artist.Count} plays)</li>`;
                }
                summaryHtml += '</ul>';
                
                // Add top tracks section
                summaryHtml += '<h4 style="margin-top: 20px;">Top Tracks:</h4><ul>';
                for (const track of data.top_tracks) {
                    const minutes = Math.floor(track.TotalMs / 60000);
                    summaryHtml += `<li>${track.Name} - ${minutes} minutes (${track.Count} plays)</li>`;
                }
                summaryHtml += '</ul>';
                
                // Add total listening time
                const totalHours = Math.floor(data.total_time_listening / (60000 * 60));
                const totalMinutes = Math.floor((data.total_time_listening % (60000 * 60)) / 60000);
                summaryHtml += `<h4 style="margin-top: 20px;">Total Listening Time:</h4>`;
                summaryHtml += `<p>${totalHours} hours and ${totalMinutes} minutes</p>`;
                
                summaryDiv.innerHTML = summaryHtml;
            } catch (e) {
                summaryDiv.innerHTML = `
                    <h3>Summary Data:</h3>
                    <pre style="margin-top: 10px;">${text}</pre>
                `;
            }
        } catch (error) {
            summaryDiv.innerHTML = `
                <h3>Summary Data:</h3>
                <p style="color: red;">Error: ${error.message}</p>
            `;
        }
    }
});
