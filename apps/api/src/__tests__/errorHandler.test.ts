/**
 * Unit tests for errorHandler middleware.
 */

import type { Request, Response, NextFunction } from "express";
import { errorHandler } from "../middleware/errorHandler.js";

function makeRes() {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res;
}

describe("errorHandler middleware", () => {
  const req = {} as Request;
  const next = jest.fn() as unknown as NextFunction;

  it("uses statusCode from error when present", () => {
    const err = Object.assign(new Error("Not found"), { statusCode: 404 });
    const res = makeRes();

    errorHandler(err, req, res as unknown as Response, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Not found" })
    );
  });

  it("defaults to 500 when no statusCode is set (non-production)", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "test";
    const err = new Error("Something went wrong");
    const res = makeRes();

    errorHandler(err, req, res as unknown as Response, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Something went wrong" })
    );
    process.env.NODE_ENV = originalEnv ?? "test";
  });

  it("handles non-Error thrown values gracefully", () => {
    const err = "a plain string error";
    const res = makeRes();

    errorHandler(err as unknown as Error, req, res as unknown as Response, next);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
