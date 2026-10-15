import {
    boolean,
    integer,
    jsonb,
    pgTable,
    serial,
    varchar,
} from "drizzle-orm/pg-core";

/**
 * Satu tabel gabungan buat project portofolio & portofolio-freelance —
 * dulu dua tabel terpisah (`projects` single-language, `freelance_works`
 * dwibahasa). Dibedakan bukan dari tabel, tapi dari `visibility`
 * (array — bisa tampil di "portfolio", "freelance", keduanya, atau
 * disembunyikan dari dua-duanya).
 *
 * Field dwibahasa (title/description/content) disimpan JSONB {en,id} —
 * pola yang sama dengan modul freelance yang lain (lihat i18n.util.ts).
 * `description` = ringkasan singkat (dulu freelance.overview), `content`
 * = isi panjang buat halaman detail (dulu freelance.description).
 *
 * `category`/`scope`/`gradient`/`brandBg`/`brandChar` tadinya field khas
 * freelance (styling card + taksonomi) — sekarang jadi kolom opsional di
 * sini, cuma dipakai kalau `visibility` termasuk "freelance".
 */
export const projectSchema = pgTable("projects", {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    title: jsonb("title").notNull(), // {en,id}
    href: varchar("href", { length: 255 }).notNull(),
    dates: varchar("dates", { length: 255 }).notNull(),
    active: boolean("active").notNull(),
    description: jsonb("description").notNull(), // {en,id} — ringkasan singkat
    content: jsonb("content").notNull(), // {en,id} — isi panjang halaman detail
    technologies: jsonb("technologies").notNull(), // string[] (plain, dulu jg dipakai sbg "tags" freelance)
    scope: jsonb("scope").notNull().default([]), // string[] (plain) — cakupan layanan, khas freelance
    image: varchar("image", { length: 255 }).notNull(),
    kind: varchar("kind", { length: 255 }).notNull(),
    category: varchar("category", { length: 255 }), // taksonomi, khas freelance
    company: varchar("company", { length: 255 }), // dulu juga "client" di freelance
    role: varchar("role", { length: 255 }),
    logoUrl: varchar("logo_url", { length: 255 }),
    gradient: varchar("gradient", { length: 255 }), // styling card, khas freelance
    brandBg: varchar("brand_bg", { length: 255 }), // styling card, khas freelance
    brandChar: varchar("brand_char", { length: 10 }), // styling card, khas freelance
    // Subset dari "portfolio" | "freelance". Default ["portfolio"] biar
    // baris lama otomatis tetap tampil persis seperti sebelum perubahan ini.
    visibility: jsonb("visibility").notNull().default(["portfolio"]),
    order: integer("order").notNull().default(0),
    showInCv: boolean("show_in_cv").notNull().default(false),
});

export const projectLinkSchema = pgTable("project_links", {
    id: serial("id").primaryKey(),
    projectId: integer("project_id").references(() => projectSchema.id, { onDelete: "cascade" }).notNull(),
    type: varchar("type", { length: 255 }).notNull(),
    href: varchar("href", { length: 255 }).notNull(),
});
