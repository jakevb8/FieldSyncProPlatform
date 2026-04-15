# FieldSyncProPlatform — Specification

## Overview

FieldSyncProPlatform is the server-side and web platform for the FieldSync Pro product.
It provides the REST API, database, and web frontend that the Android client (FieldSyncPro) syncs with.

## Architecture

```
FieldSyncProPlatform/
├── apps/
│   ├── api/          Node.js + Express REST API
│   └── web/          Next.js 14 App Router web frontend
└── packages/
    ├── shared/       Shared TypeScript types and utilities
    └── tsconfig/     Shared TypeScript configs
```

### Toolchain
- Monorepo: Turborepo + npm workspaces
- Language: TypeScript 5.x (strict mode)
- Node requirement: >=20.0.0

---

## packages/shared

### Types
| Type | Description |
|------|-------------|
| `TaskVibe` | `"Hype" \| "Steady" \| "Chill"` |
| `TaskStatus` | `"PENDING" \| "SYNCING" \| "COMPLETED" \| "CONFLICT"` |
| `FieldTask` | Core task domain model |
| `User` | Platform user |
| `CreateTaskRequest` | Body for POST /v1/tasks |
| `UpdateTaskRequest` | Body for PATCH /v1/tasks/:id |
| `ApiResponse<T>` | Standard API envelope |
| `SyncPushRequest` | Bulk push payload from Android |
| `SyncPullResponse` | Bulk pull response |

### Utils
| Function | Description |
|----------|-------------|
| `isValidTaskVibe(v)` | Type guard |
| `isValidTaskStatus(v)` | Type guard |
| `sortTasks(tasks)` | Sort by vibe priority then updatedAt desc |
| `isTaskStale(task, nowMs?)` | True if PENDING and lastSynced > 24h ago |
| `formatRelativeTime(iso, nowMs?)` | Human-readable relative time |
| `validateCreateTaskRequest(body)` | Returns `{ valid, errors }` |

---

## apps/api

### Stack
- Express 4
- Firebase Admin SDK (JWT verification)
- Drizzle ORM + Neon DB (PostgreSQL serverless)
- Deployed on Railway

### Database Schema

**users**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| firebase_uid | text | unique |
| email | text | |
| display_name | text | nullable |
| photo_url | text | nullable |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**field_tasks**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → users.id (cascade delete) |
| title | text | |
| description | text | default "" |
| status | text | PENDING / SYNCING / COMPLETED / CONFLICT |
| vibe | text | Hype / Steady / Chill |
| last_synced | bigint | epoch-millis |
| is_local_only | boolean | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### Endpoints

All endpoints except `/health` require `Authorization: Bearer <firebase_id_token>`.

**Health**
- `GET /health` → `{ status: "ok", timestamp: string }`

**Tasks** (`/v1/tasks`)
- `GET /v1/tasks` → `ApiResponse<FieldTask[]>`
- `GET /v1/tasks/:id` → `ApiResponse<FieldTask>`
- `POST /v1/tasks` → `ApiResponse<FieldTask>` (body: `CreateTaskRequest`)
- `PATCH /v1/tasks/:id` → `ApiResponse<FieldTask>` (body: `UpdateTaskRequest`)
- `DELETE /v1/tasks/:id` → 204

**Users** (`/v1/users`)
- `POST /v1/users/me` → `ApiResponse<User>` (upsert from Firebase token claims)
- `GET /v1/users/me` → `ApiResponse<User>`

**Sync** (`/v1/sync`)
- `POST /v1/sync/push` → `{ synced: number, ids: Record<string,string> }`
- `GET /v1/sync/pull?since=<epoch_ms>` → `SyncPullResponse`

### Environment Variables
```
DATABASE_URL=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
FRONTEND_URL=
PORT=               # set by Railway automatically
NODE_ENV=
```

---

## apps/web

### Stack
- Next.js 14 App Router
- Firebase Auth (client-side, Google + email/password)
- Session cookies (HttpOnly, via Firebase Admin `createSessionCookie`)
- Deployed on Vercel

### Route Structure
```
app/
├── layout.tsx                  Root layout (Providers)
├── page.tsx                    Redirects to /dashboard
├── (auth)/
│   └── login/page.tsx          Sign-in page (client component)
├── (app)/
│   ├── layout.tsx              Auth guard (server component, reads session cookie)
│   ├── dashboard/page.tsx      Task list + create form
│   └── tasks/[id]/page.tsx     Task detail + edit + delete
└── api/
    ├── auth/session/route.ts   POST — exchange ID token for session cookie
    └── auth/signout/route.ts   DELETE — clear session cookie
```

### Auth Flow
1. User signs in via Firebase client SDK (email/password or Google popup)
2. Client gets ID token → POST `/api/auth/session` with `{ idToken }`
3. Next.js route handler calls `adminAuth.createSessionCookie(idToken)` → sets HttpOnly cookie
4. Protected layouts call `getSessionUser()` → reads & verifies session cookie
5. If `getSessionUser()` returns null → `redirect("/login")`
6. Sign-out: `firebase.auth().signOut()` + DELETE `/api/auth/signout` → cookie cleared

### Environment Variables
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_API_URL=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
SESSION_SECRET=
```

---

## Testing

| Package | Framework | Tests |
|---------|-----------|-------|
| `@repo/shared` | Jest (ESM) | 31 — utils (type guards, sort, stale, format, validate) |
| `@repo/api` | Jest (ESM) | 7 — firebaseAuth middleware, errorHandler middleware |
| `@repo/web` | Jest + jsdom | 16 — VibeChip, StatusBadge, Button, TaskList components |

Run: `npm test` from the monorepo root.

---

## Changelog

### 1.0.0 (initial)
- Monorepo scaffold: Turborepo + npm workspaces
- `packages/shared`: FieldTask types, TaskVibe, TaskStatus, utility functions
- `apps/api`: Express API with Firebase Auth, Drizzle/Neon DB, full CRUD + sync endpoints
- `apps/web`: Next.js 14 App Router, Firebase Auth, session cookies, task dashboard + detail
- 54 unit tests passing
