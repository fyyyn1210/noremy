import {
    integer,
    jsonb,
    pgTable,
    serial,
    varchar,
} from "drizzle-orm/pg-core";

export const freelanceStatSchema = pgTable("freelance_stats", {
    id: serial("id").primaryKey(),
    value: varchar("value", { length: 255 }).notNull(),
    label: jsonb("label").notNull(),
    order: integer("order").notNull().default(0),
});
