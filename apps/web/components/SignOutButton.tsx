"use client";

import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/Button";

export default function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await signOut(auth);
    await fetch("/api/auth/signout", { method: "DELETE" });
    router.push("/login");
  }

  return (
    <Button variant="secondary" size="sm" onClick={handleSignOut} style={{ color: "#fff", borderColor: "#fff" }}>
      Sign out
    </Button>
  );
}
