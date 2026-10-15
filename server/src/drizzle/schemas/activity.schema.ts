import {
    integer,
    pgTable,
    serial,
    text,
    varchar,
} from "drizzle-orm/pg-core";

export const activitySchema = pgTable("activities", {
    id: serial("id").primaryKey(),
    organization: varchar("organization", { length: 255 }).notNull(),
    role: varchar("role", { length: 255 }).notNull(),
    start: varchar("start", { length: 255 }).notNull(),
    end: varchar("end", { length: 255 }).notNull(),
    logoUrl: varchar("logo_url", { length: 255 }).notNull(),
    description: text("description").notNull(),
    order: integer("order").notNull().default(0),
});
