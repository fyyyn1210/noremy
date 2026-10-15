import {
    integer,
    pgTable,
    serial,
    varchar,
} from "drizzle-orm/pg-core";

export const certificateSchema = pgTable("certificates", {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    issuer: varchar("issuer", { length: 255 }).notNull(),
    href: varchar("href", { length: 255 }).notNull(),
    dates: varchar("dates", { length: 255 }).notNull(),
    logoUrl: varchar("logo_url", { length: 255 }).notNull(),
    order: integer("order").notNull().default(0),
});
