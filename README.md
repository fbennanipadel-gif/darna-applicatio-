# Darna — Our Home, Your Table

A production-minded, full-stack restaurant discovery platform for Morocco.
Real OpenStreetMap restaurant data, JWT auth, persisted favorites & reviews,
a behaviour-based recommendation engine, an OpenAI concierge, and a responsive
UI that is **mobile-native on phones** and a **full web layout on desktop**.

## Stack

- **Client** — React 19 + Vite, React Router, TanStack Query, Leaflet (OpenStreetMap), Fraunces/Plus Jakarta typography. Mobile-first with a native bottom-tab shell; desktop unlocks a top-nav web layout at ≥ 900 px.
- **API** — Node.js + Express 5 + MongoDB (Mongoose). JWT access/refresh auth, Zod validation, Helmet, CORS, rate limiting, request sanitisation.
- **AI** — OpenAI concierge grounded in the live restaurant catalogue (no hallucinated venues).
- **Data** — Thousands of real Moroccan restaurants imported from OpenStreetMap (© OSM contributors, ODbL).

## Run locally

1. `cp backend/.env.example backend/.env` and fill in your secrets (see below).
2. Backend: `cd backend && npm install --legacy-peer-deps && npm run dev` → http://localhost:5050
3. Client: `cd client && npm install --legacy-peer-deps && npm run dev` → http://localhost:5173

### Seed / import data

From `backend/`:

- `npm run seed` — 4 curated flagship partner restaurants (verified + promoted).
- `node utils/importOsm.js` — import real restaurants/cafés across 20 Moroccan cities from OpenStreetMap. Idempotent (upserts by `osmRef`), writes per-city so partial progress is never lost. Add a city name to import just one, e.g. `node utils/importOsm.js Casablanca`.
- `node utils/normalizeCities.js` — reassign every restaurant to its nearest canonical city from coordinates (cleans noisy OSM `addr:city`).

## Environment variables

| Var | Required | Notes |
|-----|----------|-------|
| `MONGODB_URI` | ✅ | Atlas or local. On DNS-restricted networks use the standard (non-`+srv`) string. |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | ✅ | `openssl rand -hex 32` |
| `OPENAI_API_KEY` | for AI | Concierge returns 503 without it |
| `OPENAI_MODEL` | – | Defaults to `gpt-4o-mini` |
| `NFC_PROOF_SECRET` | for NFC | HMAC secret for verified visits |
| `CLIENT_URL` | – | Comma-separated allowed origins |

## Key API endpoints

- `POST /api/auth/register` · `POST /api/auth/login` · `POST /api/auth/refresh` · `GET /api/auth/me`
- `GET /api/restaurants` (search: `q, city, category, sort, page, lat, lng`)
- `GET /api/restaurants/trending` · `GET /api/restaurants/recommended` (personalised)
- `GET /api/restaurants/:slug` · `POST /api/restaurants/:slug/reviews`
- `POST /api/users/favorites/toggle` · `GET /api/users/favorites`
- `POST /api/ai/chat` — concierge

## Recommendations

Every view / favorite / review logs a lightweight `UserEvent`. `GET /api/restaurants/recommended`
weights the user's preferred cuisines and cities against catalogue popularity to produce a
personalised list, falling back to trending on a cold start.

## Deploy (Vercel)

- Framework preset: **Vite** · Install: `pnpm install --no-frozen-lockfile` or `npm install --legacy-peer-deps`
- Build: `pnpm --filter darna-web run build` · Output: `client/dist`
- API: `api/[...path].js` serves the Express app as a Vercel Function.
- Set `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `OPENAI_API_KEY`, `OPENAI_MODEL`, `NFC_PROOF_SECRET`, `CLIENT_URL` in Vercel. Never put secrets in `VITE_*`.

Restaurant data © OpenStreetMap contributors, ODbL.
