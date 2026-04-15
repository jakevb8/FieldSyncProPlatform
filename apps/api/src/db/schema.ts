import {
  pgTable,
  text,
  timestamp,
  uuid,
  bigint,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ── Users ─────────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  firebaseUid: text("firebase_uid").notNull().unique(),
  email: text("email").notNull(),
  displayName: text("display_name"),
  photoUrl: text("photo_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ── Field Tasks ───────────────────────────────────────────────────────────────

export const fieldTasks = pgTable("field_tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  status: text("status").notNull().default("PENDING"),
  vibe: text("vibe").notNull().default("Steady"),
  /** Epoch-millis of last client-side sync. Sent from the Android device. */
  lastSynced: bigint("last_synced", { mode: "number" }).notNull().default(0),
  isLocalOnly: boolean("is_local_only").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ── Relations ─────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  tasks: many(fieldTasks),
}));

export const fieldTasksRelations = relations(fieldTasks, ({ one }) => ({
  user: one(users, {
    fields: [fieldTasks.userId],
    references: [users.id],
  }),
}));
