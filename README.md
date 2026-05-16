# Kosh

**Kosh** is a full-stack application for **personal inflation intelligence**: a “Sovereign Ledger” (branded **Koshya** in the codebase) that models your spending against CPI-style inputs, surfaces “hidden” costs (e.g. shadow-tax style effects), and helps you reason about how inflation hits *you* in rupee terms—not just the headline number.

The repo is a **monorepo** with a **FastAPI** backend for calculations, MOSPI CSV handling, and optional AI-style insight text, plus a **Next.js** web UI for the ledger and audit flows.

## Tech stack

| Area | Stack |
|------|--------|
| **Backend** | Python 3, [FastAPI](https://fastapi.tiangolo.com/), [Uvicorn](https://www.uvicorn.org/), [Pydantic](https://docs.pydantic.dev/), [Pandas](https://pandas.pydata.org/), [Motor](https://motor.readthedocs.io/) (async MongoDB), HTTP via [httpx](https://www.python-httpx.org/) |
| **Data** | [MongoDB](https://www.mongodb.com/) — Koshya UI state (ledger/audit/insights) per anonymous client id (`X-Koshya-Client-Id`) |
| **Frontend** | [Next.js](https://nextjs.org/) 16, [React](https://react.dev/) 19, [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/) 4 |
| **API contract** | REST + OpenAPI (interactive docs on the backend at `/docs`) |

## Prerequisites

- **Python** 3.10+ recommended (matching your venv / system)
- **Node.js** 20+ and **npm** (or pnpm/yarn if you prefer; examples use npm)
- **MongoDB** running locally (default `mongodb://127.0.0.1:27017`) for persisting Koshya UI state

Copy [backend/.env.example](backend/.env.example) to `backend/.env` and set `MONGODB_URI` if needed. The API uses collection `koshya_state` in the database named in that URI.

## Run locally

You need **two terminals**: API on port **8000** and the web app on **3000** (the frontend defaults to `http://localhost:8000` for API calls).

### 1. Backend (FastAPI)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

- Interactive API docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 2. Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

- App: [http://localhost:3000](http://localhost:3000)

### Optional: custom API URL

If the backend is not on `8000`, create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:YOUR_PORT
```

CORS on the API is configured for `http://localhost:3000` and `http://127.0.0.1:3000` during development.

## Data and privacy (local dev)

The browser generates a random **client id** (stored in `localStorage` as `koshya_client_id`) and sends it as **`X-Koshya-Client-Id`** on state sync requests. Your ledger/audit/insights snapshot is stored in **your** MongoDB under that id (not logged in users—no passwords in this flow). An existing legacy blob `koshya_store_v1` is migrated automatically the first time the API returns 404 for that client.

## Repository layout

```
backend/     # FastAPI app (main.py), calculations, MOSPI parsing, AI insights helpers
frontend/    # Next.js App Router UI (ledger, audit, etc.)
```
