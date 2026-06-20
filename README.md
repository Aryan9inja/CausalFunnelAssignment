# Simple User Analytics Application

This is a clean, minimal, full-stack User Analytics application scaffolded as a take-home assignment. It tracks page views and mouse clicks, records them in a MongoDB database, and visualizes the captured data inside an interactive Next.js dashboard.

---

## Tech Stack
* **Tracking Script**: Vanilla JS (IIFE) — Zero dependencies, self-executing, easy to embed via a single `<script>` tag. (For local deployment, please enforce API URL config in `tracker.js` to point to your backend server.)
* **Backend**: Node.js + Express + Mongoose — Standard, lightweight routing framework coupled with a robust MongoDB object-document model wrapper.
* **Database**: MongoDB — Document-based structure ideal for high-volume, semi-structured event streams (e.g., page views and click coordinates).
* **Dashboard**: Next.js (App Router) + TypeScript + Tailwind CSS — Seamless page routing, clean layouts, and reactive interactive state management.
* **Demo Page**: Static HTML — Simple, lightweight mechanism to test tracker embedding and fire user events manually.

---

## Setup & Running the Application

Ensure you have **Node.js** (v18+) and a local instance of **MongoDB** running.

### 1. Start the Backend Server
```bash
cd server
npm install
npm run dev
```
* The server runs by default at [http://localhost:4000](http://localhost:4000).
* It communicates with MongoDB at `mongodb://localhost:27017/analytics` (configurable in `.env`).
* **Auto-Seeding**: On connection startup, if the database is completely empty, the backend automatically pre-loads sample sessions and mouse clicks so the dashboard is immediately populated with interactive demonstration records.

### 2. Start the Dashboard Front-End
```bash
cd dashboard
npm install
npm run dev
```
* The dashboard compiles and starts at [http://localhost:3000](http://localhost:3000).
* The API endpoint prefix is set in `dashboard/.env` (default is `http://localhost:4000`).

### 3. Open the Demo Page
* Locate `demo/index.html` on your filesystem and open it in any web browser.
* *Alternative (serve via HTTP)*: Run `npx serve demo` in the project root and navigate to the local host URL provided.
* **Generating test data**: Click the buttons and navigation simulation links on the page. The tracking script will record your mouse click coordinates and page views, sending them straight to the backend.

---

## Folder Layout
```text
user-analytics/
├── demo/
│   └── index.html         # Test page loading the tracker script
├── tracker/
│   └── tracker.md         # Reference file pointing to the static tracker
├── server/
│   ├── index.js           # Express + MongoDB backend entry point
│   ├── db.js              # MongoDB database connector and seeding functions
│   ├── package.json       # Backend script definitions & dependencies
│   ├── .env               # Active backend environment configuration
│   └── .env.example       # Example server configuration template
├── dashboard/
│   ├── public/
│   │   └── tracker.js     # Centrally hosted tracking script
│   ├── app/
│   │   ├── page.tsx       # Sessions Overview page (Table list)
│   │   ├── layout.tsx     # Site frame layout (Navbar container)
│   │   ├── heatmap/       # Heatmap visualization page
│   │   └── sessions/      # Timeline-based user journey routes
│   ├── package.json       # Next.js configurations & scripts
│   ├── tsconfig.json      # TypeScript compiler specifications
│   ├── .env               # Active frontend environment configurations
│   └── .env.example       # Example frontend config template
├── .gitignore             # Root version control filter
└── README.md              # Global repository guide (This file)
```

---

## API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/events` | Accepts and validates a single tracking event, storing it in MongoDB. |
| `GET` | `/api/sessions` | Retrieves distinct sessions aggregated with event counts and latest active timestamps (sorted newest first). |
| `GET` | `/api/sessions/:session_id/events` | Retrieves the chronological timeline of events for a single session. |
| `GET` | `/api/health` | Reports service status, server uptime, and database connectivity. |
| `GET` | `/api/heatmap?page_url=...` | Retrieves only click coordinates `(x, y)` recorded for a specific page URL. |

---

## Assumptions and Trade-offs
1. **No Authentication or Authorization**: There is no API key, CORS origin locking, user login, or token checking. Designed purely for internal/local demonstration.
2. **No Rate Limiting or Anti-Abuse**: Endpoints accept events at any scale. In production, rate limiting and validation token handshakes are essential to prevent event floods.
3. **Session ID Generation and Collision Handling**: Session IDs are UUID v4 strings generated on the client side via the browser API (with mathematical pseudo-random fallback). We assume negligible collision probability and bypass collision retries.
4. **Fire-and-forget Delivery**: Events are dispatched asynchronously via browser `fetch` and errors are printed to the console without retrying, queuing, or persisting failed payloads in IndexedDB.
5. **Fixed Mock Canvas for Heatmap**: The heatmap is plotted on a fixed wireframe mockup representing standard viewport sizes (`1280px` or wider if clicks exceed it) rather than loading/rendering a live iframe screenshot of the actual page.
6. **No Shared monorepo packages**: Subprojects are fully decoupled inside folders without shared library configurations or shared workspace logic to prioritize setup simplicity.
7. **Offline Database Resilience**: If MongoDB is offline, the backend server stays running to provide explicit `503 Service Unavailable` JSON payloads rather than failing silently or crashing. The Next.js dashboard detects these error responses and shows a user-friendly troubleshooting prompt.
8. **Automatic Pre-Seeding**: When the server boots and finds zero database documents, it seeds standard user events automatically. This ensures an immediate, feature-rich initial visual state without requiring manual file clicks first.
