import {
    integer,
    pgTable,
    serial,
    varchar,
} from "drizzle-orm/pg-core";

export const skillCategorySchema = pgTable("skill_categories", {
    id: serial("id").primaryKey(),
    category: varchar("category", { length: 255 }).notNull(),
    order: integer("order").notNull(),
});

export const skillItemSchema = pgTable("skill_items", {
    id: serial("id").primaryKey(),
    categoryId: integer("category_id").references(() => skillCategorySchema.id, { onDelete: "cascade" }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    iconSlug: varchar("icon_slug", { length: 255 }).notNull(),
});
