# 🎵 Moodify

<div align="center">

**Your Mood-Based Music Companion**

[![Spotify](https://img.shields.io/badge/Spotify-1DB954?style=for-the-badge&logo=spotify&logoColor=white)](https://spotify.com)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)

Moodify is a web application that recommends albums from your Spotify library based on your current mood. Using Spotify's audio analysis features, Moodify helps you discover the perfect album to match how you're feeling. Additionally, create custom playlists from your liked songs filtered by mood!

[Features](#-features) • [Demo](#-demo) • [Getting Started](#-getting-started) • [Deployment](#-deployment) • [API Reference](#-api-reference)

</div>

---

## 📸 Demo

<!-- Add screenshots here -->
![Moodify Homepage](screenshots/homepage.png)
*Moodify homepage with mood selection cards*

![Album Recommendations](screenshots/recommendations.png)
*Personalized album recommendations based on your mood*

![Playlist Generator](screenshots/playlist.png)
*Create custom playlists from your liked songs*

> **Note:** Screenshot placeholders - actual screenshots can be added to a `/screenshots` folder

---

## ✨ Features

### 🎧 Core Features
- **🔐 Spotify Authentication** - Secure OAuth 2.0 integration with automatic token refresh
- **😊 Mood-Based Album Recommendations** - Get personalized album suggestions based on:
  - **Happy** 😊 - Upbeat, positive vibes
  - **Sad** 😢 - Melancholic, introspective tracks
  - **Energetic** ⚡ - High-energy, danceable music
  - **Chill** 😌 - Relaxed, low-tempo vibes
- **🎶 Smart Playlist Generator** - Create custom playlists from your liked songs filtered by mood
- **🎲 Random Album Player** - Surprise yourself with a random album from your library
- **📱 Responsive Design** - Beautiful UI that works seamlessly on desktop, tablet, and mobile
- **🔄 Session Management** - Automatic token refresh prevents session expiration
- **⚡ Rate Limit Handling** - Graceful handling of Spotify API rate limits
- **💡 Empty State Guidance** - Helpful tips when no results are found

### 🎨 User Experience
- Visual mood cards with emojis and descriptions
- Smooth animations and transitions
- Loading states with progress indicators
- Color-coded success/error messages
- Reconnect button for expired sessions
- Mobile-optimized interface

---

## 🎯 How It Works

Moodify uses Spotify's audio features API to analyze tracks in your library with advanced algorithms.

### 🎼 Audio Features Analyzed

| Feature | Range | Description |
|---------|-------|-------------|
| **Valence** | 0.0-1.0 | Musical positiveness and cheerfulness |
| **Energy** | 0.0-1.0 | Intensity and activity level |
| **Danceability** | 0.0-1.0 | How suitable for dancing |
| **Tempo** | BPM | Beats per minute |

### 🧮 Mood Mapping Algorithm

Each mood is defined by specific audio feature ranges with weighted scoring:

| Mood | Valence | Energy | Danceability | Tempo | Use Case |
|------|---------|--------|--------------|-------|----------|
| **Happy** 😊 | 0.7-1.0 | 0.5-1.0 | - | - | Celebrations, workouts, good vibes |
| **Sad** 😢 | 0.0-0.3 | 0.0-0.5 | - | - | Reflection, rainy days, introspection |
| **Energetic** ⚡ | 0.4-1.0 | 0.7-1.0 | 0.5-1.0 | - | Workouts, parties, motivation |
| **Chill** 😌 | 0.3-0.7 | 0.2-0.5 | - | 60-120 | Study, relaxation, sleep |

**Scoring System:**
- Each track gets a mood score from 0.0 to 1.0
- Albums are scored based on average track scores
- Recommendations include albums with scores above 0.25 threshold
- Results sorted by best match first

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have:
- ✅ **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- ✅ **Spotify Account** (Free or Premium)
- ✅ **Spotify Developer Account** (Free) - Required for API credentials

### 📥 Installation

#### 1. Clone or Download the Project

```bash
git clone https://github.com/yourusername/moodify.git
cd moodify
```

#### 2. Install Dependencies

```bash
npm install
```

This will install:
- `express` - Web server framework
- `dotenv` - Environment variable management
- `request` - HTTP client for Spotify API
- `axios` - Promise-based HTTP client

### 🔑 Spotify API Setup

#### Step-by-Step Guide to Get Your Credentials

1. **Go to Spotify Developer Dashboard**
   - Navigate to [https://developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
   - Log in with your Spotify account

2. **Create a New App**
   - Click the **"Create App"** button
   - Fill in the required information:
     - **App Name**: `Moodify` (or your preferred name)
     - **App Description**: `Mood-based album and playlist recommender`
     - **Website**: `http://localhost` (or leave blank)
     - **Redirect URI**: `http://127.0.0.1:5500/callback`
   - ⚠️ **Important**: Use `127.0.0.1` NOT `localhost` - Spotify requires the IP address
   - Check the boxes to agree to Spotify's Terms of Service and Branding Guidelines
   - Click **"Save"**

3. **Get Your Credentials**
   - On your app's dashboard, you'll see:
     - **Client ID** - Copy this
     - **Client Secret** - Click "Show Client Secret" and copy it
   - Keep these credentials private and secure!

4. **Configure Scopes (Already Set)**
   - The app requests these scopes:
     - `user-read-private` - Read user profile
     - `user-read-email` - Read user email
     - `user-library-read` - Access saved albums
     - `user-top-read` - Read top tracks
     - `playlist-modify-public` - Create public playlists
     - `playlist-modify-private` - Create private playlists

### ⚙️ Configuration

1. **Create/Edit the `.env` file** in the project root:

```env
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
REDIRECT_URI=http://127.0.0.1:5500/callback
```

2. **Replace the placeholder values**:
   - Paste your Client ID from Spotify Dashboard
   - Paste your Client Secret from Spotify Dashboard
   - Keep the Redirect URI as `http://127.0.0.1:5500/callback`

3. **Save the file**

⚠️ **Security Note**: Never commit your `.env` file to version control. It's already in `.gitignore`.

### 🎬 Running the Application

1. **Start the server**:
```bash
node index.js
```

You should see:
```
Listening on port 5500
Open http://localhost:5500 in your browser
```

2. **Access the application**:
   - Open your browser
   - Navigate to `http://127.0.0.1:5500` (use 127.0.0.1, not localhost)
   - Click **"Connect with Spotify"**
   - Authorize the app when redirected to Spotify
   - Start discovering music!

### 💡 Usage Guide

#### **For Album Recommendations:**
1. Click a mood card (Happy, Sad, Energetic, or Chill)
2. Wait for the app to analyze your albums
3. Browse the recommended albums sorted by best match
4. Click any album to open it in Spotify

#### **For Playlist Creation:**
1. Scroll to the "Create a Mood Playlist" section
2. Select your desired mood from the dropdown
3. Enter a custom playlist name
4. Choose number of songs (10, 25, or 50)
5. Click "Create Playlist"
6. Your new playlist will be created in your Spotify account!

#### **For Random Album:**
1. Click "Play Random Album" button
2. Get a surprise album from your library

---

## 🚀 Deployment

### Option 1: Deploy to Heroku (Recommended for Beginners)

1. **Install Heroku CLI**:
```bash
npm install -g heroku
```

2. **Login to Heroku**:
```bash
heroku login
```

3. **Create a new Heroku app**:
```bash
heroku create your-moodify-app
```

4. **Set environment variables**:
```bash
heroku config:set SPOTIFY_CLIENT_ID=your_client_id
heroku config:set SPOTIFY_CLIENT_SECRET=your_client_secret
heroku config:set REDIRECT_URI=https://your-moodify-app.herokuapp.com/callback
```

5. **Update Spotify Dashboard**:
   - Add `https://your-moodify-app.herokuapp.com/callback` to Redirect URIs

6. **Deploy**:
```bash
git push heroku main
```

7. **Open your app**:
```bash
heroku open
```

### Option 2: Deploy to Railway

1. **Sign up at [Railway.app](https://railway.app)**

2. **Create New Project** → **Deploy from GitHub repo**

3. **Add Environment Variables**:
   - `SPOTIFY_CLIENT_ID`
   - `SPOTIFY_CLIENT_SECRET`
   - `REDIRECT_URI` (use your Railway domain)

4. **Update Spotify Dashboard** with Railway domain redirect URI

5. **Deploy** - Railway auto-deploys on push

### Option 3: Deploy to Vercel (Frontend) + Separate Backend

#### Backend (Node.js):
Deploy to Heroku, Railway, or Render as described above

#### Frontend:
1. **Separate the frontend files** (`public/` folder)
2. **Deploy to Vercel**:
```bash
npm install -g vercel
vercel
```
3. **Update API URLs** in `script.js` to point to your backend URL

### Option 4: VPS Deployment (Advanced)

For DigitalOcean, AWS EC2, or other VPS:

1. **Setup Node.js** on your server
2. **Clone the repository**
3. **Install PM2** for process management:
```bash
npm install -g pm2
pm2 start index.js --name moodify
pm2 startup
pm2 save
```
4. **Setup Nginx** as reverse proxy
5. **Get SSL certificate** with Let's Encrypt:
```bash
sudo certbot --nginx -d yourdomain.com
```
6. **Update Spotify redirect URI** to `https://yourdomain.com/callback`

### 🔒 Production Checklist

Before deploying to production:

- [ ] Set `NODE_ENV=production`
- [ ] Use HTTPS for redirect URI
- [ ] Update Spotify app redirect URI in Dashboard
- [ ] Never commit `.env` file
- [ ] Enable rate limiting
- [ ] Setup monitoring (e.g., Sentry, LogRocket)
- [ ] Add analytics (optional)
- [ ] Test token refresh mechanism
- [ ] Test on multiple devices
- [ ] Add custom domain (optional)

---

## 📂 Project Structure

```
moodify/
├── index.js                    # Express server with Spotify OAuth & API routes
├── package.json                # Project metadata & dependencies
├── .env                        # Environment variables (DO NOT COMMIT)
├── .env.example               # Example environment file
├── .gitignore                 # Git ignore rules
├── README.md                  # This file
├── PHASE6_TESTING_REPORT.md  # Testing documentation
├── public/                     # Frontend files (served statically)
│   ├── index.html             # Main application page
│   ├── script.js              # Client-side JavaScript logic
│   └── style.css              # Application styling
├── Connected/                  # Legacy connected state page
│   ├── connected.html
│   └── style.css
└── screenshots/                # App screenshots (create this folder)
    ├── homepage.png
    ├── recommendations.png
    └── playlist.png
```

---

## 🛠️ Technologies Used

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Minimal web application framework
- **dotenv** - Environment variable management
- **request** - Simplified HTTP client
- **axios** - Promise-based HTTP client for API calls

### Frontend
- **HTML5** - Semantic markup structure
- **CSS3** - Modern styling with gradients, animations, and flexbox/grid
- **Vanilla JavaScript** - No frameworks, pure JS for optimal performance

### API & Services
- **Spotify Web API** - Music data, user library, audio features
- **OAuth 2.0** - Secure authentication with token refresh

### Development Tools
- **Git** - Version control
- **npm** - Package management
- **VS Code** - Recommended code editor

---

## 🎮 API Reference

### Authentication Endpoints

#### `GET /auth/login`
Returns the Spotify authorization URL to initiate OAuth flow.

**Response:**
```json
{
  "url": "https://accounts.spotify.com/authorize?..."
}
```

#### `GET /callback`
Handles OAuth callback and exchanges authorization code for access token.

**Query Parameters:**
- `code` - Authorization code from Spotify

**Response:**
- Redirects to homepage with tokens in URL parameters

#### `POST /api/refresh-token`
Refreshes an expired access token using a refresh token.

**Request Body:**
```json
{
  "refresh_token": "your_refresh_token"
}
```

**Response:**
```json
{
  "access_token": "new_access_token",
  "expires_in": 3600
}
```

### Music Data Endpoints

#### `GET /api/albums`
Fetches user's saved albums from Spotify library.

**Query Parameters:**
- `access_token` - Valid Spotify access token

**Response:**
```json
{
  "items": [
    {
      "album": {
        "id": "album_id",
        "name": "Album Name",
        "artists": [...],
        "images": [...],
        "external_urls": { "spotify": "..." }
      }
    }
  ]
}
```

#### `GET /api/audio-features`
Gets audio features for specified tracks.

**Query Parameters:**
- `access_token` - Valid Spotify access token
- `track_ids` - Comma-separated track IDs

**Response:**
```json
{
  "audio_features": [
    {
      "valence": 0.85,
      "energy": 0.72,
      "danceability": 0.68,
      "tempo": 128.5
    }
  ]
}
```

#### `GET /api/recommend-albums`
Gets mood-based album recommendations.

**Query Parameters:**
- `access_token` - Valid Spotify access token
- `mood` - One of: `happy`, `sad`, `energetic`, `chill`

**Response:**
```json
{
  "albums": [
    {
      "id": "album_id",
      "name": "Album Name",
      "artists": "Artist Name",
      "image": "image_url",
      "spotifyUrl": "spotify_url",
      "moodScore": 0.85
    }
  ]
}
```

#### `GET /api/liked-songs`
Fetches user's liked songs filtered by mood.

**Query Parameters:**
- `access_token` - Valid Spotify access token
- `mood` - One of: `happy`, `sad`, `energetic`, `chill`

**Response:**
```json
{
  "tracks": [
    {
      "id": "track_id",
      "name": "Track Name",
      "uri": "spotify:track:..."
    }
  ]
}
```

#### `POST /api/create-playlist`
Creates a new playlist with mood-filtered songs.

**Request Body:**
```json
{
  "access_token": "token",
  "mood": "happy",
  "playlist_name": "My Happy Playlist",
  "track_count": 25
}
```

**Response:**
```json
{
  "success": true,
  "playlist": {
    "id": "playlist_id",
    "name": "My Happy Playlist",
    "url": "https://open.spotify.com/playlist/..."
  }
}
```

---

## 🐛 Troubleshooting

### Authentication Issues

#### ❌ "Invalid client" error
**Problem**: Incorrect Client ID or Client Secret

**Solution**:
1. Double-check credentials in `.env` file
2. Ensure no extra spaces or quotes
3. Verify credentials in Spotify Dashboard
4. Regenerate Client Secret if needed

#### ❌ "Invalid redirect URI" error (INVALID_CLIENT)
**Problem**: Redirect URI mismatch between app and Spotify Dashboard

**Solution**:
1. Use `http://127.0.0.1:5500/callback` (NOT `localhost`)
2. Check exact match in Spotify Dashboard > App Settings > Redirect URIs
3. Restart server after changing `.env`
4. Access app via `http://127.0.0.1:5500`

#### ❌ "Token expired" error
**Problem**: Access token expired (tokens last 1 hour)

**Solution**:
1. Click the "Reconnect to Spotify" button
2. The app auto-refreshes tokens, but manual reconnect may be needed
3. Check browser console for token refresh errors

### Data Issues

#### 😕 No albums showing up
**Possible Causes & Solutions**:
1. **Empty library**: Save albums to your Spotify library first
2. **Wrong mood**: Try different mood selections
3. **Low mood scores**: Albums may not match mood criteria well
4. **Token issue**: Check browser console for API errors
5. **Loading not complete**: Wait for analysis to finish

#### 😕 Empty playlist results
**Possible Causes & Solutions**:
1. **No liked songs**: Add liked songs in Spotify
2. **Mood mismatch**: Try different moods or adjust track count
3. **API rate limit**: Wait a minute and try again

### Server Issues

#### ❌ Port already in use
**Problem**: Another process is using port 5500

**Solution**:
```bash
# Windows
netstat -ano | findstr :5500
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5500 | xargs kill -9
```

Or change the port in `index.js`:
```javascript
const PORT = 3000; // Change to any available port
```

#### ❌ "Cannot find module" errors
**Problem**: Dependencies not installed

**Solution**:
```bash
npm install
```

### Browser Issues

#### ❌ CORS errors
**Problem**: Accessing from wrong URL

**Solution**:
- Use `http://127.0.0.1:5500` not `localhost`
- Ensure server is running
- Clear browser cache

#### ❌ Blank page or JavaScript errors
**Problem**: Script loading issues

**Solution**:
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Verify all files are in correct locations
4. Hard refresh: Ctrl+Shift+R (Cmd+Shift+R on Mac)

---

## 🔐 Security & Privacy

### What Data Does Moodify Access?
- Your Spotify profile information (name, email)
- Your saved albums
- Your liked songs
- Audio features of tracks (no personal data)

### What Data is Stored?
- **Nothing!** Moodify doesn't store any user data
- All data is fetched in real-time from Spotify
- Access tokens are stored only in your browser session

### Security Best Practices
- ✅ Uses OAuth 2.0 for secure authentication
- ✅ Access tokens expire after 1 hour
- ✅ Refresh tokens used for session management
- ✅ No user data stored on servers
- ✅ HTTPS recommended for production
- ✅ `.env` file excluded from version control

---

## 🚀 Future Enhancements

### Planned Features
- [ ] **Advanced Mood Customization** - Sliders for valence/energy/danceability
- [ ] **Multi-Mood Blending** - Combine moods (e.g., "happy + chill")
- [ ] **Recently Played Analysis** - Recommend based on listening history
- [ ] **Playlist Editing** - Modify generated playlists
- [ ] **Save Mood Configurations** - Save your favorite mood settings
- [ ] **Social Features** - Share playlists with friends
- [ ] **Mood Calendar** - Track mood-listening patterns over time
- [ ] **Smart Suggestions** - ML-based recommendations
- [ ] **Genre Filters** - Combine mood with genre preferences
- [ ] **Time of Day Suggestions** - Recommend moods based on time

### Platform Expansion
- [ ] Desktop app (Electron)
- [ ] Mobile app (React Native)
- [ ] Browser extension
- [ ] Voice assistant integration (Alexa, Google Home)

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow existing code style
- Test thoroughly before submitting
- Update documentation for new features
- Keep commits atomic and descriptive

---

## 📝 License

This project is licensed under the MIT License - see below for details:

```
MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

## 👨‍💻 Author

**Created by Erick**

- 📧 Contact: [Your Email]
- 💼 LinkedIn: [Your LinkedIn]
- 🐙 GitHub: [Your GitHub]

---

## 🙏 Acknowledgments

- **Spotify** - For the amazing Web API and audio features
- **Spotify for Developers** - Comprehensive API documentation
- **Node.js Community** - For excellent tools and libraries
- **You!** - For using Moodify and supporting indie developers

---

## 📞 Support

Need help? Here are your options:

1. **Check the [Troubleshooting](#-troubleshooting) section** above
2. **Review [Spotify API Documentation](https://developer.spotify.com/documentation/web-api/)**
3. **Open an issue** on GitHub (if applicable)
4. **Check dependencies**: `npm list`

---

<div align="center">

**🎵 Enjoy discovering music with Moodify! ✨**

Made with ❤️ for music lovers everywhere

[⬆ Back to Top](#-moodify)

</div>

