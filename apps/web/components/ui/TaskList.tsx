import type { FieldTask } from "@repo/shared/types";
import { TaskCard } from "./TaskCard";

interface TaskListProps {
  tasks: FieldTask[];
  onTaskClick?: (task: FieldTask) => void;
  emptyMessage?: string;
}

export function TaskList({
  tasks,
  onTaskClick,
  emptyMessage = "No tasks yet.",
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "48px 0",
          color: "#b2bec3",
          fontSize: "14px",
        }}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} onClick={onTaskClick} />
      ))}
    </div>
  );
}
