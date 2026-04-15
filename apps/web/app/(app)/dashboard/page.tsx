"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTasks } from "@/hooks/useTasks";
import { TaskList } from "@/components/ui/TaskList";
import { Button } from "@/components/ui/Button";
import type { FieldTask, TaskVibe } from "@repo/shared/types";

export default function DashboardPage() {
  const router = useRouter();
  const { tasks, loading, error, create } = useTasks();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [vibe, setVibe] = useState<TaskVibe>("Steady");
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setCreating(true);
    try {
      await create({ title: title.trim(), description: description.trim(), vibe });
      setTitle("");
      setDescription("");
      setVibe("Steady");
      setShowForm(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setCreating(false);
    }
  }

  function handleTaskClick(task: FieldTask) {
    router.push(`/tasks/${task.id}`);
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 700 }}>
            My Tasks
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#636e72" }}>
            {tasks.length} task{tasks.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "New Task"}
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          style={{
            backgroundColor: "#fff",
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
            padding: "24px",
            marginBottom: "24px",
          }}
        >
          <h2 style={{ margin: "0 0 20px", fontSize: "16px" }}>Create Task</h2>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 500, marginBottom: "6px" }}>
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={200}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #dfe6e9",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 500, marginBottom: "6px" }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #dfe6e9",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
                resize: "vertical",
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 500, marginBottom: "6px" }}>
              Vibe
            </label>
            <select
              value={vibe}
              onChange={(e) => setVibe(e.target.value as TaskVibe)}
              style={{
                padding: "10px 12px",
                border: "1px solid #dfe6e9",
                borderRadius: "6px",
                fontSize: "14px",
              }}
            >
              <option value="Hype">Hype</option>
              <option value="Steady">Steady</option>
              <option value="Chill">Chill</option>
            </select>
          </div>

          {formError && (
            <p style={{ color: "#d63031", fontSize: "13px", marginBottom: "16px" }}>
              {formError}
            </p>
          )}

          <Button type="submit" loading={creating}>
            Create Task
          </Button>
        </form>
      )}

      {loading && (
        <p style={{ textAlign: "center", color: "#b2bec3" }}>Loading tasks...</p>
      )}
      {error && (
        <p style={{ textAlign: "center", color: "#d63031" }}>{error}</p>
      )}

      {!loading && (
        <TaskList
          tasks={tasks}
          onTaskClick={handleTaskClick}
          emptyMessage="No tasks yet. Create your first one!"
        />
      )}
    </div>
  );
}
