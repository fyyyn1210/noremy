import client from "#src/configs/database.config.js";
import { and, asc, desc, eq, gt, isNull, or } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import { fault } from "#src/utils/response.util.js";
import { finalizeUploadField } from "#src/utils/upload.util.js";
import settingsUtil from "#src/utils/settings.util.js";
import type { Lang } from "#src/utils/i18n.util.js";
import type { Static } from "elysia";
import {
    freelanceServiceSchema,
    freelanceServicePackageSchema,
    freelanceTestimonialSchema,
    freelanceStatSchema,
    freelanceFaqSchema,
    freelanceReviewInviteSchema,
} from "#src/drizzle/schemas/index.js";
import { projectSchema } from "#src/drizzle/schemas/index.js";
import { projectVisibility } from "#src/modules/project/map.js";
import {
    mapServicePublic,
    mapServiceAdmin,
    mapServicePackageAdmin,
    mapTestimonialPublic,
    mapTestimonialAdmin,
    mapReviewInviteAdmin,
    reviewInviteStatus,
    mapStatPublic,
    mapStatAdmin,
    mapFaqPublic,
    mapFaqAdmin,
    mapWorkPublic,
    buildComparison,
    type ServicePackageRow,
} from "#src/modules/freelance/map.js";
import type {
    heroUpdateShape,
    contactUpdateShape,
    serviceBodyShape,
    serviceUpdateBodyShape,
    servicePackageBodyShape,
    servicePackageUpdateBodyShape,
    testimonialBodyShape,
    testimonialUpdateBodyShape,
    reviewInviteCreateShape,
    reviewSubmitShape,
    statBodyShape,
    statUpdateBodyShape,
    faqBodyShape,
    faqUpdateBodyShape,
} from "#src/modules/freelance/schema.js";

// Hero & contact adalah konten singleton — disimpan di tabel `settings`
// generic (persis pola `profile.*`), bukan tabel khusus. Bedanya dengan
// profile: di sini 1 key nyimpen 1 object utuh (bukan 1 key per field),
// karena tiap field hero perlu dua bahasa sekaligus jadi lebih simpel
// digabung jadi satu object per key.
const HERO_KEY = "freelance.hero";
const CONTACT_KEY = "freelance.contact";

const EMPTY_LOCALIZED = { en: "", id: "" };

const DEFAULT_HERO = {
    name: EMPTY_LOCALIZED,
    role: EMPTY_LOCALIZED,
    bioText1: EMPTY_LOCALIZED,
    bioHighlight: EMPTY_LOCALIZED,
    bioText2: EMPTY_LOCALIZED,
    bioText3: EMPTY_LOCALIZED,
};

const DEFAULT_CONTACT = {
    email: "",
    whatsapp: "",
    linkedin: "",
    githubPersonal: "",
    githubOrg: "",
};

const UPLOAD_FOLDER = "freelance";

async function getServicesWithPackages() {
    const services = await client
        .select()
        .from(freelanceServiceSchema)
        .orderBy(asc(freelanceServiceSchema.order), asc(freelanceServiceSchema.id));

    const packages = await client
        .select()
        .from(freelanceServicePackageSchema)
        .orderBy(asc(freelanceServicePackageSchema.order), asc(freelanceServicePackageSchema.id));

    const packagesByService = new Map<number, ServicePackageRow[]>();
    for (const pkg of packages) {
        const list = packagesByService.get(pkg.serviceId) ?? [];
        list.push(pkg);
        packagesByService.set(pkg.serviceId, list);
    }

    return { services, packagesByService };
}

class FreelanceService {
    // ---------- Hero ----------
    async getHero(): Promise<typeof DEFAULT_HERO> {
        const hero = await settingsUtil.get(HERO_KEY, DEFAULT_HERO);
        return (hero ?? DEFAULT_HERO) as typeof DEFAULT_HERO;
    }

    async getHeroPublic(lang: Lang) {
        const hero = await this.getHero();
        return {
            name: hero.name[lang] ?? hero.name.en,
            role: hero.role[lang] ?? hero.role.en,
            bioText1: hero.bioText1[lang] ?? hero.bioText1.en,
            bioHighlight: hero.bioHighlight[lang] ?? hero.bioHighlight.en,
            bioText2: hero.bioText2[lang] ?? hero.bioText2.en,
            bioText3: hero.bioText3[lang] ?? hero.bioText3.en,
        };
    }

    async updateHero(payload: Static<typeof heroUpdateShape>) {
        const current = await this.getHero();
        const merged = { ...current, ...payload };
        await settingsUtil.set(HERO_KEY, merged);
        return merged;
    }

    // ---------- Contact ----------
    async getContact(): Promise<typeof DEFAULT_CONTACT> {
        const contact = await settingsUtil.get(CONTACT_KEY, DEFAULT_CONTACT);
        return (contact ?? DEFAULT_CONTACT) as typeof DEFAULT_CONTACT;
    }

    async updateContact(payload: Static<typeof contactUpdateShape>) {
        const current = await this.getContact();
        const merged = { ...current, ...payload };
        await settingsUtil.set(CONTACT_KEY, merged);
        return merged;
    }

    // ---------- Services ----------
    async listServicesPublic(lang: Lang) {
        const { services, packagesByService } = await getServicesWithPackages();
        return services.map((s) => mapServicePublic(s, packagesByService.get(s.id) ?? [], lang));
    }

    async listServicesAdmin() {
        const { services, packagesByService } = await getServicesWithPackages();
        return services.map((s) => mapServiceAdmin(s, packagesByService.get(s.id) ?? []));
    }

    private async findServiceBySlugOrFail(slug: string) {
        const [service] = await client
            .select()
            .from(freelanceServiceSchema)
            .where(eq(freelanceServiceSchema.slug, slug));
        if (!service) throw fault({ code: 404, message: "NOT_FOUND", cause: "Service not found" });
        return service;
    }

    async getServicePublic(slug: string, lang: Lang) {
        const service = await this.findServiceBySlugOrFail(slug);
        const packages = await client
            .select()
            .from(freelanceServicePackageSchema)
            .where(eq(freelanceServicePackageSchema.serviceId, service.id));
        return mapServicePublic(service, packages, lang);
    }

    async createService(data: Static<typeof serviceBodyShape>) {
        const brandImg = await finalizeUploadField({ newValue: data.brandImg, targetFolder: UPLOAD_FOLDER });

        const [result] = await client
            .insert(freelanceServiceSchema)
            .values({ ...data, brandImg: brandImg ?? null, order: data.order ?? 0 })
            .returning();
        return mapServiceAdmin(result, []);
    }

    async updateService(slug: string, data: Static<typeof serviceUpdateBodyShape>) {
        const current = await this.findServiceBySlugOrFail(slug);
        const brandImg = await finalizeUploadField({ newValue: data.brandImg, oldValue: current.brandImg, targetFolder: UPLOAD_FOLDER });

        const [result] = await client
            .update(freelanceServiceSchema)
            .set({ ...data, ...(brandImg !== undefined ? { brandImg } : {}) })
            .where(eq(freelanceServiceSchema.slug, slug))
            .returning();
        if (!result) throw fault({ code: 404, message: "NOT_FOUND", cause: "Service not found" });

        const packages = await client
            .select()
            .from(freelanceServicePackageSchema)
            .where(eq(freelanceServicePackageSchema.serviceId, result.id));
        return mapServiceAdmin(result, packages);
    }

    async removeService(slug: string) {
        const [result] = await client
            .delete(freelanceServiceSchema)
            .where(eq(freelanceServiceSchema.slug, slug))
            .returning();
        if (!result) throw fault({ code: 404, message: "NOT_FOUND", cause: "Service not found" });
        return mapServiceAdmin(result, []);
    }

    // ---------- Service packages ----------
    async createPackage(slug: string, data: Static<typeof servicePackageBodyShape>) {
        const service = await this.findServiceBySlugOrFail(slug);
        const [result] = await client
            .insert(freelanceServicePackageSchema)
            .values({
                ...data,
                serviceId: service.id,
                highlighted: data.highlighted ?? false,
                order: data.order ?? 0,
            })
            .returning();
        return mapServicePackageAdmin(result);
    }

    async updatePackage(packageId: number, data: Static<typeof servicePackageUpdateBodyShape>) {
        const [result] = await client
            .update(freelanceServicePackageSchema)
            .set(data)
            .where(eq(freelanceServicePackageSchema.id, packageId))
            .returning();
        if (!result) throw fault({ code: 404, message: "NOT_FOUND", cause: "Package not found" });
        return mapServicePackageAdmin(result);
    }

    async removePackage(packageId: number) {
        const [result] = await client
            .delete(freelanceServicePackageSchema)
            .where(eq(freelanceServicePackageSchema.id, packageId))
            .returning();
        if (!result) throw fault({ code: 404, message: "NOT_FOUND", cause: "Package not found" });
        return mapServicePackageAdmin(result);
    }

    // ---------- Comparison (auto-generate dari services + packages) ----------
    async getComparison(lang: Lang) {
        const { services, packagesByService } = await getServicesWithPackages();
        return buildComparison(services, packagesByService, lang);
    }

    // ---------- Testimonials ----------
    async listTestimonialsPublic(lang: Lang) {
        const rows = await client
            .select()
            .from(freelanceTestimonialSchema)
            .orderBy(asc(freelanceTestimonialSchema.order), asc(freelanceTestimonialSchema.id));
        return rows.map((r) => mapTestimonialPublic(r, lang));
    }

    async listTestimonialsAdmin() {
        const rows = await client
            .select()
            .from(freelanceTestimonialSchema)
            .orderBy(asc(freelanceTestimonialSchema.order), asc(freelanceTestimonialSchema.id));
        return rows.map(mapTestimonialAdmin);
    }

    async createTestimonial(data: Static<typeof testimonialBodyShape>) {
        const [result] = await client
            .insert(freelanceTestimonialSchema)
            .values({ ...data, order: data.order ?? 0 })
            .returning();
        return mapTestimonialAdmin(result);
    }

    async updateTestimonial(id: number, data: Static<typeof testimonialUpdateBodyShape>) {
        const [result] = await client
            .update(freelanceTestimonialSchema)
            .set(data)
            .where(eq(freelanceTestimonialSchema.id, id))
            .returning();
        if (!result) throw fault({ code: 404, message: "NOT_FOUND", cause: "Testimonial not found" });
        return mapTestimonialAdmin(result);
    }

    async removeTestimonial(id: number) {
        const [result] = await client
            .delete(freelanceTestimonialSchema)
            .where(eq(freelanceTestimonialSchema.id, id))
            .returning();
        if (!result) throw fault({ code: 404, message: "NOT_FOUND", cause: "Testimonial not found" });
        return mapTestimonialAdmin(result);
    }

    // ---------- Review invites (link review sekali pakai) ----------
    async listReviewInvites() {
        const rows = await client
            .select()
            .from(freelanceReviewInviteSchema)
            .orderBy(desc(freelanceReviewInviteSchema.createdAt));
        return rows.map(mapReviewInviteAdmin);
    }

    async createReviewInvite(data: Static<typeof reviewInviteCreateShape>) {
        const expiresAt = data.expiresInDays
            ? new Date(Date.now() + data.expiresInDays * 24 * 60 * 60 * 1000)
            : null;
        const [result] = await client
            .insert(freelanceReviewInviteSchema)
            // 24 byte acak → 32 karakter base64url, tidak bisa ditebak.
            .values({ token: randomBytes(24).toString("base64url"), label: data.label ?? "", expiresAt })
            .returning();
        return mapReviewInviteAdmin(result);
    }

    async removeReviewInvite(id: number) {
        const [result] = await client
            .delete(freelanceReviewInviteSchema)
            .where(eq(freelanceReviewInviteSchema.id, id))
            .returning();
        if (!result) throw fault({ code: 404, message: "NOT_FOUND", cause: "Review invite not found" });
    }

    // Dipakai halaman form untuk tahu link masih bisa dipakai atau tidak.
    async getReviewInvitePublic(token: string) {
        const [row] = await client
            .select()
            .from(freelanceReviewInviteSchema)
            .where(eq(freelanceReviewInviteSchema.token, token));
        if (!row) throw fault({ code: 404, message: "REVIEW_INVITE_NOT_FOUND" });
        return { status: reviewInviteStatus(row) };
    }

    async submitReview(token: string, data: Static<typeof reviewSubmitShape>) {
        return client.transaction(async (tx) => {
            // Klaim token secara atomik: hanya satu request yang bisa mengisi
            // usedAt, jadi submit ganda/bersamaan tidak membuat dua review.
            const now = new Date();
            const [invite] = await tx
                .update(freelanceReviewInviteSchema)
                .set({ usedAt: now })
                .where(
                    and(
                        eq(freelanceReviewInviteSchema.token, token),
                        isNull(freelanceReviewInviteSchema.usedAt),
                        or(isNull(freelanceReviewInviteSchema.expiresAt), gt(freelanceReviewInviteSchema.expiresAt, now)),
                    ),
                )
                .returning();
            if (!invite) throw fault({ code: 410, message: "REVIEW_INVITE_INVALID", cause: "Link already used, expired, or not found" });

            const name = data.name.trim();
            const role = data.role.trim();
            const quote = data.quote.trim();
            const [testimonial] = await tx
                .insert(freelanceTestimonialSchema)
                .values({ name, role: { en: role, id: role }, quote: { en: quote, id: quote }, source: "invite" })
                .returning();

            await tx
                .update(freelanceReviewInviteSchema)
                .set({ testimonialId: testimonial.id })
                .where(eq(freelanceReviewInviteSchema.id, invite.id));

            return { id: testimonial.id };
        });
    }

    // ---------- Stats ----------
    async listStatsPublic(lang: Lang) {
        const rows = await client
            .select()
            .from(freelanceStatSchema)
            .orderBy(asc(freelanceStatSchema.order), asc(freelanceStatSchema.id));
        return rows.map((r) => mapStatPublic(r, lang));
    }

    async listStatsAdmin() {
        const rows = await client
            .select()
            .from(freelanceStatSchema)
            .orderBy(asc(freelanceStatSchema.order), asc(freelanceStatSchema.id));
        return rows.map(mapStatAdmin);
    }

    async createStat(data: Static<typeof statBodyShape>) {
        const [result] = await client
            .insert(freelanceStatSchema)
            .values({ ...data, order: data.order ?? 0 })
            .returning();
        return mapStatAdmin(result);
    }

    async updateStat(id: number, data: Static<typeof statUpdateBodyShape>) {
        const [result] = await client
            .update(freelanceStatSchema)
            .set(data)
            .where(eq(freelanceStatSchema.id, id))
            .returning();
        if (!result) throw fault({ code: 404, message: "NOT_FOUND", cause: "Stat not found" });
        return mapStatAdmin(result);
    }

    async removeStat(id: number) {
        const [result] = await client
            .delete(freelanceStatSchema)
            .where(eq(freelanceStatSchema.id, id))
            .returning();
        if (!result) throw fault({ code: 404, message: "NOT_FOUND", cause: "Stat not found" });
        return mapStatAdmin(result);
    }

    // ---------- FAQs ----------
    async listFaqsPublic(lang: Lang) {
        const rows = await client
            .select()
            .from(freelanceFaqSchema)
            .orderBy(asc(freelanceFaqSchema.order), asc(freelanceFaqSchema.id));
        return rows.map((r) => mapFaqPublic(r, lang));
    }

    async listFaqsAdmin() {
        const rows = await client
            .select()
            .from(freelanceFaqSchema)
            .orderBy(asc(freelanceFaqSchema.order), asc(freelanceFaqSchema.id));
        return rows.map(mapFaqAdmin);
    }

    async createFaq(data: Static<typeof faqBodyShape>) {
        const [result] = await client
            .insert(freelanceFaqSchema)
            .values({ ...data, order: data.order ?? 0 })
            .returning();
        return mapFaqAdmin(result);
    }

    async updateFaq(id: number, data: Static<typeof faqUpdateBodyShape>) {
        const [result] = await client
            .update(freelanceFaqSchema)
            .set(data)
            .where(eq(freelanceFaqSchema.id, id))
            .returning();
        if (!result) throw fault({ code: 404, message: "NOT_FOUND", cause: "FAQ not found" });
        return mapFaqAdmin(result);
    }

    async removeFaq(id: number) {
        const [result] = await client
            .delete(freelanceFaqSchema)
            .where(eq(freelanceFaqSchema.id, id))
            .returning();
        if (!result) throw fault({ code: 404, message: "NOT_FOUND", cause: "FAQ not found" });
        return mapFaqAdmin(result);
    }

    // ---------- Works (baca dari tabel `projects` terunifikasi, difilter
    // visibility mengandung "freelance") ----------
    async listWorksPublic(lang: Lang) {
        const rows = await client
            .select()
            .from(projectSchema)
            .orderBy(asc(projectSchema.order), asc(projectSchema.id));
        return rows
            .filter((r) => projectVisibility(r).includes("freelance"))
            .map((r) => mapWorkPublic(r, lang));
    }

    async getWorkPublic(slug: string, lang: Lang) {
        const [row] = await client.select().from(projectSchema).where(eq(projectSchema.slug, slug));
        if (!row || !projectVisibility(row).includes("freelance")) {
            throw fault({ code: 404, message: "NOT_FOUND", cause: "Work not found" });
        }
        return mapWorkPublic(row, lang);
    }
}

export default new FreelanceService();
