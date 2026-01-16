# 🎵 Moodify

**Your Mood-Based Music Companion**

Moodify is a web application that recommends albums from your Spotify library based on your current mood. Using Spotify's audio analysis features, Moodify helps you discover the perfect album to match how you're feeling. Additionally, create custom playlists from your liked songs filtered by mood!

---

## ✨ Features

### Core Features
- 🎵 **Spotify Authentication** - Secure OAuth 2.0 integration with your Spotify account
- 😊 **Mood-Based Album Recommendations** - Get personalized album suggestions based on:
  - **Happy** - Upbeat, positive vibes
  - **Sad** - Melancholic, introspective tracks
  - **Energetic** - High-energy, danceable music
  - **Chill** - Relaxed, low-tempo vibes
- 🎶 **Smart Playlist Generator** - Create custom playlists from your liked songs filtered by mood
- 🎲 **Random Album Player** - Surprise yourself with a random album from your library
- 📱 **Responsive Design** - Beautiful UI that works on desktop and mobile

### Coming Soon
- Advanced mood customization with sliders
- Multi-mood blending
- Recently played analysis
- Playlist sharing

---

## 🎯 How It Works

Moodify uses Spotify's audio features API to analyze tracks in your library:

### Audio Features Analyzed
- **Valence** (0.0-1.0): Musical positiveness and cheerfulness
  - Low valence = Sad, melancholic
  - High valence = Happy, euphoric
- **Energy** (0.0-1.0): Intensity and activity level
  - Low energy = Calm, peaceful
  - High energy = Fast, loud
- **Danceability** (0.0-1.0): How suitable for dancing
- **Tempo**: Beats per minute (BPM)

### Mood Mapping Algorithm
Each mood is defined by specific audio feature ranges:

| Mood | Valence | Energy | Characteristics |
|------|---------|--------|-----------------|
| Happy | 0.7-1.0 | 0.5-1.0 | Positive, uplifting |
| Sad | 0.0-0.3 | 0.0-0.5 | Melancholic, introspective |
| Energetic | 0.4-1.0 | 0.7-1.0 | High-intensity, danceable |
| Chill | 0.3-0.7 | 0.2-0.5 | Relaxed, low-tempo |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **Spotify Account** (Free or Premium)
- **Spotify Developer Account** (Free) - Required for API credentials

### 1. Clone or Download the Project

```bash
git clone https://github.com/yourusername/moodify.git
cd moodify
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Get Spotify API Credentials

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click **"Create App"**
4. Fill in the app details:
   - **App Name**: `Moodify`
   - **App Description**: `Mood-based album and playlist recommender`
   - **Redirect URI**: `http://localhost:5500/callback`
   - Accept the Terms of Service
5. Click **"Save"**
6. On your app dashboard, copy your:
   - **Client ID**
   - **Client Secret** (click "Show Client Secret")

### 4. Configure Environment Variables

1. Open the `.env` file in the project root
2. Replace the placeholder values with your credentials:
   ```
   SPOTIFY_CLIENT_ID=your_client_id_here
   SPOTIFY_CLIENT_SECRET=your_client_secret_here
   REDIRECT_URI=http://localhost:5500/callback
   ```

### 5. Run the Application

```bash
node index.js
```

The server will start on `http://localhost:5500`

### 6. Use Moodify

1. Open your browser and navigate to `http://localhost:5500`
2. Click **"Connect with Spotify"** 
3. Authorize the app (redirects to Spotify login)
4. **For Album Recommendations**:
   - Select your current mood from the dropdown
   - Click "Find Album"
   - Browse your mood-matched albums
5. **For Playlist Creation**:
   - Select mood for your playlist
   - Enter a custom playlist name
   - Choose number of songs
   - Click "Create Playlist"
6. **For Random Album**: Click "Play Random Album" for a surprise!

---

## 📂 Project Structure

```
moodify/
├── index.js                # Express server with Spotify OAuth & API routes
├── package.json            # Project metadata & dependencies
├── .env                    # Environment variables (DO NOT COMMIT)
├── README.md              # Project documentation
├── public/                 # Frontend files
│   ├── index.html         # Main application page
│   ├── script.js          # Client-side JavaScript logic
│   └── style.css          # Application styling
└── Connected/             # Connected state page (legacy)
    ├── connected.html
    └── style.css
```

---

## 🛠️ Technologies Used

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **dotenv** - Environment variable management
- **request** - HTTP client for Spotify API calls
- **axios** - Promise-based HTTP client

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling with gradients and animations
- **Vanilla JavaScript** - Client-side logic (no frameworks)

### API & Authentication
- **Spotify Web API** - Music data and user library access
- **OAuth 2.0** - Secure user authentication

---

## 🎮 API Endpoints

### Authentication
- `GET /auth/login` - Returns Spotify authorization URL
- `GET /callback` - Handles OAuth callback and token exchange

### Music Data
- `GET /api/albums?access_token=<token>` - Fetches user's saved albums
- `GET /api/audio-features?access_token=<token>&track_ids=<ids>` - Gets audio features for tracks
- `GET /api/liked-songs?access_token=<token>` - Fetches user's liked songs
- `POST /api/create-playlist` - Creates a new playlist with filtered songs

---

## 🔐 Security Notes

- **Never commit your `.env` file** to version control
- Keep your `SPOTIFY_CLIENT_SECRET` private
- The access tokens expire after 1 hour (implement token refresh for production)
- For production deployment, use HTTPS and update redirect URI accordingly

---

## 🐛 Troubleshooting

### "Invalid client" error
- Double-check your Client ID and Client Secret in `.env`
- Ensure no extra spaces in your credentials

### "Invalid redirect URI" error
- Make sure `http://localhost:5500/callback` is added in your Spotify app settings
- Check that `REDIRECT_URI` in `.env` matches exactly

### No albums showing up
- Ensure you have saved albums in your Spotify library
- Check browser console for API errors
- Verify your access token is valid

### Port already in use
- Change the port in `index.js` (default is 5500)
- Update the redirect URI in both `.env` and Spotify dashboard

---

## 🚀 Future Enhancements

- [ ] Advanced mood customization with sliders (valence/energy)
- [ ] Multi-mood blending
- [ ] Recently played tracks analysis
- [ ] Playlist editing and management
- [ ] Save favorite mood configurations
- [ ] Social features - share playlists with friends
- [ ] Desktop app using Electron
- [ ] Mobile app (React Native)
- [ ] Machine learning for improved recommendations

---

## 📝 License

This project is open source and available for personal and educational use.

---

## 👨‍💻 Developer

Created by **Erick**

---

## 🙏 Acknowledgments

- [Spotify Web API](https://developer.spotify.com/documentation/web-api/) - Music data and authentication
- [Spotify Audio Features](https://developer.spotify.com/documentation/web-api/reference/get-audio-features) - Mood analysis capabilities

---

## 📞 Support

If you encounter any issues or have questions:
1. Check the Troubleshooting section above
2. Review [Spotify API Documentation](https://developer.spotify.com/documentation/web-api/)
3. Check that all dependencies are installed: `npm install`

---

**Enjoy discovering music with Moodify! 🎵✨**

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
