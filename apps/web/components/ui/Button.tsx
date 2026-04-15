import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const variantStyles = {
  primary: { backgroundColor: "#6c5ce7", color: "#fff", border: "none" },
  secondary: {
    backgroundColor: "transparent",
    color: "#6c5ce7",
    border: "1px solid #6c5ce7",
  },
  danger: { backgroundColor: "#d63031", color: "#fff", border: "none" },
};

const sizeStyles = {
  sm: { padding: "6px 14px", fontSize: "13px" },
  md: { padding: "10px 20px", fontSize: "14px" },
  lg: { padding: "14px 28px", fontSize: "16px" },
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  style,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      style={{
        ...variantStyles[variant],
        ...sizeStyles[size],
        borderRadius: "6px",
        fontWeight: 600,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled || loading ? 0.6 : 1,
        transition: "opacity 0.15s ease",
        ...style,
      }}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}
