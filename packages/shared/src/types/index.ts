// ── TaskVibe ─────────────────────────────────────────────────────────────────

export type TaskVibe = "Hype" | "Steady" | "Chill";

export const TASK_VIBES: TaskVibe[] = ["Hype", "Steady", "Chill"];

// ── TaskStatus ────────────────────────────────────────────────────────────────

export type TaskStatus = "PENDING" | "SYNCING" | "COMPLETED" | "CONFLICT";

export const TASK_STATUSES: TaskStatus[] = [
  "PENDING",
  "SYNCING",
  "COMPLETED",
  "CONFLICT",
];

// ── FieldTask ─────────────────────────────────────────────────────────────────

/**
 * Core domain model — shared between the Android client, Express API, and Next.js web.
 * Mirrors the Kotlin `FieldTask` data class exactly.
 */
export interface FieldTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  vibe: TaskVibe;
  /** Epoch-millis timestamp of last successful server sync. 0 = never synced. */
  lastSynced: number;
  /** True when the task was created offline and hasn't been pushed to the server yet. */
  isLocalOnly: boolean;
  /** Firebase UID of the user who owns this task. */
  userId: string;
  createdAt: string; // ISO-8601
  updatedAt: string; // ISO-8601
}

// ── User ──────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  firebaseUid: string;
  email: string;
  displayName: string | null;
  photoUrl: string | null;
  createdAt: string;
}

// ── API Requests / Responses ──────────────────────────────────────────────────

export interface CreateTaskRequest {
  title: string;
  description: string;
  vibe: TaskVibe;
  /** Client-generated UUID for idempotent creation. */
  id?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  vibe?: TaskVibe;
  status?: TaskStatus;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  code?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
}

// ── Sync ──────────────────────────────────────────────────────────────────────

/** Payload sent from the Android client during a bulk sync push. */
export interface SyncPushRequest {
  tasks: Array<Omit<FieldTask, "userId" | "createdAt" | "updatedAt">>;
}

export interface SyncPullResponse {
  tasks: FieldTask[];
  serverTimestamp: number;
}
