import { pgTable, text, timestamp, varchar, boolean } from "drizzle-orm/pg-core";
import { lifecycleDates } from "./util/lifecycle-dates";

export const users = pgTable("users", {
  userId: varchar("user_id", { length: 128 }).primaryKey(),
  // Supabase user ID
  supabaseId: text("supabase_id").unique(),
  // Add more clerk fields you want to sync here
  email: text("email").notNull(),
  // Enable Row Level Security with Supabase
  enableRls: boolean("enable_rls").default(true),
  ...lifecycleDates,
});

export const posts = pgTable("posts", {
  id: varchar("id", { length: 255 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  userId: varchar("user_id", { length: 128 })
    .notNull()
    .references(() => users.userId),
  ...lifecycleDates,
});
