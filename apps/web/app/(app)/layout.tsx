import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import type { ReactNode } from "react";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top nav */}
      <header
        style={{
          backgroundColor: "#6c5ce7",
          color: "#fff",
          padding: "0 24px",
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      >
        <span style={{ fontWeight: 700, fontSize: "18px" }}>FieldSync Pro</span>
        <SignOutButton />
      </header>

      {/* Page content */}
      <main
        style={{
          flex: 1,
          padding: "32px 24px",
          maxWidth: "800px",
          margin: "0 auto",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {children}
      </main>
    </div>
  );
}

// Tiny client component just for the sign-out button
import SignOutButton from "@/components/SignOutButton";
