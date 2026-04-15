"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getTask, updateTask, deleteTask } from "@/lib/api-client";
import { VibeChip } from "@/components/ui/VibeChip";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { formatRelativeTime } from "@repo/shared/utils";
import type { FieldTask, TaskVibe, TaskStatus } from "@repo/shared/types";

interface TaskDetailPageProps {
  params: { id: string };
}

export default function TaskDetailPage({ params }: TaskDetailPageProps) {
  const router = useRouter();
  const { idToken } = useAuth();

  const [task, setTask] = useState<FieldTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editVibe, setEditVibe] = useState<TaskVibe>("Steady");
  const [editStatus, setEditStatus] = useState<TaskStatus>("PENDING");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!idToken) return;
    setLoading(true);
    getTask(params.id, idToken)
      .then((t) => {
        setTask(t);
        setEditTitle(t.title);
        setEditDescription(t.description);
        setEditVibe(t.vibe);
        setEditStatus(t.status);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.id, idToken]);

  async function handleSave() {
    if (!idToken || !task) return;
    setSaving(true);
    try {
      const updated = await updateTask(
        task.id,
        {
          title: editTitle.trim(),
          description: editDescription.trim(),
          vibe: editVibe,
          status: editStatus,
        },
        idToken
      );
      setTask(updated);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!idToken || !task) return;
    if (!confirm("Delete this task?")) return;
    try {
      await deleteTask(task.id, idToken);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  if (loading) {
    return <p style={{ textAlign: "center", color: "#b2bec3" }}>Loading...</p>;
  }
  if (error) {
    return <p style={{ color: "#d63031" }}>{error}</p>;
  }
  if (!task) {
    return <p style={{ color: "#636e72" }}>Task not found.</p>;
  }

  return (
    <div>
      <button
        onClick={() => router.push("/dashboard")}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#6c5ce7",
          fontSize: "14px",
          padding: 0,
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        &larr; Back to dashboard
      </button>

      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          padding: "32px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}
      >
        {!editing ? (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "16px",
              }}
            >
              <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 700 }}>
                {task.title}
              </h1>
              <VibeChip vibe={task.vibe} />
            </div>

            {task.description && (
              <p
                style={{
                  margin: "0 0 20px",
                  color: "#636e72",
                  lineHeight: "1.6",
                }}
              >
                {task.description}
              </p>
            )}

            <div
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <StatusBadge status={task.status} />
              <span style={{ fontSize: "12px", color: "#b2bec3" }}>
                Updated {formatRelativeTime(task.updatedAt)}
              </span>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <Button onClick={() => setEditing(true)}>Edit</Button>
              <Button variant="danger" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </>
        ) : (
          <div>
            <h2 style={{ margin: "0 0 20px", fontSize: "18px" }}>Edit Task</h2>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 500,
                  marginBottom: "6px",
                }}
              >
                Title *
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
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
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 500,
                  marginBottom: "6px",
                }}
              >
                Description
              </label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={4}
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

            <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 500,
                    marginBottom: "6px",
                  }}
                >
                  Vibe
                </label>
                <select
                  value={editVibe}
                  onChange={(e) => setEditVibe(e.target.value as TaskVibe)}
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

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 500,
                    marginBottom: "6px",
                  }}
                >
                  Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as TaskStatus)}
                  style={{
                    padding: "10px 12px",
                    border: "1px solid #dfe6e9",
                    borderRadius: "6px",
                    fontSize: "14px",
                  }}
                >
                  <option value="PENDING">Pending</option>
                  <option value="SYNCING">Syncing</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CONFLICT">Conflict</option>
                </select>
              </div>
            </div>

            {error && (
              <p
                style={{
                  color: "#d63031",
                  fontSize: "13px",
                  marginBottom: "16px",
                }}
              >
                {error}
              </p>
            )}

            <div style={{ display: "flex", gap: "12px" }}>
              <Button onClick={handleSave} loading={saving}>
                Save
              </Button>
              <Button variant="secondary" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
