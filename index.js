const express = require('express');
const request = require('request');
const dotenv = require('dotenv');
const path = require('path');

// Initialize environment variables
dotenv.config();

// Create an Express application
const app = express();

// Middleware
app.use(express.json()); // Parse JSON request bodies
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// Spotify API credentials
const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirectUri = process.env.REDIRECT_URI;

// ==================== MOOD MAPPING SYSTEM ====================
// Define mood characteristics based on Spotify audio features
const MOOD_PROFILES = {
    happy: {
        valence: { min: 0.7, max: 1.0 },
        energy: { min: 0.5, max: 1.0 },
        weight: { valence: 0.6, energy: 0.4 }
    },
    sad: {
        valence: { min: 0.0, max: 0.3 },
        energy: { min: 0.0, max: 0.5 },
        weight: { valence: 0.7, energy: 0.3 }
    },
    energetic: {
        valence: { min: 0.4, max: 1.0 },
        energy: { min: 0.7, max: 1.0 },
        danceability: { min: 0.5, max: 1.0 },
        weight: { energy: 0.5, danceability: 0.3, valence: 0.2 }
    },
    chill: {
        valence: { min: 0.3, max: 0.7 },
        energy: { min: 0.2, max: 0.5 },
        tempo: { min: 60, max: 120 },
        weight: { energy: 0.4, valence: 0.3, tempo: 0.3 }
    }
};

/**
 * Calculate how well audio features match a mood profile
 * Returns a score from 0 to 1 (1 = perfect match)
 */
function calculateMoodScore(audioFeatures, moodProfile) {
    let score = 0;
    let totalWeight = 0;

    // Check valence (musical positiveness)
    if (moodProfile.valence) {
        const valence = audioFeatures.valence;
        const inRange = valence >= moodProfile.valence.min && valence <= moodProfile.valence.max;
        const weight = moodProfile.weight.valence || 0.5;
        
        if (inRange) {
            // Calculate how centered the value is in the range
            const midpoint = (moodProfile.valence.min + moodProfile.valence.max) / 2;
            const range = moodProfile.valence.max - moodProfile.valence.min;
            const distance = Math.abs(valence - midpoint);
            const normalized = 1 - (distance / (range / 2));
            score += normalized * weight;
        }
        totalWeight += weight;
    }

    // Check energy
    if (moodProfile.energy) {
        const energy = audioFeatures.energy;
        const inRange = energy >= moodProfile.energy.min && energy <= moodProfile.energy.max;
        const weight = moodProfile.weight.energy || 0.5;
        
        if (inRange) {
            const midpoint = (moodProfile.energy.min + moodProfile.energy.max) / 2;
            const range = moodProfile.energy.max - moodProfile.energy.min;
            const distance = Math.abs(energy - midpoint);
            const normalized = 1 - (distance / (range / 2));
            score += normalized * weight;
        }
        totalWeight += weight;
    }

    // Check danceability (for energetic mood)
    if (moodProfile.danceability) {
        const danceability = audioFeatures.danceability;
        const inRange = danceability >= moodProfile.danceability.min && danceability <= moodProfile.danceability.max;
        const weight = moodProfile.weight.danceability || 0.3;
        
        if (inRange) {
            const midpoint = (moodProfile.danceability.min + moodProfile.danceability.max) / 2;
            const range = moodProfile.danceability.max - moodProfile.danceability.min;
            const distance = Math.abs(danceability - midpoint);
            const normalized = 1 - (distance / (range / 2));
            score += normalized * weight;
        }
        totalWeight += weight;
    }

    // Check tempo (for chill mood)
    if (moodProfile.tempo) {
        const tempo = audioFeatures.tempo;
        const inRange = tempo >= moodProfile.tempo.min && tempo <= moodProfile.tempo.max;
        const weight = moodProfile.weight.tempo || 0.3;
        
        if (inRange) {
            const midpoint = (moodProfile.tempo.min + moodProfile.tempo.max) / 2;
            const range = moodProfile.tempo.max - moodProfile.tempo.min;
            const distance = Math.abs(tempo - midpoint);
            const normalized = 1 - (distance / (range / 2));
            score += normalized * weight;
        }
        totalWeight += weight;
    }

    return totalWeight > 0 ? score / totalWeight : 0;
}

/**
 * Calculate average mood score for an album based on its tracks
 */
function calculateAlbumMoodScore(tracksAudioFeatures, mood) {
    const moodProfile = MOOD_PROFILES[mood];
    if (!moodProfile) return 0;

    let totalScore = 0;
    let validTracks = 0;

    tracksAudioFeatures.forEach(features => {
        if (features && features.valence !== null) {
            totalScore += calculateMoodScore(features, moodProfile);
            validTracks++;
        }
    });

    return validTracks > 0 ? totalScore / validTracks : 0;
}

// ==================== API ROUTES ====================

// Route to get Spotify auth URL
app.get('/auth/login', (req, res) => {
    const scopes = 'user-read-private user-read-email user-library-read user-top-read user-modify-playback-state user-read-playback-state streaming playlist-modify-public playlist-modify-private';
    const authUrl = 'https://accounts.spotify.com/authorize' +
        '?response_type=code' +
        '&client_id=' + clientId +
        '&scope=' + encodeURIComponent(scopes) +
        '&redirect_uri=' + encodeURIComponent(redirectUri);
    res.json({ url: authUrl });
});

// Route to handle the callback from Spotify
app.get('/callback', (req, res) => {
    // Retrieve the authorization code from the request
    const code = req.query.code || null;
    if (code === null) {
        res.redirect('/#error=authorization_failed');
        return;
    }

    // Set up the request for exchanging the code for an access token
    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            code: code,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code'
        },
        headers: {
            'Authorization': 'Basic ' + (Buffer.from(clientId + ':' + clientSecret).toString('base64'))
        },
        json: true
    };

    // Make the request to Spotify
    request.post(authOptions, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            // Extract access and refresh tokens
            const accessToken = body.access_token;
            const refreshToken = body.refresh_token;
            const expiresIn = body.expires_in; // Token expires in 3600 seconds (1 hour)

            // Redirect to the home page with tokens and expiry time
            res.redirect(`/?access_token=${accessToken}&refresh_token=${refreshToken}&expires_in=${expiresIn}`);
        } else {
            // Log and handle errors
            console.error('Error getting tokens:', error, body);
            res.redirect('/#error=token_retrieval_failed');
        }
    });
});

// Route to refresh access token
app.post('/api/refresh-token', (req, res) => {
    const refreshToken = req.body.refresh_token;
    
    if (!refreshToken) {
        return res.status(400).json({ error: 'No refresh token provided' });
    }

    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            grant_type: 'refresh_token',
            refresh_token: refreshToken
        },
        headers: {
            'Authorization': 'Basic ' + (Buffer.from(clientId + ':' + clientSecret).toString('base64'))
        },
        json: true
    };

    request.post(authOptions, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            res.json({
                access_token: body.access_token,
                expires_in: body.expires_in
            });
        } else {
            console.error('Error refreshing token:', error);
            res.status(response?.statusCode || 500).json({ error: 'Failed to refresh token' });
        }
    });
});

// Route to get user's albums
app.get('/api/albums', (req, res) => {
    const accessToken = req.query.access_token;
    
    if (!accessToken) {
        return res.status(401).json({ error: 'No access token provided' });
    }

    const options = {
        url: 'https://api.spotify.com/v1/me/albums?limit=50',
        headers: {
            'Authorization': 'Bearer ' + accessToken
        },
        json: true
    };

    request.get(options, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            res.json(body);
        } else if (response?.statusCode === 429) {
            // Rate limit exceeded
            const retryAfter = response.headers['retry-after'] || 60;
            console.error('Rate limit exceeded. Retry after:', retryAfter);
            res.status(429).json({ 
                error: 'Rate limit exceeded',
                retryAfter: retryAfter,
                message: `Too many requests. Please wait ${retryAfter} seconds.`
            });
        } else if (response?.statusCode === 401) {
            // Unauthorized - token expired
            res.status(401).json({ 
                error: 'Token expired',
                message: 'Your session has expired. Please reconnect to Spotify.'
            });
        } else {
            console.error('Error fetching albums:', error);
            res.status(response?.statusCode || 500).json({ error: 'Failed to fetch albums' });
        }
    });
});

// Route to get user's top tracks for mood analysis
app.get('/api/audio-features', (req, res) => {
    const accessToken = req.query.access_token;
    const trackIds = req.query.track_ids;
    
    if (!accessToken || !trackIds) {
        return res.status(401).json({ error: 'Missing parameters' });
    }

    const options = {
        url: `https://api.spotify.com/v1/audio-features?ids=${trackIds}`,
        headers: {
            'Authorization': 'Bearer ' + accessToken
        },
        json: true
    };

    request.get(options, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            res.json(body);
        } else {
            console.error('Error fetching audio features:', error);
            res.status(response.statusCode).json({ error: 'Failed to fetch audio features' });
        }
    });
});

// Route to get mood-based album recommendations
app.get('/api/recommend-albums', async (req, res) => {
    const accessToken = req.query.access_token;
    const mood = req.query.mood;
    
    if (!accessToken || !mood) {
        return res.status(400).json({ error: 'Missing access_token or mood parameter' });
    }

    if (!MOOD_PROFILES[mood]) {
        return res.status(400).json({ error: 'Invalid mood. Valid moods: happy, sad, energetic, chill' });
    }

    try {
        // Step 1: Fetch all user's albums
        const albumsOptions = {
            url: 'https://api.spotify.com/v1/me/albums?limit=50',
            headers: { 'Authorization': 'Bearer ' + accessToken },
            json: true
        };

        request.get(albumsOptions, (error, response, albumsBody) => {
            if (error || response.statusCode !== 200) {
                console.error('Error fetching albums:', error);
                return res.status(response?.statusCode || 500).json({ error: 'Failed to fetch albums' });
            }

            const albums = albumsBody.items;
            
            if (albums.length === 0) {
                return res.json({ 
                    message: 'No albums found in your library',
                    albums: [],
                    mood: mood 
                });
            }

            // Step 2: For each album, get track audio features
            const albumPromises = albums.map(item => {
                return new Promise((resolve) => {
                    const album = item.album;
                    const trackIds = album.tracks.items
                        .map(track => track.id)
                        .filter(id => id) // Remove null IDs
                        .slice(0, 10) // Limit to first 10 tracks for performance
                        .join(',');

                    if (!trackIds) {
                        resolve({ album, moodScore: 0 });
                        return;
                    }

                    const featuresOptions = {
                        url: `https://api.spotify.com/v1/audio-features?ids=${trackIds}`,
                        headers: { 'Authorization': 'Bearer ' + accessToken },
                        json: true
                    };

                    request.get(featuresOptions, (error, response, featuresBody) => {
                        if (error || response.statusCode !== 200 || !featuresBody.audio_features) {
                            resolve({ album, moodScore: 0 });
                            return;
                        }

                        const audioFeatures = featuresBody.audio_features.filter(f => f !== null);
                        const moodScore = calculateAlbumMoodScore(audioFeatures, mood);
                        
                        resolve({
                            album: {
                                id: album.id,
                                name: album.name,
                                artists: album.artists.map(a => a.name),
                                images: album.images,
                                external_urls: album.external_urls,
                                release_date: album.release_date,
                                total_tracks: album.total_tracks,
                                uri: album.uri
                            },
                            moodScore: moodScore,
                            audioFeatures: {
                                avgValence: audioFeatures.reduce((sum, f) => sum + f.valence, 0) / audioFeatures.length,
                                avgEnergy: audioFeatures.reduce((sum, f) => sum + f.energy, 0) / audioFeatures.length,
                                avgDanceability: audioFeatures.reduce((sum, f) => sum + f.danceability, 0) / audioFeatures.length,
                                avgTempo: audioFeatures.reduce((sum, f) => sum + f.tempo, 0) / audioFeatures.length
                            }
                        });
                    });
                });
            });

            // Step 3: Wait for all album analyses and sort by mood score
            Promise.all(albumPromises).then(analyzedAlbums => {
                // Filter albums with a minimum mood score and sort
                const filteredAlbums = analyzedAlbums
                    .filter(item => item.moodScore > 0.25) // Lowered threshold for better results
                    .sort((a, b) => b.moodScore - a.moodScore); // Sort by best match first

                res.json({
                    mood: mood,
                    totalAlbums: albums.length,
                    matchingAlbums: filteredAlbums.length,
                    albums: filteredAlbums.slice(0, 20), // Return top 20 matches
                    moodProfile: MOOD_PROFILES[mood]
                });
            });
        });

    } catch (error) {
        console.error('Error in recommend-albums:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to get user's liked songs filtered by mood
app.get('/api/liked-songs', async (req, res) => {
    const accessToken = req.query.access_token;
    const mood = req.query.mood;
    const limit = parseInt(req.query.limit) || 50;
    
    if (!accessToken) {
        return res.status(400).json({ error: 'Missing access_token parameter' });
    }

    if (mood && !MOOD_PROFILES[mood]) {
        return res.status(400).json({ error: 'Invalid mood. Valid moods: happy, sad, energetic, chill' });
    }

    try {
        // Fetch user's liked/saved tracks
        const tracksOptions = {
            url: `https://api.spotify.com/v1/me/tracks?limit=50`,
            headers: { 'Authorization': 'Bearer ' + accessToken },
            json: true
        };

        request.get(tracksOptions, async (error, response, tracksBody) => {
            if (error || response.statusCode !== 200) {
                console.error('Error fetching liked songs:', error);
                return res.status(response?.statusCode || 500).json({ error: 'Failed to fetch liked songs' });
            }

            const tracks = tracksBody.items;
            
            if (tracks.length === 0) {
                return res.json({ 
                    message: 'No liked songs found',
                    tracks: [],
                    mood: mood 
                });
            }

            // Get audio features for all tracks
            const trackIds = tracks.map(item => item.track.id).filter(id => id).join(',');
            
            const featuresOptions = {
                url: `https://api.spotify.com/v1/audio-features?ids=${trackIds}`,
                headers: { 'Authorization': 'Bearer ' + accessToken },
                json: true
            };

            request.get(featuresOptions, (error, response, featuresBody) => {
                if (error || response.statusCode !== 200 || !featuresBody.audio_features) {
                    return res.status(response?.statusCode || 500).json({ error: 'Failed to fetch audio features' });
                }

                const audioFeatures = featuresBody.audio_features;

                // Combine tracks with their audio features
                const tracksWithFeatures = tracks.map((item, index) => {
                    const track = item.track;
                    const features = audioFeatures[index];
                    
                    if (!features) return null;

                    let moodScore = 0;
                    if (mood) {
                        moodScore = calculateMoodScore(features, MOOD_PROFILES[mood]);
                    }

                    return {
                        id: track.id,
                        name: track.name,
                        artists: track.artists.map(a => a.name),
                        album: {
                            name: track.album.name,
                            images: track.album.images
                        },
                        uri: track.uri,
                        duration_ms: track.duration_ms,
                        external_urls: track.external_urls,
                        moodScore: moodScore,
                        audioFeatures: {
                            valence: features.valence,
                            energy: features.energy,
                            danceability: features.danceability,
                            tempo: features.tempo
                        }
                    };
                }).filter(track => track !== null);

                // If mood is specified, filter and sort by mood score
                let filteredTracks = tracksWithFeatures;
                if (mood) {
                    filteredTracks = tracksWithFeatures
                        .filter(track => track.moodScore > 0.3) // Minimum 30% match
                        .sort((a, b) => b.moodScore - a.moodScore);
                }

                // Apply limit
                const limitedTracks = filteredTracks.slice(0, limit);

                res.json({
                    mood: mood || 'all',
                    totalLikedSongs: tracks.length,
                    matchingTracks: filteredTracks.length,
                    tracks: limitedTracks
                });
            });
        });

    } catch (error) {
        console.error('Error in liked-songs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to create a playlist from liked songs filtered by mood
app.post('/api/create-playlist', async (req, res) => {
    const { accessToken, mood, playlistName, trackCount } = req.body;
    
    if (!accessToken || !mood || !playlistName) {
        return res.status(400).json({ 
            error: 'Missing required parameters: accessToken, mood, playlistName' 
        });
    }

    if (!MOOD_PROFILES[mood]) {
        return res.status(400).json({ error: 'Invalid mood. Valid moods: happy, sad, energetic, chill' });
    }

    const maxTracks = parseInt(trackCount) || 25;

    try {
        // Step 1: Get user profile to get user ID
        const profileOptions = {
            url: 'https://api.spotify.com/v1/me',
            headers: { 'Authorization': 'Bearer ' + accessToken },
            json: true
        };

        request.get(profileOptions, (error, response, profileBody) => {
            if (error || response.statusCode !== 200) {
                console.error('Error fetching user profile:', error);
                return res.status(response?.statusCode || 500).json({ error: 'Failed to fetch user profile' });
            }

            const userId = profileBody.id;

            // Step 2: Get liked songs filtered by mood
            const tracksUrl = `http://localhost:5500/api/liked-songs?access_token=${accessToken}&mood=${mood}&limit=${maxTracks}`;
            
            request.get({ url: tracksUrl, json: true }, (error, response, likedSongsData) => {
                if (error || response.statusCode !== 200) {
                    console.error('Error fetching liked songs for playlist:', error);
                    return res.status(response?.statusCode || 500).json({ error: 'Failed to fetch liked songs' });
                }

                if (likedSongsData.tracks.length === 0) {
                    return res.json({
                        success: false,
                        message: `No liked songs found matching ${mood} mood. Try a different mood!`
                    });
                }

                // Step 3: Create the playlist
                const createPlaylistOptions = {
                    url: `https://api.spotify.com/v1/users/${userId}/playlists`,
                    headers: { 
                        'Authorization': 'Bearer ' + accessToken,
                        'Content-Type': 'application/json'
                    },
                    json: true,
                    body: {
                        name: playlistName,
                        description: `A ${mood} mood playlist created by Moodify 🎵`,
                        public: false
                    }
                };

                request.post(createPlaylistOptions, (error, response, playlistBody) => {
                    if (error || response.statusCode !== 201) {
                        console.error('Error creating playlist:', error);
                        return res.status(response?.statusCode || 500).json({ error: 'Failed to create playlist' });
                    }

                    const playlistId = playlistBody.id;
                    const trackUris = likedSongsData.tracks.map(track => track.uri);

                    // Step 4: Add tracks to the playlist
                    const addTracksOptions = {
                        url: `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
                        headers: { 
                            'Authorization': 'Bearer ' + accessToken,
                            'Content-Type': 'application/json'
                        },
                        json: true,
                        body: {
                            uris: trackUris
                        }
                    };

                    request.post(addTracksOptions, (error, response, addTracksBody) => {
                        if (error || response.statusCode !== 201) {
                            console.error('Error adding tracks to playlist:', error);
                            return res.status(response?.statusCode || 500).json({ 
                                error: 'Playlist created but failed to add tracks',
                                playlistId: playlistId
                            });
                        }

                        // Success!
                        res.json({
                            success: true,
                            message: `Successfully created playlist "${playlistName}" with ${trackUris.length} tracks!`,
                            playlist: {
                                id: playlistId,
                                name: playlistBody.name,
                                external_urls: playlistBody.external_urls,
                                tracks_added: trackUris.length,
                                mood: mood
                            }
                        });
                    });
                });
            });
        });

    } catch (error) {
        console.error('Error in create-playlist:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start the server
// Use environment PORT for deployment platforms (Heroku, Railway, etc.) or default to 5500
const port = process.env.PORT || 5500;
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
    console.log(`Open http://127.0.0.1:${port} in your browser`);
});
