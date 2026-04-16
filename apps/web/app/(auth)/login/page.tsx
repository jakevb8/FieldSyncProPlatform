"use client";

import { useState } from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleGoogleSignIn() {
    setError(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const idToken = await cred.user.getIdToken();
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      if (!res.ok) throw new Error("Session exchange failed");
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          padding: "40px",
          width: "100%",
          maxWidth: "400px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            margin: "0 0 8px 0",
            fontSize: "24px",
            fontWeight: 700,
            color: "#6c5ce7",
          }}
        >
          FieldSync Pro
        </h1>
        <p style={{ margin: "0 0 40px 0", color: "#636e72", fontSize: "14px" }}>
          Sign in to manage your field tasks
        </p>

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

        <Button
          onClick={handleGoogleSignIn}
          loading={loading}
          style={{ width: "100%" }}
        >
          Continue with Google
        </Button>
      </div>
    </div>
  );
}
