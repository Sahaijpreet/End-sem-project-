# SAAR — Deployment Guide

## Stack
| Layer | Service | Free Tier |
|-------|---------|-----------|
| Frontend | Vercel | ✅ |
| Backend | Render | ✅ |
| Database | MongoDB Atlas | ✅ 512MB |

---

## Step 1 — MongoDB Atlas (Database)

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) → create a free account
2. Create a new **Free Cluster** (M0)
3. Under **Database Access** → add a user with a strong password
4. Under **Network Access** → click **Allow Access from Anywhere** (`0.0.0.0/0`)
5. Click **Connect** → **Drivers** → copy the connection string
   - It looks like: `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/saar_db`
6. Save this — you'll need it as `MONGO_URI`

---

## Step 2 — Backend on Render

1. Push your code to GitHub (if not already):
   ```bash
   cd /path/to/SAAR
   git init
   git add .
   git commit -m "initial commit"
   # create a repo on github.com, then:
   git remote add origin https://github.com/YOUR_USERNAME/saar.git
   git push -u origin main
   ```

2. Go to [render.com](https://render.com) → sign up → **New Web Service**
3. Connect your GitHub repo → select the `SAAR-BACKEND` folder as root directory
4. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Node version:** 18+
5. Under **Environment Variables**, add:
   | Key | Value |
   |-----|-------|
   | `MONGO_URI` | your Atlas connection string |
   | `JWT_SECRET` | any long random string (min 32 chars) |
   | `FRONTEND_URL` | your Vercel URL (add after Step 3) |
   | `GEMINI_API_KEY` | optional — for AI summaries |
   | `SMTP_USER` | optional — Gmail address |
   | `SMTP_PASS` | optional — Gmail app password |

6. Under **Disks** → add a disk:
   - Name: `uploads`
   - Mount Path: `/opt/render/project/src/uploads`
   - Size: 1 GB

7. Click **Deploy** — wait ~2 minutes
8. Copy your backend URL: `https://saar-backend.onrender.com`

---

## Step 3 — Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → sign up → **New Project**
2. Import your GitHub repo
3. Set **Root Directory** to `SAAR-FRONTEND`
4. Under **Environment Variables**, add:
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | your Render backend URL e.g. `https://saar-backend.onrender.com` |

5. Click **Deploy** — wait ~1 minute
6. Copy your frontend URL: `https://saar-xyz.vercel.app`

---

## Step 4 — Connect them

1. Go back to **Render** → your backend service → **Environment**
2. Update `FRONTEND_URL` to your Vercel URL
3. Click **Save Changes** — Render will redeploy automatically

---

## Step 5 — Seed the Admin account

Once the backend is live, run this once from your local machine:

```bash
cd SAAR-BACKEND
# set your production env vars locally first, or create a .env with MONGO_URI
MONGO_URI="your-atlas-uri" ADMIN_EMAIL="admin@example.edu" ADMIN_PASSWORD="yourpassword" ADMIN_NAME="Admin" node scripts/seedAdmin.js
```

---

## Gmail App Password (for email features)

1. Go to your Google Account → Security → 2-Step Verification (enable it)
2. Search for **App Passwords** → create one for "Mail"
3. Use that 16-char password as `SMTP_PASS`

---

## Local Development

```bash
# Backend
cd SAAR-BACKEND
cp .env.example .env   # fill in your values
npm install
npm run dev            # runs on http://localhost:5001

# Frontend (new terminal)
cd SAAR-FRONTEND
npm install
npm run dev            # runs on http://localhost:5173
```

The Vite dev server proxies `/api` and `/uploads` to `localhost:5001` automatically.
