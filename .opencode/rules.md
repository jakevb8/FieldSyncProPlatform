# FieldSyncProPlatform — OpenCode Rules

## Project Overview
This is the platform monorepo for FieldSync Pro. It contains:
- `apps/api` — Node.js + Express backend (Firebase Admin JWT auth, Neon DB via Drizzle ORM)
- `apps/web` — Next.js 14 App Router frontend (Firebase Auth client-side, session cookie pattern)
- `packages/shared` — shared TypeScript types and utilities

## Monorepo Structure
- **Tooling:** Turborepo + npm workspaces (`packageManager: npm@10.8.2`)
- **Package naming:** `@repo/api`, `@repo/web`, `@repo/shared`, `@repo/tsconfig`
- **Build order:** `packages/shared` always builds before `apps/*` (via `"dependsOn": ["^build"]` in `turbo.json`)

## Code Standards
- Always write unit tests for every feature — no exceptions
- Always update `spec.md` when features are added or changed
- Commit messages follow Conventional Commits: `feat:`, `fix:`, `test:`, `docs:`, `refactor:`
- Always run `npm test` successfully before committing
- TypeScript strict mode; no `any` without a comment explaining why

## Architecture Rules

### Backend (`apps/api`)
- Auth: Firebase Admin SDK — verify `Authorization: Bearer <id_token>` on all protected routes
- DB: Neon DB + Drizzle ORM — always use the `db` singleton from `src/db/client.ts`
- Firebase Admin init: guard with `getApps().length` — never init twice
- Railway deploy: bind to `0.0.0.0`, read `PORT` from env, handle `SIGTERM` for graceful shutdown
- `FIREBASE_PRIVATE_KEY` must call `.replace(/\\n/g, "\n")` when passed to `cert()`

### Frontend (`apps/web`)
- Auth: Firebase client SDK + session cookie pattern
  - Client signs in → gets ID token → POSTs to `/api/auth/session` → Next.js route handler calls `adminAuth.createSessionCookie()` → sets HttpOnly cookie
  - Server components / layouts read the session cookie via `getSessionUser()` from `lib/session.ts`
  - Protected routes live under `app/(app)/`; public routes under `app/(auth)/`
- **Never** put `FIREBASE_PRIVATE_KEY` or Firebase Admin env vars in `NEXT_PUBLIC_*` variables
- All `"use client"` components that need Firebase must import from `lib/firebase.ts`

### Shared (`packages/shared`)
- Only pure TypeScript — no framework dependencies
- Types and utils must stay framework-agnostic (used by Android, API, and web)
- All exports must go through `src/index.ts` or the named exports in `package.json` (`./types`, `./utils`)

## Testing
- **shared:** Jest (ESM mode via `ts-jest/presets/default-esm`), config in `jest.config.cjs`
- **api:** Jest (ESM mode), mocked Firebase Admin, no real DB calls in unit tests
- **web:** Jest + jsdom + `@testing-library/react`, config in `jest.config.js`
- Run all tests: `npm test` from the monorepo root

## Environment Variables
- Never commit `.env` files
- Always keep `.env.example` in sync when adding new variables
- API variables: see `apps/api/.env.example`
- Web variables: see `apps/web/.env.example`
- Root `.env.example` documents cross-cutting variables

## Deployment
- **API:** Railway — uses `railway.json` for healthcheck config (`/health` endpoint)
- **Web:** Vercel-compatible (Next.js App Router, no custom server)
