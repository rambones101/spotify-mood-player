let accessToken = null;
let refreshToken = null;
let tokenExpiryTime = null;
let userAlbums = [];
let selectedMood = null;

// User Guide Toggle
document.addEventListener('DOMContentLoaded', () => {
    const guideToggle = document.getElementById('guideToggle');
    const guideContent = document.getElementById('guideContent');
    
    if (guideToggle) {
        guideToggle.addEventListener('click', () => {
            const isVisible = guideContent.style.display === 'block';
            guideContent.style.display = isVisible ? 'none' : 'block';
            guideToggle.textContent = isVisible ? '📖 How to Use Moodify' : '📖 Hide Guide';
        });
    }
});

// Mood mappings for audio features
const moodCriteria = {
    happy: { valence: [0.6, 1.0], energy: [0.5, 1.0] },
    sad: { valence: [0.0, 0.4], energy: [0.0, 0.5] },
    energetic: { valence: [0.4, 1.0], energy: [0.7, 1.0] },
    chill: { valence: [0.3, 0.7], energy: [0.0, 0.4] }
};

// Check if token is expired or about to expire (within 5 minutes)
function isTokenExpired() {
    if (!tokenExpiryTime) return false;
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    return now >= (tokenExpiryTime - fiveMinutes);
}

// Refresh the access token
async function refreshAccessToken() {
    if (!refreshToken) {
        showReconnectButton();
        return false;
    }

    try {
        const response = await fetch('/api/refresh-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken })
        });

        const data = await response.json();
        
        if (data.access_token) {
            accessToken = data.access_token;
            tokenExpiryTime = Date.now() + (data.expires_in * 1000);
            console.log('Token refreshed successfully');
            return true;
        } else {
            throw new Error('Failed to refresh token');
        }
    } catch (error) {
        console.error('Error refreshing token:', error);
        showReconnectButton();
        return false;
    }
}

// Show reconnect button when token can't be refreshed
function showReconnectButton() {
    document.getElementById('spotifyAuthButton').style.display = 'none';
    document.getElementById('reconnectButton').style.display = 'inline-block';
    document.querySelector('.mood-selection').style.display = 'none';
    document.querySelector('.random-album').style.display = 'none';
    document.querySelector('.playlist-creation').style.display = 'none';
    showError('⚠️ Session expired. Please reconnect to Spotify to continue.');
}

// Enhanced fetch with automatic token refresh
async function fetchWithAuth(url, options = {}) {
    // Check if token needs refresh
    if (isTokenExpired()) {
        const refreshed = await refreshAccessToken();
        if (!refreshed) {
            throw new Error('Token refresh failed');
        }
    }

    const response = await fetch(url, options);
    
    // If we get 401, try refreshing token once
    if (response.status === 401) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
            // Retry the request with new token
            const newUrl = url.replace(/access_token=[^&]*/, `access_token=${accessToken}`);
            return fetch(newUrl, options);
        }
    }
    
    // Handle rate limiting
    if (response.status === 429) {
        const data = await response.json();
        const retryAfter = data.retryAfter || 60;
        showError(`Rate limit reached. Please wait ${retryAfter} seconds and try again.`);
        throw new Error('Rate limited');
    }
    
    return response;
}

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

function handleAuthenticationSuccess(token, refresh, expiresIn) {
    accessToken = token;
    refreshToken = refresh;
    tokenExpiryTime = Date.now() + (expiresIn * 1000);
    
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
        const response = await fetchWithAuth(`/api/albums?access_token=${accessToken}`);
        const data = await response.json();
        userAlbums = data.items || [];
        
        if (userAlbums.length === 0) {
            showError('No albums found in your library. Add some albums to Spotify first!');
        } else {
            console.log(`Loaded ${userAlbums.length} albums`);
        }
    } catch (error) {
        console.error('Error loading albums:', error);
        if (error.message !== 'Rate limited') {
            showError('Failed to load albums. Please refresh the page.');
        }
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
        const response = await fetchWithAuth(`/api/recommend-albums?access_token=${accessToken}&mood=${mood}`);
        
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
        albumList.innerHTML = `
            <li class="empty-state">
                <div class="empty-state-content">
                    <div class="empty-icon">🎵</div>
                    <h3>No Matching Albums Found</h3>
                    <p>We couldn't find albums that match this mood in your library.</p>
                    <p class="empty-tip">💡 Try a different mood or add more albums to your Spotify library!</p>
                </div>
            </li>
        `;
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
                    `<img src="${album.images[0].url}" alt="${album.name}" class="album-cover" loading="lazy">` : 
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
document.getElementById('reconnectButton').addEventListener('click', authenticateWithSpotify);
document.getElementById('play-random-album').addEventListener('click', playRandomAlbum);
document.getElementById('create-playlist-btn').addEventListener('click', createPlaylist);

// Check for access token on page load
window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('access_token');
    const refresh = urlParams.get('refresh_token');
    const expiresIn = urlParams.get('expires_in');

    if (token) {
        handleAuthenticationSuccess(token, refresh, parseInt(expiresIn) || 3600);
        
        // Clean URL
        window.history.replaceState({}, document.title, '/');
    }
    
    // Check for errors
    const hash = window.location.hash;
    if (hash.includes('error')) {
        const errorType = hash.split('=')[1];
        showError(`Authentication error: ${errorType.replace(/_/g, ' ')}`);
    }
};
