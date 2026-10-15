import {
    integer,
    jsonb,
    pgTable,
    serial,
} from "drizzle-orm/pg-core";

export const freelanceFaqSchema = pgTable("freelance_faqs", {
    id: serial("id").primaryKey(),
    question: jsonb("question").notNull(),
    answer: jsonb("answer").notNull(),
    order: integer("order").notNull().default(0),
});
