import {
    pgTable,
    serial,
    text,
    varchar,
} from "drizzle-orm/pg-core";

export const postSchema = pgTable("posts", {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    title: varchar("title", { length: 255 }).notNull(),
    publishedAt: varchar("published_at", { length: 255 }).notNull(),
    updatedAt: varchar("updated_at", { length: 255 }),
    author: varchar("author", { length: 255 }).notNull(),
    summary: text("summary").notNull(),
    image: varchar("image", { length: 255 }).notNull(),
    language: varchar("language", { length: 10 }).notNull(),
    content: text("content").notNull(),
});
