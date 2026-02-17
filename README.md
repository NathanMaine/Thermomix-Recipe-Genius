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

# 2) Get Cookidoo JWT token (see below)
pnpm -C apps/server run get-jwt

# 3) Start server (production mode - real Cookidoo API calls)
COOKIDOO_MOCK=0 pnpm -C apps/server dev

# 4) Start web
pnpm -C apps/web dev

# 5) Open http://localhost:3000
# Paste your JWT token and click "Login", then "Save to Cookidoo"
```

## Getting Cookidoo JWT Token

The app uses JWT tokens for authentication instead of email/password:

```bash
# Run the Playwright script to extract JWT token from Cookidoo
pnpm -C apps/server run get-jwt
```

This will open a browser, log into Cookidoo, and save the JWT token to your `.env` file.

## E2E test
In a separate terminal (with server at 7070 and web at 3000):
```bash
pnpm test:e2e
# or the visual runner
pnpm test:e2e:ui
```

## Production Deployment

The app is now production-ready with real Cookidoo API integration:

1. **Get JWT Token**: Run `pnpm -C apps/server run get-jwt` to obtain your Cookidoo JWT token
2. **Set Environment**: Ensure `COOKIDOO_MOCK=0` in your `.env` file
3. **Deploy**: Both server and web app can be deployed to any hosting platform

### Environment Variables

```bash
# Server (.env)
COOKIDOO_MOCK=0                    # 0 for production, 1 for development
COOKIDOO_JWT=<your-jwt-token>      # From get-jwt script
JWT_SECRET=<secure-random-string>  # Change in production
COOKIDOO_HOST=cookidoo.thermomix.com
COOKIDOO_LOCALE=en-US
COOKIDOO_REGION=us

# Web (environment variables or .env.local)
NEXT_PUBLIC_SERVER_URL=http://localhost:7070  # Your server URL
```

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
- **Production Ready**: Real Cookidoo API integration (mock mode available for development)
- **E2E Testing**: Complete login → upload → verification flow
- **JWT Authentication**: Secure token-based auth using Cookidoo's OAuth flow

## Security Hardening (Feb 2026)

- **JWT secret enforced**: `JWT_SECRET` must be set as an environment variable. The server will not start with a fallback/default secret. Generate one with: `python -c "import secrets; print(secrets.token_hex(32))"`
- **Error messages sanitized**: 401 and 500 responses no longer include raw exception strings. Internal details are logged server-side only.
- **`/docs` and `/redoc` disabled**: FastAPI auto-generated API docs are not exposed. Re-enable in development by removing `docs_url=None, redoc_url=None` from the `FastAPI()` constructor.

## Notes
- Never store real credentials in the client; use the server endpoints.
- Disclose clearly: this project is not affiliated with Vorwerk/Cookidoo.
- Recipes use weight-based measurements optimized for Thermomix's built-in scale.