import { cookies } from "next/headers";
import { adminAuth } from "./firebase-admin";

const SESSION_COOKIE_NAME = "fsp_session";
const SESSION_EXPIRES_IN = 60 * 60 * 24 * 5 * 1000; // 5 days in ms

/**
 * Creates a Firebase session cookie from an ID token and sets it as an
 * HttpOnly cookie via Next.js `cookies()`.
 */
export async function createSessionCookie(idToken: string): Promise<void> {
  const sessionCookie = await adminAuth.createSessionCookie(idToken, {
    expiresIn: SESSION_EXPIRES_IN,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_EXPIRES_IN / 1000, // seconds
    path: "/",
  });
}

/**
 * Reads and verifies the session cookie. Returns the decoded token or null.
 */
export async function getSessionUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) return null;

  try {
    return await adminAuth.verifySessionCookie(sessionCookie, true);
  } catch {
    return null;
  }
}

/**
 * Clears the session cookie.
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
