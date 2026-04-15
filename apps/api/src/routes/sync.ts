import { Router } from "express";
import { requireAuth } from "../middleware/firebaseAuth.js";
import { SyncService } from "../services/syncService.js";
import type { SyncPushRequest } from "@repo/shared/types";

const router = Router();
router.use(requireAuth);

/**
 * POST /v1/sync/push
 * Android client pushes local-only tasks. Server persists them and returns
 * server-assigned IDs so the client can clear isLocalOnly flags.
 */
router.post("/push", async (req, res, next) => {
  try {
    const body = req.body as SyncPushRequest;
    if (!Array.isArray(body?.tasks)) {
      res.status(400).json({ error: "tasks array is required" });
      return;
    }
    const result = await SyncService.push(req.user!.uid, body.tasks);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /v1/sync/pull
 * Returns all tasks for the current user so the Android client can merge.
 */
router.get("/pull", async (req, res, next) => {
  try {
    const tasks = await SyncService.pull(req.user!.uid);
    res.json({ data: tasks, serverTimestamp: Date.now() });
  } catch (err) {
    next(err);
  }
});

export default router;
