import type { TaskVibe, TaskStatus, FieldTask } from "../types/index.js";

// ── TaskVibe helpers ──────────────────────────────────────────────────────────

export function isValidTaskVibe(value: unknown): value is TaskVibe {
  return value === "Hype" || value === "Steady" || value === "Chill";
}

export function isValidTaskStatus(value: unknown): value is TaskStatus {
  return (
    value === "PENDING" ||
    value === "SYNCING" ||
    value === "COMPLETED" ||
    value === "CONFLICT"
  );
}

// ── FieldTask helpers ─────────────────────────────────────────────────────────

/** Sort tasks: Hype first, then Steady, then Chill; within a group by updatedAt desc. */
export function sortTasks(tasks: FieldTask[]): FieldTask[] {
  const order: Record<TaskVibe, number> = { Hype: 0, Steady: 1, Chill: 2 };
  return [...tasks].sort((a, b) => {
    const vibeDiff = order[a.vibe] - order[b.vibe];
    if (vibeDiff !== 0) return vibeDiff;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

/** Returns true if a task is overdue (PENDING and lastSynced > 24 hours ago). */
export function isTaskStale(task: FieldTask, nowMs: number = Date.now()): boolean {
  if (task.status !== "PENDING") return false;
  if (task.lastSynced === 0) return false;
  const twentyFourHours = 24 * 60 * 60 * 1000;
  return nowMs - task.lastSynced > twentyFourHours;
}

// ── Date / time utilities ─────────────────────────────────────────────────────

export function formatRelativeTime(isoString: string, nowMs: number = Date.now()): string {
  const diffMs = nowMs - new Date(isoString).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ── Validation helpers ────────────────────────────────────────────────────────

export function validateCreateTaskRequest(body: unknown): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (!body || typeof body !== "object") {
    return { valid: false, errors: ["Request body must be an object"] };
  }
  const b = body as Record<string, unknown>;

  if (!b.title || typeof b.title !== "string" || b.title.trim().length === 0) {
    errors.push("title is required and must be a non-empty string");
  }
  if (b.title && typeof b.title === "string" && b.title.length > 200) {
    errors.push("title must be 200 characters or fewer");
  }
  if (b.description !== undefined && typeof b.description !== "string") {
    errors.push("description must be a string");
  }
  if (b.vibe !== undefined && !isValidTaskVibe(b.vibe)) {
    errors.push(`vibe must be one of: Hype, Steady, Chill`);
  }

  return { valid: errors.length === 0, errors };
}
