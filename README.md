# Rytmix Web

The web frontend for **Rytmix** — a web-first music streaming app (a rebuild of the
original WPF desktop version). This repo is the Next.js client; it talks to the
separate `rytmix-api` backend (ASP.NET Core) over HTTPS and holds no secrets of
its own. The same build later becomes a Tauri desktop app, so everything is
client-rendered.

## Tech stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI components | shadcn/ui (components live in `src/components/ui/`) |
| Player state | Zustand *(added in Phase 1)* |
| Audio / visualizer | HTML5 `<audio>` + Web Audio API *(Phase 1)* |
| Hosting | Vercel |

## Getting started

**Prerequisites:** Node.js 20.9+ and npm.

```bash
# 1. Install dependencies
npm install

# 2. Set up your local environment
cp .env.example .env.local
#    then edit .env.local and point NEXT_PUBLIC_API_BASE_URL at your running API

# 3. Start the dev server
npm run dev
```

Open http://localhost:3000.

> The frontend needs the `rytmix-api` backend running for any real data. During
> Phase 0 the home page is a static placeholder and works without it.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server at http://localhost:3000 |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | Type-check without emitting files (also runs during `build`) |

## Environment variables

Only **public** configuration belongs in the frontend. Real secrets (DB connection
string, Jamendo key, JWT signing key) live only in the backend.

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | yes | Base URL of the `rytmix-api` backend. The `NEXT_PUBLIC_` prefix means it is inlined into the browser bundle, so it is **not** a secret. |

`.env.example` (committed) documents the variables; `.env.local` (gitignored)
holds your real values. Never commit `.env.local`.

## Project structure

```
rytmix-web/
├── src/
│   ├── app/                # App Router
│   │   ├── layout.tsx       # root layout + metadata
│   │   ├── page.tsx         # Phase 0 placeholder home page (client-rendered)
│   │   └── globals.css      # Tailwind + shadcn theme tokens
│   ├── components/
│   │   └── ui/              # shadcn/ui components (owned in-repo, editable)
│   ├── lib/
│   │   ├── api.ts           # typed API client — reads NEXT_PUBLIC_API_BASE_URL
│   │   └── utils.ts         # cn() class-name helper
│   └── store/              # Zustand stores (Phase 1) — empty for now
├── public/                 # static assets
├── components.json          # shadcn/ui config
├── next.config.ts           # export-compatible; output:'export' is added in Phase 4
├── .env.example             # documents required env vars (committed)
└── .env.local               # local values (gitignored)
```

## Conventions

- **Client-side data fetching only for core UI.** Pages load, then fetch from the
  API on the client. No server-side rendering of core data (the desktop build has
  no server). Keep `next.config.ts` compatible with `output: 'export'`.
- **One door to the backend.** Talk to the API only through `src/lib/api.ts` — no
  scattered `fetch` calls.
- **No hardcoded API URL.** Always read it from `NEXT_PUBLIC_API_BASE_URL`.
- **No secrets in this repo.** The only config here is the public API base URL.

## Workflow

- Work on `feature/<name>` branches → open a Pull Request. Never commit directly
  to `main`.
- Run `npm run lint`, `npx tsc --noEmit`, and `npm run build` before opening a PR.
- The web frontend deploys to Vercel; each PR gets a preview URL.
---

© 2026 the Rytmix team. All rights reserved. Published for portfolio /
demonstration purposes; please don't reuse without permission.
