import { Router } from "express";
import { requireAuth } from "../middleware/firebaseAuth.js";
import { TasksService } from "../services/tasksService.js";
import { validateCreateTaskRequest } from "@repo/shared/utils";
import type { UpdateTaskRequest } from "@repo/shared/types";

const router = Router();
router.use(requireAuth);

// GET /v1/tasks
router.get("/", async (req, res, next) => {
  try {
    const tasks = await TasksService.getAllForUser(req.user!.uid);
    res.json({ data: tasks });
  } catch (err) {
    next(err);
  }
});

// GET /v1/tasks/:id
router.get("/:id", async (req, res, next) => {
  try {
    const task = await TasksService.getById(req.params.id, req.user!.uid);
    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }
    res.json({ data: task });
  } catch (err) {
    next(err);
  }
});

// POST /v1/tasks
router.post("/", async (req, res, next) => {
  try {
    const { valid, errors } = validateCreateTaskRequest(req.body);
    if (!valid) {
      res.status(400).json({ error: "Validation failed", details: errors });
      return;
    }
    const task = await TasksService.create(req.user!.uid, req.body);
    res.status(201).json({ data: task });
  } catch (err) {
    next(err);
  }
});

// PATCH /v1/tasks/:id
router.patch("/:id", async (req, res, next) => {
  try {
    const body = req.body as UpdateTaskRequest;
    const task = await TasksService.update(req.params.id, req.user!.uid, body);
    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }
    res.json({ data: task });
  } catch (err) {
    next(err);
  }
});

// DELETE /v1/tasks/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const deleted = await TasksService.delete(req.params.id, req.user!.uid);
    if (!deleted) {
      res.status(404).json({ error: "Task not found" });
      return;
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
