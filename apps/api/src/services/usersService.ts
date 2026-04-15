import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { users } from "../db/schema.js";
import type { User } from "@repo/shared/types";

function toUser(row: typeof users.$inferSelect): User {
  return {
    id: row.id,
    firebaseUid: row.firebaseUid,
    email: row.email,
    displayName: row.displayName,
    photoUrl: row.photoUrl,
    createdAt: row.createdAt.toISOString(),
  };
}

export const UsersService = {
  async getOrCreate(
    firebaseUid: string,
    email: string,
    displayName: string | null,
    photoUrl: string | null
  ): Promise<User> {
    const existing = await db.query.users.findFirst({
      where: eq(users.firebaseUid, firebaseUid),
    });
    if (existing) return toUser(existing);

    const now = new Date();
    const [created] = await db
      .insert(users)
      .values({ firebaseUid, email, displayName, photoUrl, createdAt: now, updatedAt: now })
      .returning();

    return toUser(created);
  },

  async getByFirebaseUid(firebaseUid: string): Promise<User | null> {
    const row = await db.query.users.findFirst({
      where: eq(users.firebaseUid, firebaseUid),
    });
    return row ? toUser(row) : null;
  },
};
