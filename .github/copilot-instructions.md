# Thermomix Recipe Genius - AI Coding Guidelines

## Architecture Overview

This is a monorepo with three main components:
- **Web** (`apps/web/`): Next.js 14 app for recipe creation and Cookidoo integration UI
- **Server** (`apps/server/`): FastAPI backend handling authentication and Cookidoo API calls
- **Schema** (`packages/schema/`): Shared Zod schemas for type-safe recipe data across components

Data flows: Web → Server → Cookidoo API. Server runs on port 7070, web on 3000.

## Development Setup

```bash
# Initial setup (installs Node + Python deps)
make setup

# Start both server and web in parallel
make dev

# Or run individually:
pnpm -C apps/server dev  # FastAPI on :7070
pnpm -C apps/web dev     # Next.js on :3000
```

## Key Conventions

### Environment & Configuration
- Server config via `COOKIDOO_*` env vars (region, mock mode, JWT token)
- Web connects to server via `NEXT_PUBLIC_SERVER_URL` (defaults to localhost:7070)
- Mock mode (`COOKIDOO_MOCK=0`) disabled by default for production
- JWT auth with 1-hour tokens, server-side only
- JWT tokens obtained via `pnpm -C apps/server run get-jwt` script

### Recipe Schema (`packages/schema/`)
- Ingredients: prefer `amount_g` or `amount_ml` over cups
- Steps: Thermomix-specific constraints (temp: 37-160°C, speed: 0-10 or "Turbo")
- Modes: "Weigh", "Heat", "Blend", "Stir", "Knead", "Whisk"
- Safety flag for hazardous operations

### API Patterns
- Server endpoints: `/login`, `/cookidoo/created-recipes`, `/cookidoo/created-recipes/list`
- Request format: `{ token, recipe }` for recipe uploads
- Response includes `mock: true/false` to indicate test vs real mode
- Use `map_to_cookidoo_payload()` in server for Cookidoo API translation

### Testing
- E2E tests in `tests/e2e/` using Playwright
- Run with `pnpm test:e2e` (requires both server and web running)
- Tests verify JWT login → upload → verification flow
- Use JWT tokens for authentication in tests

### Code Organization
- Shared types via `@thermo/schema` workspace package
- Server models mirror Zod schemas for consistency
- Web uses client-side state for recipe editing
- Server handles all external API calls (never client-side)

## Common Patterns

### Adding Recipe Features
1. Update `packages/schema/index.ts` with new fields
2. Add server validation in `apps/server/main.py`
3. Update web UI in `apps/web/app/page.tsx`
4. Test end-to-end with `pnpm test:e2e`

### Switching from Mock to Real Cookidoo
1. Set `COOKIDOO_MOCK=0`
2. Replace TODO in `create_created_recipe()` with real Cookidoo client
3. Keep `map_to_cookidoo_payload()` as single source of truth for field mapping

### Debugging
- Server logs visible in terminal when running `pnpm -C apps/server dev`
- Web dev server shows React errors in browser console
- E2E tests capture traces on failure (`playwright.config.ts`)

## Security Notes
- Never store Cookidoo credentials in client code
- All authentication handled server-side
- JWT tokens are short-lived (1 hour)
- Disclose unofficial Cookidoo integration clearly