/**
 * Unit tests for firebaseAuth middleware.
 * Firebase Admin is mocked so no real network calls are made.
 */

import type { Request, Response, NextFunction } from "express";

// ── Mock Firebase Admin ────────────────────────────────────────────────────────
const mockVerifyIdToken = jest.fn();

jest.mock("../lib/firebase-admin.js", () => ({
  adminAuth: {
    verifyIdToken: mockVerifyIdToken,
  },
}));

// Import AFTER mocks are set up
import { requireAuth } from "../middleware/firebaseAuth.js";

function makeReq(authHeader?: string): Partial<Request> {
  return {
    headers: authHeader ? { authorization: authHeader } : {},
  };
}

function makeRes(): { status: jest.Mock; json: jest.Mock; statusCode?: number } {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res;
}

describe("requireAuth middleware", () => {
  let next: NextFunction;

  beforeEach(() => {
    next = jest.fn();
    jest.clearAllMocks();
  });

  it("returns 401 when Authorization header is missing", async () => {
    const req = makeReq();
    const res = makeRes();

    await requireAuth(req as Request, res as unknown as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(String) })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when Authorization header does not start with Bearer", async () => {
    const req = makeReq("Basic abc123");
    const res = makeRes();

    await requireAuth(req as Request, res as unknown as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when token is invalid", async () => {
    mockVerifyIdToken.mockRejectedValueOnce(new Error("Token expired"));
    const req = makeReq("Bearer bad_token");
    const res = makeRes();

    await requireAuth(req as Request, res as unknown as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Invalid or expired token" })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("attaches decoded token to req.user and calls next() on success", async () => {
    const decoded = { uid: "user_123", email: "test@example.com" };
    mockVerifyIdToken.mockResolvedValueOnce(decoded);
    const req = makeReq("Bearer valid_token") as Request;
    const res = makeRes();

    await requireAuth(req, res as unknown as Response, next);

    expect(req.user).toEqual(decoded);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
