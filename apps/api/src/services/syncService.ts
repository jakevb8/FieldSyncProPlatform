import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { fieldTasks, users } from "../db/schema.js";
import { UsersService } from "./usersService.js";
import type { FieldTask } from "@repo/shared/types";
import { v4 as uuidv4 } from "uuid";

export const SyncService = {
  async push(
    firebaseUid: string,
    clientTasks: Array<Omit<FieldTask, "userId" | "createdAt" | "updatedAt">>
  ): Promise<{ synced: number; ids: Record<string, string> }> {
    let user = await UsersService.getByFirebaseUid(firebaseUid);
    if (!user) {
      user = await UsersService.getOrCreate(firebaseUid, "", null, null);
    }

    const idMap: Record<string, string> = {};
    const now = new Date();

    for (const clientTask of clientTasks) {
      const serverId = clientTask.id ?? uuidv4();
      await db
        .insert(fieldTasks)
        .values({
          id: serverId,
          userId: user.id,
          title: clientTask.title,
          description: clientTask.description,
          status: "PENDING",
          vibe: clientTask.vibe,
          lastSynced: Date.now(),
          isLocalOnly: false,
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: fieldTasks.id,
          set: {
            title: clientTask.title,
            description: clientTask.description,
            vibe: clientTask.vibe,
            status: clientTask.status,
            isLocalOnly: false,
            updatedAt: now,
          },
        });
      idMap[clientTask.id] = serverId;
    }

    return { synced: clientTasks.length, ids: idMap };
  },

  async pull(firebaseUid: string): Promise<FieldTask[]> {
    const user = await UsersService.getByFirebaseUid(firebaseUid);
    if (!user) return [];

    const rows = await db
      .select()
      .from(fieldTasks)
      .where(eq(fieldTasks.userId, user.id));

    return rows.map((row) => ({
      id: row.id,
      userId: user.id,
      title: row.title,
      description: row.description,
      status: row.status as FieldTask["status"],
      vibe: row.vibe as FieldTask["vibe"],
      lastSynced: row.lastSynced,
      isLocalOnly: false,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    }));
  },
};
