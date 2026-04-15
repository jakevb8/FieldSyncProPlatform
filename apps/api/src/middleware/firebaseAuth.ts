import type { Request, Response, NextFunction } from "express";
import { adminAuth } from "../lib/firebase-admin.js";
import type { DecodedIdToken } from "firebase-admin/auth";

// Extend Express Request so downstream handlers get type-safe user access
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: DecodedIdToken;
      dbUserId?: string;
    }
  }
}

/**
 * requireAuth — validates the Firebase ID token in the Authorization header.
 * Attaches the decoded token to `req.user`.
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res
      .status(401)
      .json({ error: "Missing or malformed Authorization header" });
    return;
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
