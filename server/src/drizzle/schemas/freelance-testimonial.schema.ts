import {
    integer,
    jsonb,
    pgTable,
    serial,
    varchar,
} from "drizzle-orm/pg-core";

export const freelanceTestimonialSchema = pgTable("freelance_testimonials", {
    id: serial("id").primaryKey(),
    quote: jsonb("quote").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    role: jsonb("role").notNull(),
    order: integer("order").notNull().default(0),
    // "admin" = diinput manual lewat admin, "invite" = dikirim klien lewat link review sekali pakai.
    source: varchar("source", { length: 16 }).notNull().default("admin"),
});
