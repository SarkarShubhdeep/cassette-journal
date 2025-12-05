import {
    boolean,
    integer,
    pgTable,
    serial,
    text,
    timestamp,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    // Google OAuth tokens for Calendar sync
    googleRefreshToken: text("google_refresh_token"),
    googleAccessToken: text("google_access_token"),
    googleTokenExpiry: timestamp("google_token_expiry"),
    googleEmail: text("google_email"), // Email of the connected Google account
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const postsTable = pgTable("posts", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    summary: text("summary"),
    shortSummary: text("short_summary"), // One-liner for table view
    userId: integer("user_id")
        .notNull()
        .references(() => usersTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
        .notNull()
        .$onUpdate(() => new Date()),
});

export const tasksTable = pgTable("tasks", {
    id: serial("id").primaryKey(),
    postId: integer("post_id")
        .notNull()
        .references(() => postsTable.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    completed: boolean("completed").notNull().default(false),
    time: text("time"), // Store as ISO string for flexibility
    sortOrder: integer("sort_order").notNull().default(0),
    // Google Calendar sync
    googleEventId: text("google_event_id"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
        .notNull()
        .$onUpdate(() => new Date()),
});

export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;
export type InsertPost = typeof postsTable.$inferInsert;
export type SelectPost = typeof postsTable.$inferSelect;
export type InsertTask = typeof tasksTable.$inferInsert;
export type SelectTask = typeof tasksTable.$inferSelect;
