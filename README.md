# Spotify Mood-Based Album Recommender

A web application that recommends albums from your Spotify library based on your current mood using Spotify's audio features analysis.

## Features

- 🎵 **Spotify Authentication** - Securely connect to your Spotify account
- 😊 **Mood-Based Recommendations** - Get album suggestions based on:
  - Happy
  - Sad
  - Energetic
  - Chill
- 🎲 **Random Album** - Play a surprise album from your library
- 🎨 **Beautiful UI** - Modern, responsive design with gradient background

## How It Works

The app analyzes the audio features (valence and energy) of tracks in your saved albums to match them with your selected mood:

- **Valence**: Musical positiveness (0.0 = sad, 1.0 = happy)
- **Energy**: Intensity and activity (0.0 = calm, 1.0 = energetic)

## Setup Instructions

### 1. Prerequisites

- Node.js installed (v14 or higher)
- A Spotify account
- Spotify Developer credentials

### 2. Get Spotify API Credentials

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click "Create App"
4. Fill in:
   - **App Name**: Spotify Mood Player
   - **App Description**: Mood-based album recommender
   - **Redirect URI**: `http://localhost:5500/callback`
5. Click "Save"
6. Copy your **Client ID** and **Client Secret**

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your credentials:
   ```
   SPOTIFY_CLIENT_ID=your_client_id_here
   SPOTIFY_CLIENT_SECRET=your_client_secret_here
   REDIRECT_URI=http://localhost:5500/callback
   ```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run the Application

```bash
node index.js
```

The server will start on `http://localhost:5500`

### 6. Use the App

1. Open your browser and go to `http://localhost:5500`
2. Click "Connect with Spotify"
3. Authorize the app
4. Select your mood and click "Find Album"
5. Or click "Play Random Album" for a surprise!

## Project Structure

```
spotify-mood-player/
├── index.js              # Express server with Spotify OAuth
├── package.json          # Dependencies
├── .env                  # Environment variables (not in git)
├── .env.example          # Example environment variables
├── README.md            # This file
└── public/
    ├── index.html       # Main HTML page
    ├── script.js        # Frontend JavaScript
    └── style.css        # Styling
```

## Technologies Used

- **Backend**: Node.js, Express
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **API**: Spotify Web API
- **Authentication**: OAuth 2.0

## Mood Criteria

The app uses these thresholds for mood matching:

| Mood | Valence Range | Energy Range |
|------|---------------|--------------|
| Happy | 0.6 - 1.0 | 0.5 - 1.0 |
| Sad | 0.0 - 0.4 | 0.0 - 0.5 |
| Energetic | 0.4 - 1.0 | 0.7 - 1.0 |
| Chill | 0.3 - 0.7 | 0.0 - 0.4 |

## Troubleshooting

### No albums found for a mood
- Make sure you have albums saved in your Spotify library
- Try different moods as not all albums may match every mood
- The app analyzes up to 10 tracks per album

### Authentication errors
- Verify your `.env` file has correct credentials
- Check that the Redirect URI in your Spotify app settings matches `http://localhost:5500/callback`
- Make sure you're running the server on port 5500

### Server won't start
- Check if port 5500 is already in use
- Make sure all dependencies are installed (`npm install`)

## Future Enhancements

- [ ] Add Spotify Web Playback SDK for in-app playback
- [ ] Support for playlists
- [ ] More mood options
- [ ] User's top artists integration
- [ ] Recently played analysis
- [ ] Save favorite mood-album combinations

## License

MIT

## Author

Built with ❤️ for music lovers
