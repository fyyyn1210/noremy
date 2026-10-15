import {
    integer,
    pgTable,
    serial,
    varchar,
} from "drizzle-orm/pg-core";

export const educationSchema = pgTable("educations", {
    id: serial("id").primaryKey(),
    school: varchar("school", { length: 255 }).notNull(),
    href: varchar("href", { length: 255 }).notNull(),
    degree: varchar("degree", { length: 255 }).notNull(),
    logoUrl: varchar("logo_url", { length: 255 }).notNull(),
    start: varchar("start", { length: 255 }).notNull(),
    end: varchar("end", { length: 255 }).notNull(),
    order: integer("order").notNull().default(0),
});
