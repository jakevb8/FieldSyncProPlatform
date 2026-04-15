import { Router } from "express";
import tasksRouter from "./tasks.js";
import usersRouter from "./users.js";
import syncRouter from "./sync.js";

const router = Router();

router.use("/tasks", tasksRouter);
router.use("/users", usersRouter);
router.use("/sync", syncRouter);

export default router;
