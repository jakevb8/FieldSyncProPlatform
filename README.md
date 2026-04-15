# FieldSyncProPlatform

The server-side platform for [FieldSync Pro](https://github.com/jakevb8/FieldSyncPro) — a field task management system for Android.

This monorepo contains the REST API, database schema, and web frontend that the Android client syncs with.

## Monorepo Structure

```
FieldSyncProPlatform/
├── apps/
│   ├── api/          Express REST API (Railway)
│   └── web/          Next.js 14 web app (Vercel)
└── packages/
    ├── shared/       Shared TypeScript types and utils
    └── tsconfig/     Shared TypeScript config
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| API server | Node.js 20 + Express 4 |
| Database | Neon DB (PostgreSQL serverless) + Drizzle ORM |
| Auth | Firebase Auth (client) + Firebase Admin SDK (JWT verification) |
| Web frontend | Next.js 14 App Router |
| Session | HttpOnly cookie via `adminAuth.createSessionCookie()` |
| Monorepo | Turborepo + npm workspaces |
| API deploy | Railway |
| Web deploy | Vercel |

## Getting Started

### Prerequisites
- Node.js >=20
- A Firebase project (Authentication enabled)
- A Neon DB database

### Install

```bash
npm install
```

### Configure environment variables

Copy and fill in the env files:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

### Database setup

```bash
npm run db:push      # push schema to Neon DB
```

### Run in development

```bash
npm run dev          # starts API (port 4000) and web (port 3000) concurrently
```

### Run tests

```bash
npm test
```

All 54 unit tests should pass:
- `packages/shared` — 31 tests (type guards, sort, stale detection, formatting, validation)
- `apps/api` — 7 tests (Firebase Auth middleware, error handler middleware)
- `apps/web` — 16 tests (VibeChip, StatusBadge, Button, TaskList components)

## API Reference

All endpoints (except `/health`) require `Authorization: Bearer <firebase_id_token>`.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/v1/tasks` | List tasks for authenticated user |
| GET | `/v1/tasks/:id` | Get single task |
| POST | `/v1/tasks` | Create task |
| PATCH | `/v1/tasks/:id` | Update task |
| DELETE | `/v1/tasks/:id` | Delete task |
| POST | `/v1/users/me` | Upsert user from Firebase token |
| GET | `/v1/users/me` | Get current user |
| POST | `/v1/sync/push` | Bulk push tasks from Android |
| GET | `/v1/sync/pull` | Pull all tasks for Android |

## Android Companion App

The Android client is at [github.com/jakevb8/FieldSyncPro](https://github.com/jakevb8/FieldSyncPro).

## License

Private.
