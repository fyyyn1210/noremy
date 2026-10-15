import {
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  varchar,
} from "drizzle-orm/pg-core";

export const workSchema = pgTable("work_experiences", {
  id: serial("id").primaryKey(),
  company: varchar("company", { length: 255 }).notNull(),
  href: varchar("href", { length: 255 }).notNull(),
  badges: jsonb("badges").notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  logoUrl: varchar("logo_url", { length: 255 }).notNull(),
  start: varchar("start", { length: 255 }).notNull(),
  end: varchar("end", { length: 255 }),
  description: text("description").notNull(),
  order: integer("order").notNull().default(0),
});
