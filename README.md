# FinTrack Dashboard

A full-stack personal finance tracking app built with **Next.js** (frontend) and **Netlify Functions** (backend), deployed on **Netlify**.

## 📁 Project Structure

```
fintrack_dashboard/
├── frontend/          # Next.js app (UI, components, pages)
├── backend/           # Netlify serverless functions & Firebase logic
└── netlify.toml       # Netlify build & deployment config
```

## 🚀 Getting Started (Local Development)

### 1. Install dependencies

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### 2. Run the development server

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

## 🌐 Deploy on Netlify

### Option 1 — Netlify Dashboard (Recommended)

1. Push this repo to **GitHub**
2. Go to [netlify.com](https://netlify.com) → **Add new site** → **Import from Git**
3. Select your repository
4. Netlify will auto-detect `netlify.toml` and configure:
   - **Build command**: `npm install && npm run build`
   - **Publish directory**: `frontend/out`
   - **Functions directory**: `backend/functions`
5. Click **Deploy site** ✅

### Option 2 — Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

## 🔑 Environment Variables

Set these in **Netlify Dashboard → Site Settings → Environment Variables**:

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

> ⚠️ Never commit `.env` files to GitHub.

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, Tailwind CSS |
| Backend | Netlify Functions (Express + serverless-http) |
| Database | Firebase Firestore |
| Auth | Firebase Authentication |
| Email/OTP | EmailJS |
| Charts | Chart.js + react-chartjs-2 |
