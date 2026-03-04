# 🎬 CineScope AI — Next-Gen Movie Intelligence Platform

> **Decode the Audience Mind.** Enter any IMDb ID and get AI-powered sentiment analysis, audience insights, and cinematic intelligence — powered by Claude AI.

A cinematic, premium-grade full-stack web application that feels like a next-gen movie discovery platform. Think **Netflix meets Linear meets Vercel's design language** — dark, immersive, fast, and alive with motion.

---

## ✨ Features

- 🌌 **Three.js Particle Background** — Interactive floating particles that react to mouse movement
- 🎭 **Real-time Analysis** — Socket.io live terminal showing analysis progress  
- 🤖 **Claude AI Intelligence** — Deep sentiment analysis with themes, highlights, and audience profiling
- 📊 **Recharts Visualization** — Donut charts for sentiment breakdown
- 🎬 **Cinematic Hero Banner** — Full-bleed blurred poster with parallax effect
- ✨ **Premium Micro-interactions** — Shimmer buttons, gradient borders, spring animations
- 💾 **Recent Searches** — localStorage persistence for quick re-analysis
- 🎯 **Floating Action Bar** — Copy ID, IMDb link, new analysis on scroll

---

## 🏗 Architecture

```
┌──────────────────────────────────────────────────┐
│                  FRONTEND (Next.js 14)            │
│  ┌─────────────┐  ┌─────────┐  ┌──────────────┐ │
│  │ Three.js     │  │ Framer  │  │ Socket.io    │ │
│  │ Particles    │  │ Motion  │  │ Client       │ │
│  └─────────────┘  └─────────┘  └──────────────┘ │
│  ┌─────────────┐  ┌─────────┐  ┌──────────────┐ │
│  │ Recharts     │  │ Tailwind│  │ Next/Image   │ │
│  └─────────────┘  └─────────┘  └──────────────┘ │
└───────────────────────┬──────────────────────────┘
                        │ WebSocket + REST
┌───────────────────────▼──────────────────────────┐
│                 BACKEND (Express + TS)             │
│  ┌──────────┐  ┌──────────┐  ┌────────────────┐ │
│  │ Socket.io │  │ Express  │  │ Rate Limiting  │ │
│  │ Server    │  │ Routes   │  │ + CORS         │ │
│  └──────────┘  └──────────┘  └────────────────┘ │
│  ┌──────────┐  ┌──────────┐  ┌────────────────┐ │
│  │ OMDB API │  │ IMDb     │  │ Claude AI      │ │
│  │ Client   │  │ Scraper  │  │ (Anthropic)    │ │
│  └──────────┘  └──────────┘  └────────────────┘ │
│  ┌──────────────────────────────────────────────┐ │
│  │           Node-Cache (5min TTL)              │ │
│  └──────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### 1. Clone and install

```bash
cd IMBD_REVIEW

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Configure environment variables

**Backend** — Create `backend/.env`:
```env
OMDB_API_KEY=your_omdb_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
PORT=3001
FRONTEND_URL=http://localhost:3000
CACHE_TTL_SECONDS=300
```

**Frontend** — `frontend/.env.local` (pre-configured for local dev):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

### 3. Start the backend
```bash
cd backend
npm run dev
```

### 4. Start the frontend
```bash
cd frontend
npm run dev
```

### 5. Open browser
Navigate to **http://localhost:3000** and enter an IMDb ID like `tt0133093`

---

## 🎨 Design System

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#020208` | Deep space background |
| `--bg-secondary` | `#0D0D1A` | Card backgrounds |
| `--accent-purple` | `#7C3AED` | Primary brand |
| `--accent-cyan` | `#06B6D4` | Highlights |
| `--accent-pink` | `#EC4899` | Sentiment positive |
| `--accent-amber` | `#F59E0B` | Rating stars |

**Typography**: Syne (headings) · Inter (body) · JetBrains Mono (data) · Playfair Display (titles)

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS |
| **Animation** | Framer Motion |
| **3D/Visual** | Three.js, React Three Fiber |
| **Real-time** | Socket.io |
| **Charts** | Recharts |
| **Backend** | Node.js, Express, TypeScript |
| **AI** | Anthropic Claude API |
| **Movie Data** | OMDB API + IMDb scraping |
| **Caching** | Node-cache (5min TTL) |

---

## 🧪 Tests

```bash
cd backend
npm test
```

---

## 🔑 API Keys Needed

| Service | Get Key At |
|---------|-----------|
| OMDB API | https://www.omdbapi.com/apikey.aspx (free) |
| Anthropic Claude | https://console.anthropic.com |

---

## 📦 Deployment

- **Frontend** → Vercel with `NEXT_PUBLIC_*` vars
- **Backend** → Railway with all env vars
- Configure CORS for your Vercel domain
- Test with: `tt0133093` · `tt1375666` · `tt0816692` · `tt0068646`

---

## 📄 License

MIT
