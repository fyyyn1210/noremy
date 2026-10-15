import {
  pgTable,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const settingSchema = pgTable("settings", {
  id   : uuid().primaryKey().defaultRandom(),
  key  : varchar("key", { length: 255 }).notNull().unique(),
  value: text("value").notNull(),
});

export type UserSchemaType = typeof settingSchema;
