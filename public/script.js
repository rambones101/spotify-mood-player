let accessToken = null;
let userAlbums = [];

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
        document.getElementById('connection-status').textContent = 'Authentication failed. Please try again.';
    }
}

function handleAuthenticationSuccess(token) {
    accessToken = token;
    document.getElementById('connection-status').textContent = 'Connected to Spotify!';
    document.getElementById('connection-status').style.color = '#1DB954';
    document.querySelector('.mood-selection').style.display = 'block';
    document.querySelector('.random-album').style.display = 'block';
    document.querySelector('.authentication').style.display = 'none';
    
    // Load user's albums
    loadUserAlbums();
}

async function loadUserAlbums() {
    try {
        const response = await fetch(`/api/albums?access_token=${accessToken}`);
        const data = await response.json();
        userAlbums = data.items;
        console.log(`Loaded ${userAlbums.length} albums`);
    } catch (error) {
        console.error('Error loading albums:', error);
        document.getElementById('connection-status').textContent = 'Failed to load albums.';
    }
}

async function findAlbumByMood() {
    const mood = document.getElementById('mood').value;
    
    if (userAlbums.length === 0) {
        alert('No albums found in your library. Please add some albums to your Spotify library first.');
        return;
    }

    // Get audio features for tracks in albums
    const albumsWithFeatures = [];
    
    for (const albumItem of userAlbums) {
        const album = albumItem.album;
        
        // Get track IDs from the album
        const trackIds = album.tracks?.items?.map(track => track.id).filter(id => id).slice(0, 10) || [];
        
        if (trackIds.length === 0) continue;

        try {
            const response = await fetch(`/api/audio-features?access_token=${accessToken}&track_ids=${trackIds.join(',')}`);
            const data = await response.json();
            
            if (data.audio_features) {
                // Calculate average features for the album
                const features = data.audio_features.filter(f => f !== null);
                if (features.length > 0) {
                    const avgValence = features.reduce((sum, f) => sum + f.valence, 0) / features.length;
                    const avgEnergy = features.reduce((sum, f) => sum + f.energy, 0) / features.length;
                    
                    // Check if album matches mood criteria
                    const criteria = moodCriteria[mood];
                    if (avgValence >= criteria.valence[0] && avgValence <= criteria.valence[1] &&
                        avgEnergy >= criteria.energy[0] && avgEnergy <= criteria.energy[1]) {
                        albumsWithFeatures.push({ album, avgValence, avgEnergy });
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching audio features:', error);
        }
    }

    if (albumsWithFeatures.length === 0) {
        displayAlbums([]);
        document.getElementById('connection-status').textContent = `No albums found matching your ${mood} mood. Try a different mood!`;
        return;
    }

    // Display matching albums
    displayAlbums(albumsWithFeatures.map(item => item.album));
    document.getElementById('connection-status').textContent = `Found ${albumsWithFeatures.length} album(s) matching your ${mood} mood!`;
}

function displayAlbums(albums) {
    const albumList = document.getElementById('album-list');
    albumList.innerHTML = '';

    if (albums.length === 0) {
        albumList.innerHTML = '<li>No albums found. Try a different mood!</li>';
        return;
    }

    albums.forEach(album => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="album-item">
                ${album.images && album.images[0] ? `<img src="${album.images[0].url}" alt="${album.name}" class="album-cover">` : ''}
                <div class="album-info">
                    <strong>${album.name}</strong><br>
                    <span>${album.artists.map(artist => artist.name).join(', ')}</span><br>
                    <a href="${album.external_urls.spotify}" target="_blank" class="play-button">Open in Spotify</a>
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

// Event listeners
document.getElementById('spotifyAuthButton').addEventListener('click', authenticateWithSpotify);
document.getElementById('find-album').addEventListener('click', findAlbumByMood);
document.getElementById('play-random-album').addEventListener('click', playRandomAlbum);

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
