# 🚀 Moodify Deployment Guide

This guide covers deploying Moodify to various hosting platforms.

---

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Heroku Deployment](#heroku-deployment)
3. [Railway Deployment](#railway-deployment)
4. [Vercel + Backend Deployment](#vercel--backend-deployment)
5. [VPS Deployment (DigitalOcean/AWS)](#vps-deployment)
6. [Environment Variables](#environment-variables)
7. [Post-Deployment Steps](#post-deployment-steps)
8. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] Tested the app locally and everything works
- [ ] Spotify Developer App created with credentials
- [ ] `.env` file configured (will not be deployed)
- [ ] Git repository initialized (if using Git-based deployment)
- [ ] Updated `package.json` with correct information
- [ ] Decided on a hosting platform

---

## Heroku Deployment

Heroku is beginner-friendly and offers a free tier (with limitations).

### Step 1: Install Heroku CLI

```bash
# Download from https://devcenter.heroku.com/articles/heroku-cli
# Or install via npm
npm install -g heroku
```

### Step 2: Login to Heroku

```bash
heroku login
```

### Step 3: Create Heroku App

```bash
cd your-moodify-folder
heroku create your-moodify-app-name
```

This creates a Heroku app and adds a Git remote.

### Step 4: Set Environment Variables

```bash
heroku config:set SPOTIFY_CLIENT_ID=your_client_id
heroku config:set SPOTIFY_CLIENT_SECRET=your_client_secret
heroku config:set REDIRECT_URI=https://your-moodify-app-name.herokuapp.com/callback
```

### Step 5: Update Spotify Dashboard

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Select your app
3. Click "Edit Settings"
4. Add to Redirect URIs: `https://your-moodify-app-name.herokuapp.com/callback`
5. Save

### Step 6: Update index.js for Dynamic Port

Heroku assigns a random port. Update your `index.js`:

```javascript
const PORT = process.env.PORT || 5500;
```

### Step 7: Create Procfile

Create a file named `Procfile` (no extension) in the root:

```
web: node index.js
```

### Step 8: Deploy

```bash
git add .
git commit -m "Prepare for Heroku deployment"
git push heroku main
```

Or if your branch is `master`:
```bash
git push heroku master
```

### Step 9: Open Your App

```bash
heroku open
```

### Monitoring & Logs

```bash
# View logs
heroku logs --tail

# Check dyno status
heroku ps

# Restart app
heroku restart
```

---

## Railway Deployment

Railway is modern, fast, and developer-friendly.

### Step 1: Sign Up

1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub

### Step 2: Create New Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your Moodify repository
4. Railway will auto-detect Node.js

### Step 3: Add Environment Variables

1. Go to your project
2. Click "Variables" tab
3. Add:
   - `SPOTIFY_CLIENT_ID` = your client ID
   - `SPOTIFY_CLIENT_SECRET` = your client secret
   - `REDIRECT_URI` = `https://your-app.railway.app/callback`

### Step 4: Get Your Railway Domain

1. Go to "Settings" tab
2. Under "Domains", click "Generate Domain"
3. Copy your domain (e.g., `your-app.railway.app`)

### Step 5: Update Spotify Dashboard

Add `https://your-app.railway.app/callback` to Redirect URIs in Spotify Dashboard.

### Step 6: Deploy

Railway auto-deploys on every Git push to main branch.

### Custom Domain (Optional)

1. Buy a domain (Namecheap, Google Domains, etc.)
2. In Railway, go to Settings > Domains
3. Add custom domain
4. Update DNS records as instructed
5. Update Spotify redirect URI to your custom domain

---

## Vercel + Backend Deployment

Vercel is great for frontends but doesn't support Node.js backends well. Use this approach:

### Option A: Deploy Backend Separately

1. **Backend (Node.js)**: Deploy to Heroku, Railway, or Render
2. **Frontend**: Deploy static files to Vercel

#### Deploy Backend First
Follow Heroku or Railway steps above for backend.

#### Deploy Frontend to Vercel

1. **Separate frontend files**:
```bash
mkdir frontend
cp -r public/* frontend/
```

2. **Update API URLs in `frontend/script.js`**:
```javascript
const API_BASE_URL = 'https://your-backend.herokuapp.com';

// Update all fetch calls
fetch(`${API_BASE_URL}/auth/login`)
```

3. **Install Vercel CLI**:
```bash
npm install -g vercel
```

4. **Deploy**:
```bash
cd frontend
vercel
```

5. **Follow prompts** and deploy

### Option B: Keep Everything Together

Deploy entire app to Heroku/Railway instead of splitting.

---

## VPS Deployment

For DigitalOcean, AWS EC2, Linode, or any VPS.

### Prerequisites
- VPS with Ubuntu/Debian
- Root or sudo access
- Domain name (optional but recommended)

### Step 1: Setup Server

```bash
# SSH into your server
ssh root@your_server_ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (version 18)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

### Step 2: Install Git

```bash
sudo apt install git -y
```

### Step 3: Clone Repository

```bash
cd /var/www
git clone https://github.com/yourusername/moodify.git
cd moodify
```

### Step 4: Install Dependencies

```bash
npm install
```

### Step 5: Setup Environment Variables

```bash
nano .env
```

Add your credentials:
```
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
REDIRECT_URI=https://yourdomain.com/callback
PORT=5500
```

Save and exit (Ctrl+X, then Y, then Enter).

### Step 6: Install PM2 (Process Manager)

```bash
sudo npm install -g pm2

# Start app with PM2
pm2 start index.js --name moodify

# Set PM2 to start on boot
pm2 startup
pm2 save
```

### Step 7: Install Nginx (Reverse Proxy)

```bash
sudo apt install nginx -y
```

Create Nginx configuration:
```bash
sudo nano /etc/nginx/sites-available/moodify
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:5500;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/moodify /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 8: Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow prompts
```

Certbot will automatically update Nginx config for HTTPS.

### Step 9: Update Spotify Dashboard

Add `https://yourdomain.com/callback` to Redirect URIs.

### Step 10: Firewall Configuration

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

### Managing Your App

```bash
# View logs
pm2 logs moodify

# Restart app
pm2 restart moodify

# Stop app
pm2 stop moodify

# View status
pm2 status
```

### Updating Your App

```bash
cd /var/www/moodify
git pull origin main
npm install
pm2 restart moodify
```

---

## Environment Variables

All platforms need these environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `SPOTIFY_CLIENT_ID` | Your Spotify app Client ID | `abc123...` |
| `SPOTIFY_CLIENT_SECRET` | Your Spotify app Client Secret | `def456...` |
| `REDIRECT_URI` | OAuth callback URL | `https://yourdomain.com/callback` |
| `PORT` | Server port (Heroku sets this automatically) | `5500` |
| `NODE_ENV` | Environment mode (optional) | `production` |

### Setting Environment Variables

**Heroku**:
```bash
heroku config:set VAR_NAME=value
```

**Railway**: Use the Variables tab in dashboard

**Vercel**: Use Environment Variables section in project settings

**VPS**: Edit `.env` file on server

---

## Post-Deployment Steps

After successful deployment:

### 1. Update Spotify Dashboard

✅ Add production redirect URI to your Spotify app:
- `https://yourdomain.com/callback`
- Keep development URI for local testing

### 2. Test Authentication Flow

1. Visit your deployed app
2. Click "Connect with Spotify"
3. Verify successful authentication
4. Test album recommendations
5. Test playlist creation

### 3. Monitor Performance

- Check server logs for errors
- Test on multiple devices (desktop, mobile, tablet)
- Verify API rate limits aren't exceeded
- Monitor uptime

### 4. Security Checklist

- [ ] HTTPS enabled
- [ ] Environment variables secured (not in code)
- [ ] CORS configured properly
- [ ] Rate limiting implemented (optional)
- [ ] Error logging setup

### 5. Optional Enhancements

- [ ] Add custom domain
- [ ] Setup monitoring (e.g., UptimeRobot)
- [ ] Add analytics (Google Analytics, Plausible)
- [ ] Setup error tracking (Sentry)
- [ ] Add caching for better performance

---

## Troubleshooting

### 🐛 Common Issues

#### "Application Error" on Heroku

**Cause**: App crashed or failed to start

**Solution**:
```bash
heroku logs --tail
```
Check logs for errors. Common issues:
- Missing environment variables
- Port not set to `process.env.PORT`
- Dependencies not installed

#### "Invalid Redirect URI" After Deployment

**Cause**: Redirect URI mismatch

**Solution**:
1. Check environment variable: `heroku config` or check platform settings
2. Verify exact match in Spotify Dashboard (include `https://`)
3. Restart app after updating

#### App Works Locally But Not in Production

**Possible Causes**:
1. Environment variables not set
2. Using `localhost` instead of `127.0.0.1` locally
3. Port hardcoded instead of using `process.env.PORT`
4. Missing dependencies in `package.json`

**Solution**:
- Review environment variables
- Check logs for specific errors
- Ensure `package.json` includes all dependencies

#### SSL/HTTPS Issues

**Cause**: Certificate not properly configured

**Solution**:
- Re-run `certbot` on VPS
- Check Heroku app settings for "Automatically acquire SSL"
- Verify DNS records point to correct server

#### 502 Bad Gateway (Nginx)

**Cause**: Backend not running or wrong port

**Solution**:
```bash
pm2 status  # Check if app is running
pm2 logs    # Check for errors
sudo systemctl status nginx  # Check Nginx status
```

---

## Platform Comparison

| Platform | Difficulty | Free Tier | Custom Domain | SSL | Best For |
|----------|------------|-----------|---------------|-----|----------|
| **Heroku** | Easy | Yes (limited) | Yes | Auto | Beginners |
| **Railway** | Easy | Yes (limited) | Yes | Auto | Quick deploys |
| **Render** | Easy | Yes | Yes | Auto | Heroku alternative |
| **Vercel** | Medium | Yes | Yes | Auto | Frontend + API routes |
| **VPS** | Hard | No | Yes | Manual | Full control |
| **AWS** | Hard | Yes (1 year) | Yes | Manual | Enterprise |

---

## Need Help?

- 📚 Check main [README.md](README.md) troubleshooting section
- 🔗 Platform-specific docs:
  - [Heroku Node.js Guide](https://devcenter.heroku.com/articles/deploying-nodejs)
  - [Railway Docs](https://docs.railway.app/)
  - [Vercel Docs](https://vercel.com/docs)
- 💬 Spotify API: [Developer Forum](https://community.spotify.com/t5/Spotify-for-Developers/bd-p/Spotify_Developer)

---

**🎉 Congratulations on deploying Moodify!**

Your mood-based music companion is now live for the world to enjoy! 🎵✨
