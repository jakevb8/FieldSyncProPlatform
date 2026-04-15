/**
 * Unit tests for web UI components.
 * Components that use only shared utils + plain React — no Firebase, no Next.js router.
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { VibeChip } from "../components/ui/VibeChip";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Button } from "../components/ui/Button";
import { TaskList } from "../components/ui/TaskList";
import type { FieldTask } from "@repo/shared/types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeTask(overrides: Partial<FieldTask> = {}): FieldTask {
  return {
    id: "task-1",
    title: "Fix the pump",
    description: "Site B pump needs attention",
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

// ── VibeChip ──────────────────────────────────────────────────────────────────

describe("VibeChip", () => {
  it("renders Hype label", () => {
    render(<VibeChip vibe="Hype" />);
    expect(screen.getByText("Hype")).toBeInTheDocument();
  });

  it("renders Steady label", () => {
    render(<VibeChip vibe="Steady" />);
    expect(screen.getByText("Steady")).toBeInTheDocument();
  });

  it("renders Chill label", () => {
    render(<VibeChip vibe="Chill" />);
    expect(screen.getByText("Chill")).toBeInTheDocument();
  });
});

// ── StatusBadge ───────────────────────────────────────────────────────────────

describe("StatusBadge", () => {
  const statuses = ["PENDING", "SYNCING", "COMPLETED", "CONFLICT"] as const;
  statuses.forEach((status) => {
    it(`renders ${status} label`, () => {
      render(<StatusBadge status={status} />);
      expect(screen.getByText(status)).toBeInTheDocument();
    });
  });
});

// ── Button ────────────────────────────────────────────────────────────────────

describe("Button", () => {
  it("renders children text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("shows Loading... when loading prop is true", () => {
    render(<Button loading>Save</Button>);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("is disabled when disabled prop is set", () => {
    render(<Button disabled>Save</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("is disabled when loading is true", () => {
    render(<Button loading>Save</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("renders as a submit button when type='submit'", () => {
    render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });
});

// ── TaskList ──────────────────────────────────────────────────────────────────

describe("TaskList", () => {
  it("shows empty message when tasks array is empty", () => {
    render(<TaskList tasks={[]} emptyMessage="Nothing here" />);
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });

  it("renders task titles when tasks are provided", () => {
    const tasks = [
      makeTask({ id: "1", title: "Alpha Task" }),
      makeTask({ id: "2", title: "Beta Task" }),
    ];
    render(<TaskList tasks={tasks} />);
    expect(screen.getByText("Alpha Task")).toBeInTheDocument();
    expect(screen.getByText("Beta Task")).toBeInTheDocument();
  });

  it("renders vibe chips for each task", () => {
    const tasks = [
      makeTask({ id: "1", title: "Task A", vibe: "Hype" }),
      makeTask({ id: "2", title: "Task B", vibe: "Chill" }),
    ];
    render(<TaskList tasks={tasks} />);
    expect(screen.getAllByText("Hype")).toHaveLength(1);
    expect(screen.getAllByText("Chill")).toHaveLength(1);
  });

  it("renders status badges for each task", () => {
    const tasks = [
      makeTask({ id: "1", title: "Task A", status: "COMPLETED" }),
      makeTask({ id: "2", title: "Task B", status: "CONFLICT" }),
    ];
    render(<TaskList tasks={tasks} />);
    expect(screen.getByText("COMPLETED")).toBeInTheDocument();
    expect(screen.getByText("CONFLICT")).toBeInTheDocument();
  });
});
