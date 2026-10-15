import type { InferSelectModel } from "drizzle-orm";
import { pickLocalized, pickLocalizedArray, type Lang } from "#src/utils/i18n.util.js";
import type {
    freelanceServiceSchema,
    freelanceServicePackageSchema,
    freelanceTestimonialSchema,
    freelanceStatSchema,
    freelanceFaqSchema,
    freelanceReviewInviteSchema,
} from "#src/drizzle/schemas/index.js";
import type { projectSchema } from "#src/drizzle/schemas/index.js";

export type ServiceRow = InferSelectModel<typeof freelanceServiceSchema>;
export type ServicePackageRow = InferSelectModel<typeof freelanceServicePackageSchema>;
export type TestimonialRow = InferSelectModel<typeof freelanceTestimonialSchema>;
export type StatRow = InferSelectModel<typeof freelanceStatSchema>;
export type FaqRow = InferSelectModel<typeof freelanceFaqSchema>;
export type ReviewInviteRow = InferSelectModel<typeof freelanceReviewInviteSchema>;
export type ProjectRow = InferSelectModel<typeof projectSchema>;

// ---------- Service packages ----------
export function mapServicePackagePublic(row: ServicePackageRow, lang: Lang) {
    return {
        id: row.id,
        name: row.name,
        // EN pakai harga USD kalau diisi; selain itu harga Rupiah.
        price: (lang === "en" && row.priceUsd) || row.price || null,
        description: pickLocalized(row.description, lang),
        features: pickLocalizedArray(row.features, lang),
        highlighted: row.highlighted,
        order: row.order,
    };
}

export function mapServicePackageAdmin(row: ServicePackageRow) {
    return {
        id: row.id,
        serviceId: row.serviceId,
        name: row.name,
        price: row.price ?? null,
        priceUsd: row.priceUsd ?? null,
        description: row.description,
        features: row.features,
        highlighted: row.highlighted,
        order: row.order,
    };
}

// ---------- Services ----------
export function mapServicePublic(row: ServiceRow, packages: ServicePackageRow[], lang: Lang) {
    return {
        id: row.id,
        slug: row.slug,
        name: pickLocalized(row.name, lang),
        tagline: pickLocalized(row.tagline, lang),
        category: row.category,
        brandBg: row.brandBg,
        brandChar: row.brandChar,
        brandImg: row.brandImg ?? null,
        order: row.order,
        packages: [...packages]
            .sort((a, b) => a.order - b.order)
            .map((p) => mapServicePackagePublic(p, lang)),
    };
}

export function mapServiceAdmin(row: ServiceRow, packages: ServicePackageRow[]) {
    return {
        id: row.id,
        slug: row.slug,
        name: row.name,
        tagline: row.tagline,
        category: row.category,
        brandBg: row.brandBg,
        brandChar: row.brandChar,
        brandImg: row.brandImg ?? null,
        order: row.order,
        packages: [...packages].sort((a, b) => a.order - b.order).map(mapServicePackageAdmin),
    };
}

// ---------- Testimonials ----------
export function mapTestimonialPublic(row: TestimonialRow, lang: Lang) {
    return {
        id: row.id,
        quote: pickLocalized(row.quote, lang),
        name: row.name,
        role: pickLocalized(row.role, lang),
        order: row.order,
    };
}

export function mapTestimonialAdmin(row: TestimonialRow) {
    return { id: row.id, quote: row.quote, name: row.name, role: row.role, order: row.order, source: row.source };
}

// ---------- Review invites ----------
export function reviewInviteStatus(row: ReviewInviteRow, now = new Date()) {
    if (row.usedAt) return "used" as const;
    if (row.expiresAt && row.expiresAt <= now) return "expired" as const;
    return "active" as const;
}

export function mapReviewInviteAdmin(row: ReviewInviteRow) {
    return {
        id: row.id,
        token: row.token,
        label: row.label,
        status: reviewInviteStatus(row),
        expiresAt: row.expiresAt,
        usedAt: row.usedAt,
        testimonialId: row.testimonialId,
        createdAt: row.createdAt,
    };
}

// ---------- Stats ----------
export function mapStatPublic(row: StatRow, lang: Lang) {
    return { id: row.id, value: row.value, label: pickLocalized(row.label, lang), order: row.order };
}

export function mapStatAdmin(row: StatRow) {
    return { id: row.id, value: row.value, label: row.label, order: row.order };
}

// ---------- FAQs ----------
export function mapFaqPublic(row: FaqRow, lang: Lang) {
    return {
        id: row.id,
        question: pickLocalized(row.question, lang),
        answer: pickLocalized(row.answer, lang),
        order: row.order,
    };
}

export function mapFaqAdmin(row: FaqRow) {
    return { id: row.id, question: row.question, answer: row.answer, order: row.order };
}

// ---------- Works (backed by tabel `projects` terunifikasi, difilter
// visibility mengandung "freelance") ----------
export function mapWorkPublic(row: ProjectRow, lang: Lang) {
    return {
        id: row.id,
        slug: row.slug,
        name: pickLocalized(row.title, lang),
        year: row.dates,
        client: row.company ?? "",
        category: row.category ?? "",
        gradient: row.gradient ?? "",
        tags: (row.technologies as string[]) ?? [],
        image: row.image,
        brandBg: row.brandBg ?? "",
        brandChar: row.brandChar ?? "",
        brandImg: row.logoUrl ?? null,
        overview: pickLocalized(row.description, lang),
        description: pickLocalized(row.content, lang),
        scope: (row.scope as string[]) ?? [],
        discoverUrl: row.href && row.href !== "#" ? row.href : null,
        order: row.order,
    };
}

// ---------- Comparison (derived dari services + packages, tidak disimpan terpisah) ----------
export function buildComparison(
    services: ServiceRow[],
    packagesByService: Map<number, ServicePackageRow[]>,
    lang: Lang
) {
    const orderedServices = [...services].sort((a, b) => a.order - b.order);
    const headers = ["", ...orderedServices.map((s) => pickLocalized(s.name, lang))];

    // Union semua fitur (dari semua package tiap service), urutan kemunculan pertama.
    const featureOrder: string[] = [];
    const featureSet = new Set<string>();

    for (const service of orderedServices) {
        const packages = packagesByService.get(service.id) ?? [];
        for (const pkg of packages) {
            for (const feature of pickLocalizedArray(pkg.features, lang)) {
                if (!featureSet.has(feature)) {
                    featureSet.add(feature);
                    featureOrder.push(feature);
                }
            }
        }
    }

    const rows = featureOrder.map((feature) => ({
        label: feature,
        values: orderedServices.map((service) => {
            const packages = packagesByService.get(service.id) ?? [];
            const has = packages.some((pkg) => pickLocalizedArray(pkg.features, lang).includes(feature));
            return has ? "✓" : "—";
        }),
    }));

    return { headers, rows };
}
