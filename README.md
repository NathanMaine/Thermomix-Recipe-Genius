# Thermomix Recipe Genius — Full-Stack Implementation

This is a complete full-stack implementation that pairs with your existing Cookidoo workflow:
- **Web app** (Next.js) to build/preview recipes and **Save to Cookidoo**
- **Server** (FastAPI) that handles login and **Created Recipes** upload (mock mode by default)
- **Shared schema** (Zod) for type-safe recipe data across components
- **E2E tests** (Playwright) for login → upload → verify flow

> ⚠️ **Unofficial**: There is no public Thermomix hardware API. This companion integrates with **Cookidoo Created Recipes** and shopping list flows; once a recipe is in Cookidoo, **TM6 Guided Cooking** handles the device functions on-device.

## Architecture

```
Web App (Next.js :3000) → Server (FastAPI :7070) → Cookidoo API
       ↑                           ↑
   @thermo/schema              @thermo/schema
```

- **Monorepo** with pnpm workspaces
- **Type-safe** recipe schemas shared between frontend and backend
- **JWT authentication** with server-side Cookidoo integration
- **Mock mode** enabled by default for development

## Prereqs
- Node 20+, pnpm (`corepack enable`), Python 3.11+
- (Optional) VS Code + recommended extensions

## Quick start
```bash
# 1) Install deps (Node + Python)
pnpm i
python -m pip install -r apps/server/requirements.txt

# 2) Start server (mock mode ON by default)
COOKIDOO_MOCK=1 pnpm -C apps/server dev

# 3) Start web
pnpm -C apps/web dev

# 4) Open http://localhost:3000
# Login with any email/password (mock mode), click "Save to Cookidoo"
```

## E2E test
In a separate terminal (with server at 7070 and web at 3000):
```bash
pnpm test:e2e
# or the visual runner
pnpm test:e2e:ui
```

## Moving from MOCK → real
Replace the TODOs in `apps/server/main.py` under `create_created_recipe()` with calls to the unofficial Cookidoo client of your choice. Keep the `map_to_cookidoo_payload()` as your single source of truth; translate field names there if needed.

## Development Commands

```bash
# Setup everything
make setup

# Run both server and web in parallel
make dev

# Run individually
make dev-server  # FastAPI on :7070
make dev-web     # Next.js on :3000

# Testing
make test        # E2E tests
pnpm test:e2e:ui # Visual test runner

# Code quality
make lint        # ESLint
make typecheck   # TypeScript
```

## Project Structure

```
├── apps/
│   ├── server/          # FastAPI backend
│   │   ├── main.py      # API endpoints, auth, Cookidoo integration
│   │   ├── requirements.txt
│   │   └── pyproject.toml
│   └── web/             # Next.js frontend
│       ├── app/
│       │   ├── layout.tsx
│       │   └── page.tsx # Recipe builder UI
│       ├── package.json
│       └── next.config.mjs
├── packages/
│   └── schema/          # Shared Zod schemas
│       ├── index.ts     # Recipe, Ingredient, Step types
│       └── package.json
├── tests/
│   └── e2e/             # Playwright E2E tests
│       └── upload.spec.ts
├── package.json         # Root monorepo config
├── pnpm-workspace.yaml  # Workspace configuration
└── playwright.config.ts # E2E test configuration
```

## Key Features

- **Recipe Schema**: Thermomix-specific constraints (temp 37-160°C, speed 0-10 or "Turbo")
- **Cookidoo Integration**: JWT auth, recipe upload, created recipes listing
- **Type Safety**: Zod schemas shared across frontend/backend
- **Mock Mode**: Full development workflow without real Cookidoo credentials
- **E2E Testing**: Complete login → upload → verification flow

## Notes
- Never store real credentials in the client; use the server endpoints.
- Disclose clearly: this project is not affiliated with Vorwerk/Cookidoo.
- Recipes use weight-based measurements optimized for Thermomix's built-in scale.