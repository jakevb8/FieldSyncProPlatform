import { NextResponse } from "next/server";
import { createSessionCookie } from "@/lib/session";

/**
 * POST /api/auth/session
 * Exchange a Firebase ID token for an HttpOnly session cookie.
 * Called from the client immediately after sign-in.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { idToken } = body as { idToken?: string };

    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json(
        { error: "idToken is required" },
        { status: 400 }
      );
    }

    await createSessionCookie(idToken);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[session] Failed to create session cookie:", err);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 401 }
    );
  }
}
