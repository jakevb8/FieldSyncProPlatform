import type { TaskStatus } from "@repo/shared/types";

const statusStyles: Record<TaskStatus, { bg: string; text: string }> = {
  PENDING: { bg: "#dfe6e9", text: "#2d3436" },
  SYNCING: { bg: "#74b9ff", text: "#fff" },
  COMPLETED: { bg: "#00b894", text: "#fff" },
  CONFLICT: { bg: "#d63031", text: "#fff" },
};

interface StatusBadgeProps {
  status: TaskStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const style = statusStyles[status];
  return (
    <span
      style={{
        backgroundColor: style.bg,
        color: style.text,
        padding: "2px 10px",
        borderRadius: "4px",
        fontSize: "11px",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        display: "inline-block",
      }}
    >
      {status}
    </span>
  );
}
