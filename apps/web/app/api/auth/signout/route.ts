import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/session";

/**
 * DELETE /api/auth/signout
 * Clears the session cookie. Client should also call firebase.auth().signOut().
 */
export async function DELETE() {
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
