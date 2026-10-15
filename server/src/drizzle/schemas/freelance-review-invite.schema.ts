import {
    integer,
    pgTable,
    serial,
    timestamp,
    varchar,
} from "drizzle-orm/pg-core";
import { freelanceTestimonialSchema } from "#src/drizzle/schemas/freelance-testimonial.schema.js";

// Link review sekali pakai: admin generate token, klien isi form di
// web-freelance /review/:token, lalu token hangus (usedAt terisi) dan
// hasilnya jadi baris biasa di freelance_testimonials.
export const freelanceReviewInviteSchema = pgTable("freelance_review_invites", {
    id: serial("id").primaryKey(),
    token: varchar("token", { length: 64 }).notNull().unique(),
    // Catatan admin, mis. "Budi — Toko Kopi Senja". Tidak tampil ke publik.
    label: varchar("label", { length: 255 }).notNull().default(""),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    usedAt: timestamp("used_at", { withTimezone: true }),
    testimonialId: integer("testimonial_id").references(() => freelanceTestimonialSchema.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
