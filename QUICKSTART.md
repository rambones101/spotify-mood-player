# 🚀 Quick Start Guide - Moodify

Get Moodify running in **5 minutes**!

---

## ⚡ Super Quick Setup

### 1. Prerequisites (2 minutes)

✅ Install Node.js: [nodejs.org](https://nodejs.org)  
✅ Have a Spotify account (free or premium)

### 2. Get Spotify Credentials (2 minutes)

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in and click **"Create App"**
3. Fill in:
   - App name: `Moodify`
   - Redirect URI: `http://127.0.0.1:5500/callback`
4. Click **Save**
5. Copy your **Client ID** and **Client Secret**

### 3. Configure & Run (1 minute)

```bash
# Install dependencies
npm install

# Edit .env file with your credentials
# SPOTIFY_CLIENT_ID=your_client_id
# SPOTIFY_CLIENT_SECRET=your_client_secret

# Start the app
npm start
```

### 4. Use Moodify

1. Open: `http://127.0.0.1:5500`
2. Click **"Connect with Spotify"**
3. Select your mood
4. Enjoy your music! 🎵

---

## 🆘 Common Issues

### "Invalid client" error
→ Check your credentials in `.env`

### "Invalid redirect URI" error
→ Add `http://127.0.0.1:5500/callback` to Spotify Dashboard

### No albums found
→ Make sure you have saved albums in your Spotify library

---

## 📚 Need More Help?

- Full documentation: [README.md](README.md)
- Deployment guide: [DEPLOYMENT.md](DEPLOYMENT.md)
- Testing report: [PHASE6_TESTING_REPORT.md](PHASE6_TESTING_REPORT.md)

---

**That's it! You're ready to discover music with Moodify! 🎉**
