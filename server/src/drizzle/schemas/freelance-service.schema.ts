import {
    boolean,
    integer,
    jsonb,
    pgTable,
    serial,
    varchar,
} from "drizzle-orm/pg-core";

export const freelanceServiceSchema = pgTable("freelance_services", {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    name: jsonb("name").notNull(),
    tagline: jsonb("tagline").notNull(),
    category: varchar("category", { length: 255 }).notNull(),
    brandBg: varchar("brand_bg", { length: 255 }).notNull(),
    brandChar: varchar("brand_char", { length: 10 }).notNull(),
    brandImg: varchar("brand_img", { length: 255 }),
    order: integer("order").notNull().default(0),
});

export const freelanceServicePackageSchema = pgTable("freelance_service_packages", {
    id: serial("id").primaryKey(),
    serviceId: integer("service_id").references(() => freelanceServiceSchema.id, { onDelete: "cascade" }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    price: varchar("price", { length: 255 }),
    // Harga untuk pengunjung EN (mis. "$150"). Kosong = pakai `price` (Rupiah).
    priceUsd: varchar("price_usd", { length: 255 }),
    description: jsonb("description").notNull(),
    features: jsonb("features").notNull(),
    highlighted: boolean("highlighted").notNull().default(false),
    order: integer("order").notNull().default(0),
});
