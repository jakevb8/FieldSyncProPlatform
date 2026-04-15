import { eq, and } from "drizzle-orm";
import { db } from "../db/client.js";
import { fieldTasks, users } from "../db/schema.js";
import type { FieldTask, CreateTaskRequest, UpdateTaskRequest } from "@repo/shared/types";
import { v4 as uuidv4 } from "uuid";

function toFieldTask(row: typeof fieldTasks.$inferSelect, user: typeof users.$inferSelect): FieldTask {
  return {
    id: row.id,
    userId: user.id,
    title: row.title,
    description: row.description,
    status: row.status as FieldTask["status"],
    vibe: row.vibe as FieldTask["vibe"],
    lastSynced: row.lastSynced,
    isLocalOnly: row.isLocalOnly,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export const TasksService = {
  async getAllForUser(firebaseUid: string): Promise<FieldTask[]> {
    const user = await db.query.users.findFirst({
      where: eq(users.firebaseUid, firebaseUid),
      with: { tasks: true },
    });
    if (!user) return [];
    return user.tasks.map((t) => toFieldTask(t, user));
  },

  async getById(id: string, firebaseUid: string): Promise<FieldTask | null> {
    const user = await db.query.users.findFirst({
      where: eq(users.firebaseUid, firebaseUid),
    });
    if (!user) return null;

    const task = await db.query.fieldTasks.findFirst({
      where: and(eq(fieldTasks.id, id), eq(fieldTasks.userId, user.id)),
    });
    return task ? toFieldTask(task, user) : null;
  },

  async create(firebaseUid: string, req: CreateTaskRequest): Promise<FieldTask> {
    const user = await db.query.users.findFirst({
      where: eq(users.firebaseUid, firebaseUid),
    });
    if (!user) throw Object.assign(new Error("User not found"), { statusCode: 404 });

    const now = new Date();
    const [task] = await db
      .insert(fieldTasks)
      .values({
        id: req.id ?? uuidv4(),
        userId: user.id,
        title: req.title.trim(),
        description: req.description?.trim() ?? "",
        vibe: req.vibe ?? "Steady",
        status: "PENDING",
        lastSynced: Date.now(),
        isLocalOnly: false,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoNothing()
      .returning();

    return toFieldTask(task, user);
  },

  async update(
    id: string,
    firebaseUid: string,
    req: UpdateTaskRequest
  ): Promise<FieldTask | null> {
    const user = await db.query.users.findFirst({
      where: eq(users.firebaseUid, firebaseUid),
    });
    if (!user) return null;

    const [updated] = await db
      .update(fieldTasks)
      .set({
        ...(req.title !== undefined ? { title: req.title.trim() } : {}),
        ...(req.description !== undefined ? { description: req.description.trim() } : {}),
        ...(req.vibe !== undefined ? { vibe: req.vibe } : {}),
        ...(req.status !== undefined ? { status: req.status } : {}),
        updatedAt: new Date(),
      })
      .where(and(eq(fieldTasks.id, id), eq(fieldTasks.userId, user.id)))
      .returning();

    return updated ? toFieldTask(updated, user) : null;
  },

  async delete(id: string, firebaseUid: string): Promise<boolean> {
    const user = await db.query.users.findFirst({
      where: eq(users.firebaseUid, firebaseUid),
    });
    if (!user) return false;

    const [deleted] = await db
      .delete(fieldTasks)
      .where(and(eq(fieldTasks.id, id), eq(fieldTasks.userId, user.id)))
      .returning({ id: fieldTasks.id });

    return !!deleted;
  },
};
