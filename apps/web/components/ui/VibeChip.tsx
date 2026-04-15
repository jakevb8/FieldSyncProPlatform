import type { TaskVibe } from "@repo/shared/types";

const vibeStyles: Record<TaskVibe, { bg: string; text: string; label: string }> = {
  Hype: { bg: "#ff4757", text: "#fff", label: "Hype" },
  Steady: { bg: "#ffa502", text: "#fff", label: "Steady" },
  Chill: { bg: "#2ed573", text: "#fff", label: "Chill" },
};

interface VibeChipProps {
  vibe: TaskVibe;
}

export function VibeChip({ vibe }: VibeChipProps) {
  const style = vibeStyles[vibe];
  return (
    <span
      style={{
        backgroundColor: style.bg,
        color: style.text,
        padding: "2px 10px",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: 600,
        letterSpacing: "0.5px",
        display: "inline-block",
      }}
    >
      {style.label}
    </span>
  );
}
