import type { FieldTask } from "@repo/shared/types";
import { formatRelativeTime } from "@repo/shared/utils";
import { VibeChip } from "./VibeChip";
import { StatusBadge } from "./StatusBadge";

interface TaskCardProps {
  task: FieldTask;
  onClick?: (task: FieldTask) => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  return (
    <div
      onClick={() => onClick?.(task)}
      style={{
        border: "1px solid #e0e0e0",
        borderRadius: "8px",
        padding: "16px",
        backgroundColor: "#fff",
        cursor: onClick ? "pointer" : "default",
        transition: "box-shadow 0.15s ease",
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          (e.currentTarget as HTMLDivElement).style.boxShadow =
            "0 4px 12px rgba(0,0,0,0.1)";
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "8px",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "16px",
            fontWeight: 600,
            color: "#2d3436",
          }}
        >
          {task.title}
        </h3>
        <VibeChip vibe={task.vibe} />
      </div>

      {task.description && (
        <p
          style={{
            margin: "0 0 12px 0",
            fontSize: "14px",
            color: "#636e72",
            lineHeight: "1.5",
          }}
        >
          {task.description}
        </p>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <StatusBadge status={task.status} />
        <span style={{ fontSize: "12px", color: "#b2bec3" }}>
          {formatRelativeTime(task.updatedAt)}
        </span>
      </div>
    </div>
  );
}
