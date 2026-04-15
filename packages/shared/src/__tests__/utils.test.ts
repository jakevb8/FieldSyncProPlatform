import {
  isValidTaskVibe,
  isValidTaskStatus,
  sortTasks,
  isTaskStale,
  formatRelativeTime,
  validateCreateTaskRequest,
} from "../utils/index.js";
import type { FieldTask } from "../types/index.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeTask(overrides: Partial<FieldTask> = {}): FieldTask {
  return {
    id: "task-1",
    title: "Test Task",
    description: "Description",
    status: "PENDING",
    vibe: "Steady",
    lastSynced: 0,
    isLocalOnly: false,
    userId: "user-1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

// ── isValidTaskVibe ───────────────────────────────────────────────────────────

describe("isValidTaskVibe", () => {
  it("returns true for Hype", () => {
    expect(isValidTaskVibe("Hype")).toBe(true);
  });
  it("returns true for Steady", () => {
    expect(isValidTaskVibe("Steady")).toBe(true);
  });
  it("returns true for Chill", () => {
    expect(isValidTaskVibe("Chill")).toBe(true);
  });
  it("returns false for unknown value", () => {
    expect(isValidTaskVibe("Mellow")).toBe(false);
  });
  it("returns false for null", () => {
    expect(isValidTaskVibe(null)).toBe(false);
  });
  it("returns false for number", () => {
    expect(isValidTaskVibe(42)).toBe(false);
  });
});

// ── isValidTaskStatus ─────────────────────────────────────────────────────────

describe("isValidTaskStatus", () => {
  const valid = ["PENDING", "SYNCING", "COMPLETED", "CONFLICT"];
  valid.forEach((s) => {
    it(`returns true for ${s}`, () => {
      expect(isValidTaskStatus(s)).toBe(true);
    });
  });
  it("returns false for unknown status", () => {
    expect(isValidTaskStatus("DONE")).toBe(false);
  });
  it("returns false for lowercase", () => {
    expect(isValidTaskStatus("pending")).toBe(false);
  });
});

// ── sortTasks ─────────────────────────────────────────────────────────────────

describe("sortTasks", () => {
  it("sorts Hype before Steady before Chill", () => {
    const tasks = [
      makeTask({ id: "c", vibe: "Chill" }),
      makeTask({ id: "h", vibe: "Hype" }),
      makeTask({ id: "s", vibe: "Steady" }),
    ];
    const sorted = sortTasks(tasks);
    expect(sorted.map((t) => t.vibe)).toEqual(["Hype", "Steady", "Chill"]);
  });

  it("within same vibe, sorts by updatedAt descending", () => {
    const now = Date.now();
    const tasks = [
      makeTask({
        id: "old",
        vibe: "Steady",
        updatedAt: new Date(now - 10000).toISOString(),
      }),
      makeTask({
        id: "new",
        vibe: "Steady",
        updatedAt: new Date(now).toISOString(),
      }),
    ];
    const sorted = sortTasks(tasks);
    expect(sorted[0].id).toBe("new");
    expect(sorted[1].id).toBe("old");
  });

  it("does not mutate the original array", () => {
    const tasks = [
      makeTask({ id: "c", vibe: "Chill" }),
      makeTask({ id: "h", vibe: "Hype" }),
    ];
    const original = [...tasks];
    sortTasks(tasks);
    expect(tasks).toEqual(original);
  });
});

// ── isTaskStale ───────────────────────────────────────────────────────────────

describe("isTaskStale", () => {
  const twentyFiveHoursAgo = Date.now() - 25 * 60 * 60 * 1000;
  const twentyThreeHoursAgo = Date.now() - 23 * 60 * 60 * 1000;

  it("returns true for PENDING task synced >24 hours ago", () => {
    const task = makeTask({ status: "PENDING", lastSynced: twentyFiveHoursAgo });
    expect(isTaskStale(task)).toBe(true);
  });

  it("returns false for PENDING task synced <24 hours ago", () => {
    const task = makeTask({ status: "PENDING", lastSynced: twentyThreeHoursAgo });
    expect(isTaskStale(task)).toBe(false);
  });

  it("returns false when lastSynced is 0 (never synced)", () => {
    const task = makeTask({ status: "PENDING", lastSynced: 0 });
    expect(isTaskStale(task)).toBe(false);
  });

  it("returns false for COMPLETED task even if old", () => {
    const task = makeTask({ status: "COMPLETED", lastSynced: twentyFiveHoursAgo });
    expect(isTaskStale(task)).toBe(false);
  });
});

// ── formatRelativeTime ────────────────────────────────────────────────────────

describe("formatRelativeTime", () => {
  const now = Date.now();

  it('returns "just now" for < 1 minute ago', () => {
    const ts = new Date(now - 30_000).toISOString();
    expect(formatRelativeTime(ts, now)).toBe("just now");
  });

  it("returns minutes ago for < 1 hour", () => {
    const ts = new Date(now - 5 * 60_000).toISOString();
    expect(formatRelativeTime(ts, now)).toBe("5m ago");
  });

  it("returns hours ago for < 24 hours", () => {
    const ts = new Date(now - 3 * 60 * 60_000).toISOString();
    expect(formatRelativeTime(ts, now)).toBe("3h ago");
  });

  it("returns days ago for >= 24 hours", () => {
    const ts = new Date(now - 2 * 24 * 60 * 60_000).toISOString();
    expect(formatRelativeTime(ts, now)).toBe("2d ago");
  });
});

// ── validateCreateTaskRequest ─────────────────────────────────────────────────

describe("validateCreateTaskRequest", () => {
  it("returns valid for a complete valid request", () => {
    const result = validateCreateTaskRequest({
      title: "Fix the pump",
      description: "On site B",
      vibe: "Hype",
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("returns valid when description and vibe are omitted", () => {
    const result = validateCreateTaskRequest({ title: "Quick check" });
    expect(result.valid).toBe(true);
  });

  it("returns invalid when body is not an object", () => {
    const result = validateCreateTaskRequest("string");
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("returns invalid when title is missing", () => {
    const result = validateCreateTaskRequest({ description: "desc", vibe: "Chill" });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("title"))).toBe(true);
  });

  it("returns invalid when title is empty string", () => {
    const result = validateCreateTaskRequest({ title: "  " });
    expect(result.valid).toBe(false);
  });

  it("returns invalid when title exceeds 200 chars", () => {
    const result = validateCreateTaskRequest({ title: "x".repeat(201) });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("200"))).toBe(true);
  });

  it("returns invalid when vibe is unrecognised", () => {
    const result = validateCreateTaskRequest({ title: "Task", vibe: "Mellow" });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("vibe"))).toBe(true);
  });

  it("returns invalid when description is not a string", () => {
    const result = validateCreateTaskRequest({ title: "Task", description: 42 });
    expect(result.valid).toBe(false);
  });
});
