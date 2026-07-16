# Darna — Our Home, Your Table

Full-stack restaurant discovery platform with NFC-backed verified reviews.

The responsive premium UI base is integrated from the supplied `fbennanipadel-gif/darna-applicatio-` repository and adapted into `client/src/App.jsx`. Product and security decisions follow the supplied July 2026 requirements document.

## Run locally

1. Copy `backend/.env.example` to `backend/.env` and set your own secrets.
2. Start MongoDB locally or set `MONGODB_URI`.
3. `cd backend && npm install && npm run dev`
4. `cd client && npm install && npm run dev`

Workspace scripts are also available from the repository root with pnpm:

- `pnpm install --no-frozen-lockfile`
- `pnpm run build`
- `pnpm run dev:client`
- `pnpm run dev:api`

The web app runs on `http://localhost:5173`; the API defaults to `http://localhost:5050` (port 5000 is commonly reserved by macOS services).

## Vercel

Import the GitHub repository in Vercel from the repository root.

- Framework preset: Vite
- Install command: `pnpm install --no-frozen-lockfile`
- Build command: `pnpm --filter darna-web run build`
- Output directory: `client/dist`
- API runtime: `api/[...path].js` serves the Express/MongoDB app as a Vercel Function

Configure these Vercel environment variables before the first production deployment:

- `MONGODB_URI`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `NFC_PROOF_SECRET`
- `CLIENT_URL`

Set `CLIENT_URL` to the deployed web URL. Do not add secrets to `VITE_*` variables; client variables are bundled into the browser.

Never commit connection strings, tokens, Cloudinary credentials, or OpenAI keys.

## Included foundation

- React 19 + Vite client with multilingual/RTL onboarding, home discovery, restaurant views, favorites, map, NFC and review flows.
- Express/MongoDB API with hashed passwords, JWT access/refresh sessions, rate limits, CORS, Helmet, validation, partner ownership controls, search, favorites, AI concierge endpoint, menus and offer-ready models.
- Docker images and compose configuration for MongoDB, API and Nginx-hosted web client.
- NFC visits require a server-side cryptographic proof and increasing counter. See `docs/NFC-PROVISIONING.md` before using physical tags.
