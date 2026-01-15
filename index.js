const express = require('express');
const request = require('request');
const dotenv = require('dotenv');
const path = require('path');

// Initialize environment variables
dotenv.config();

// Create an Express application
const app = express();

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Spotify API credentials
const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirectUri = process.env.REDIRECT_URI;

// Route to get Spotify auth URL
app.get('/auth/login', (req, res) => {
    const scopes = 'user-read-private user-read-email user-library-read user-modify-playback-state user-read-playback-state streaming';
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

            // Redirect to the home page with tokens
            res.redirect(`/?access_token=${accessToken}&refresh_token=${refreshToken}`);
        } else {
            // Log and handle errors
            console.error('Error getting tokens:', error);
            res.redirect('/#error=token_retrieval_failed');
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
        } else {
            console.error('Error fetching albums:', error);
            res.status(response.statusCode).json({ error: 'Failed to fetch albums' });
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

// Start the server
const port = 5500;
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
    console.log(`Open http://localhost:${port} in your browser`);
});
