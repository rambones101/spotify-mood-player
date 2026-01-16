let accessToken = null;
let userAlbums = [];
let selectedMood = null;

// Mood mappings for audio features
const moodCriteria = {
    happy: { valence: [0.6, 1.0], energy: [0.5, 1.0] },
    sad: { valence: [0.0, 0.4], energy: [0.0, 0.5] },
    energetic: { valence: [0.4, 1.0], energy: [0.7, 1.0] },
    chill: { valence: [0.3, 0.7], energy: [0.0, 0.4] }
};

async function authenticateWithSpotify() {
    try {
        const response = await fetch('/auth/login');
        const data = await response.json();
        window.location.href = data.url;
    } catch (error) {
        console.error('Error authenticating:', error);
        showError('Authentication failed. Please try again.');
    }
}

function handleAuthenticationSuccess(token) {
    accessToken = token;
    document.getElementById('connection-status').textContent = 'Connected to Spotify! ✨';
    document.getElementById('connection-status').style.color = '#1DB954';
    document.querySelector('.mood-selection').style.display = 'block';
    document.querySelector('.random-album').style.display = 'block';
    document.querySelector('.playlist-creation').style.display = 'block';
    document.querySelector('.authentication').style.display = 'none';
    
    // Initialize mood card listeners
    initializeMoodCards();
    
    // Load user's albums
    loadUserAlbums();
}

// Initialize mood card click handlers
function initializeMoodCards() {
    const moodCards = document.querySelectorAll('.mood-card');
    
    moodCards.forEach(card => {
        card.addEventListener('click', function() {
            // Remove selected class from all cards
            moodCards.forEach(c => c.classList.remove('selected'));
            
            // Add selected class to clicked card
            this.classList.add('selected');
            
            // Get mood from data attribute
            selectedMood = this.getAttribute('data-mood');
            
            // Automatically find albums for selected mood
            findAlbumByMood(selectedMood);
        });
    });
}

async function loadUserAlbums() {
    try {
        const response = await fetch(`/api/albums?access_token=${accessToken}`);
        const data = await response.json();
        userAlbums = data.items;
        console.log(`Loaded ${userAlbums.length} albums`);
    } catch (error) {
        console.error('Error loading albums:', error);
        showError('Failed to load albums. Please refresh the page.');
    }
}

// Show error message
function showError(message) {
    const statusElement = document.getElementById('connection-status');
    statusElement.textContent = message;
    statusElement.style.color = '#ff6b6b';
}

// Show success message
function showSuccess(message) {
    const statusElement = document.getElementById('connection-status');
    statusElement.textContent = message;
    statusElement.style.color = '#1DB954';
}

async function findAlbumByMood(mood = selectedMood) {
    if (!mood) {
        showError('Please select a mood first!');
        return;
    }
    
    const statusElement = document.getElementById('connection-status');
    const albumList = document.getElementById('album-list');
    const loadingState = document.getElementById('loading-state');
    
    // Show loading state
    loadingState.style.display = 'block';
    statusElement.textContent = '';
    albumList.innerHTML = '';
    
    try {
        const response = await fetch(`/api/recommend-albums?access_token=${accessToken}&mood=${mood}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Hide loading state
        loadingState.style.display = 'none';
        
        if (data.error) {
            showError(`Error: ${data.error}`);
            albumList.innerHTML = '';
            return;
        }

        if (data.albums.length === 0) {
            showError(`No albums found matching your ${mood} mood. Try a different mood!`);
            albumList.innerHTML = '<li style="text-align: center; padding: 20px; color: #666;">No matching albums found. Try another mood!</li>';
            return;
        }

        // Display results
        const moodEmoji = {
            happy: '😊',
            sad: '😢',
            energetic: '⚡',
            chill: '😌'
        };
        showSuccess(`${moodEmoji[mood]} Found ${data.matchingAlbums} album(s) matching your ${mood} mood!`);
        displayMoodAlbums(data.albums);
        
    } catch (error) {
        console.error('Error finding albums by mood:', error);
        loadingState.style.display = 'none';
        showError('Failed to analyze albums. Please try again or check your connection.');
        albumList.innerHTML = '';
    }
}

function displayMoodAlbums(albums) {
    const albumList = document.getElementById('album-list');
    albumList.innerHTML = '';

    if (albums.length === 0) {
        albumList.innerHTML = '<li style="text-align: center; padding: 20px;">No albums found. Try a different mood!</li>';
        return;
    }

    albums.forEach((item, index) => {
        const album = item.album;
        const moodScore = (item.moodScore * 100).toFixed(0);
        
        const li = document.createElement('li');
        li.className = 'album-card';
        li.style.animationDelay = `${index * 0.1}s`;
        
        li.innerHTML = `
            <div class="album-item">
                ${album.images && album.images[0] ? 
                    `<img src="${album.images[0].url}" alt="${album.name}" class="album-cover">` : 
                    '<div class="album-cover-placeholder">🎵</div>'}
                <div class="album-info">
                    <strong class="album-name">${album.name}</strong>
                    <span class="mood-score">Match: ${moodScore}%</span>
                    <span class="artist-name">${album.artists.join(', ')}</span>
                    <span class="album-details">${album.total_tracks} tracks • ${album.release_date.substring(0, 4)}</span>
                    <div class="album-actions">
                        <a href="${album.external_urls.spotify}" target="_blank" class="play-button">
                            ▶ Play in Spotify
                        </a>
                    </div>
                </div>
            </div>
        `;
        albumList.appendChild(li);
    });
}

async function playRandomAlbum() {
    if (userAlbums.length === 0) {
        alert('No albums found in your library. Please add some albums to your Spotify library first.');
        return;
    }

    const randomIndex = Math.floor(Math.random() * userAlbums.length);
    const randomAlbum = userAlbums[randomIndex].album;
    
    displayAlbums([randomAlbum]);
    document.getElementById('connection-status').textContent = 'Here\'s a random album from your library!';
}

// Create a playlist from liked songs filtered by mood
async function createPlaylist() {
    const mood = document.getElementById('playlist-mood').value;
    const playlistName = document.getElementById('playlist-name').value.trim();
    const trackCount = parseInt(document.getElementById('track-count').value);
    const resultDiv = document.getElementById('playlist-result');
    const createBtn = document.getElementById('create-playlist-btn');
    
    // Validation
    if (!playlistName) {
        resultDiv.innerHTML = '<p class="error">Please enter a playlist name!</p>';
        return;
    }
    
    // Show loading state
    createBtn.disabled = true;
    createBtn.textContent = 'Creating Playlist... ⏳';
    resultDiv.innerHTML = '<p class="loading">Analyzing your liked songs and creating playlist...</p>';
    
    try {
        const response = await fetch('/api/create-playlist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                accessToken: accessToken,
                mood: mood,
                playlistName: playlistName,
                trackCount: trackCount
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            resultDiv.innerHTML = `
                <div class="success-message">
                    <h3>✅ Playlist Created Successfully!</h3>
                    <p><strong>${data.playlist.name}</strong></p>
                    <p>${data.playlist.tracks_added} ${data.playlist.mood} songs added</p>
                    <a href="${data.playlist.external_urls.spotify}" target="_blank" class="open-playlist-btn">
                        Open in Spotify 🎵
                    </a>
                </div>
            `;
            
            // Clear form
            document.getElementById('playlist-name').value = '';
        } else {
            resultDiv.innerHTML = `<p class="error">${data.message || 'Failed to create playlist'}</p>`;
        }
        
    } catch (error) {
        console.error('Error creating playlist:', error);
        resultDiv.innerHTML = '<p class="error">Failed to create playlist. Please try again.</p>';
    } finally {
        createBtn.disabled = false;
        createBtn.textContent = 'Create Playlist 🎵';
    }
}

// Event listeners
document.getElementById('spotifyAuthButton').addEventListener('click', authenticateWithSpotify);
document.getElementById('play-random-album').addEventListener('click', playRandomAlbum);
document.getElementById('create-playlist-btn').addEventListener('click', createPlaylist);

// Check for access token on page load
window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');

    if (token) {
        handleAuthenticationSuccess(token);
        
        // Clean URL
        window.history.replaceState({}, document.title, '/');
    }
};
