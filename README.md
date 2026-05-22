<div align="center">

<br />

<img src="https://img.shields.io/badge/-TRAFFIX-000000?style=for-the-badge&logoColor=white" alt="Traffix" height="60" />

### AI-Powered Adaptive Traffic Management System

<p>Real-time signal optimization using Webster's Formula and Q-Learning<br/>Built for Smart India Hackathon 2025 · Bhopal City Network</p>

<br />

[![Live Demo](https://img.shields.io/badge/Live%20Demo-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)](https://traffix-mocha.vercel.app)
[![Backend](https://img.shields.io/badge/API%20Health-%234f46e5.svg?style=for-the-badge&logo=render&logoColor=white)](https://traffix-backend-ydw9.onrender.com/api/health)
[![SIH 2025](https://img.shields.io/badge/SIH%202025-FF6B35?style=for-the-badge)](https://www.sih.gov.in)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

<br />

---

</div>

<br />

## The Problem

Urban traffic signals in India run on **fixed pre-timed cycles** — green for 30 seconds regardless of whether 50 vehicles are waiting or zero. This causes:

- Unnecessary wait times during off-peak hours
- Congestion buildup at high-demand intersections
- No response to real-time traffic conditions

## The Solution

Traffix replaces fixed timing with an **adaptive AI engine** that computes optimal green time for each phase using live vehicle counts, congestion levels, and time-of-day patterns — reducing average wait by up to **40%**.

<br />

---

<br />

## Features

<table>
<tr>
<td width="50%">

**🧠 Webster's Optimal Cycle**
Computes signal cycle length dynamically using the industry-standard formula based on real flow ratios — not guesswork.

</td>
<td width="50%">

**🤖 Q-Learning Agent**
ε-greedy reinforcement learning selects the next green phase based on queue pressure, density, and congestion state.

</td>
</tr>
<tr>
<td width="50%">

**📡 Live Intersection Simulation**
Animated vehicles queue and drain in real time. Signal phases switch on Webster-computed intervals from the backend.

</td>
<td width="50%">

**🗺️ Bhopal Junction Map**
SVG city map with actual road topology — NH-12, VIP Road, Ring Road — and animated traffic flow pulses.

</td>
</tr>
<tr>
<td width="50%">

**📊 Analytics Dashboard**
Saturation levels, congestion trends, AI vs fixed delay comparison — all in one control room view.

</td>
<td width="50%">

**🔔 Alert System**
Real-time anomaly detection for high congestion events and signal failures across all monitored junctions.

</td>
</tr>
</table>

<br />

---

<br />

## Algorithm

```
Webster's Optimal Cycle Length
──────────────────────────────
Co = (1.5L + 5) / (1 - Y)

  Co  →  Optimal cycle length in seconds
  L   →  Total lost time per cycle
  Y   →  Sum of critical lane flow ratios

Green Time per Phase
────────────────────
gi = (Co - L) × (yi / Y)

  Each direction gets green proportional
  to its share of total demand.
```

The **Q-Learning agent** observes current queue depths and congestion scores to decide which phase to prioritize next — balancing fairness with urgency.

<br />

---

<br />

## Tech Stack

**Frontend** — React 18, Vite, React Router v6, Recharts, Lucide, Geist Font

**Backend** — Node.js, Express, MongoDB, Mongoose

**AI Engine** — Webster's Formula, Q-Learning (ε-greedy), Rule-based Heuristics

**Infrastructure** — Vercel (frontend), Render (backend), MongoDB Atlas

<br />

---

<br />

## Getting Started

```bash
# 1. Clone
git clone https://github.com/RatnaSolanki/Traffix.git
cd Traffix
```

```bash
# 2. Backend
cd backend
npm install

# Create .env
echo "MONGO_URI=your_mongodb_atlas_uri" > .env
echo "PORT=3000" >> .env

node src/index.js
```

```bash
# 3. Frontend
cd ../frontend
npm install

# Create .env
echo "VITE_API_URL=http://localhost:3000" > .env

npm run dev
```

<br />

## Project Structure

```
Traffix/
├── backend/
│   └── src/
│       ├── controllers/       # Request handlers
│       ├── models/            # Mongoose schemas
│       ├── routes/            # API route definitions
│       ├── simulation/        # Traffic simulator + Webster engine
│       └── index.js           # Entry point
│
└── frontend/
    └── src/
        ├── components/        # Layout, Sidebar, LiveIndicator
        ├── hooks/             # UseTraffic (WebSocket/polling)
        ├── pages/             # Overview, Simulation, Junctions, Alerts
        └── data/              # Seed / mock data
```

<br />

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Server status |
| `GET` | `/api/junctions` | All junction nodes |
| `GET` | `/api/simulation` | Live signal + vehicle data |
| `GET` | `/api/analytics` | Historical traffic analytics |
| `GET` | `/api/alerts` | Active system alerts |

<br />

---

<br />

<div align="center">

Built for **Smart India Hackathon 2025** · Problem Statement `SIH25050`

*Making cities flow smarter* 🚦

</div>
