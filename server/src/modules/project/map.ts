import type { Static } from "elysia";
import type { projectSchema, projectLinkSchema } from "#src/drizzle/schemas/index.js";
import type { InferSelectModel } from "drizzle-orm";
import { pickLocalized, toLocalizedRaw, type Lang } from "#src/utils/i18n.util.js";
import {
    projectPublicShape,
    projectPublicListShape,
    projectAdminShape,
    projectAdminListShape,
    projectLinkShape,
} from "#src/modules/project/schema.js";

export type ProjectRow = InferSelectModel<typeof projectSchema>;
export type ProjectLinkRow = InferSelectModel<typeof projectLinkSchema>;

type ProjectPublicResponse = Static<typeof projectPublicShape>;
type ProjectPublicListResponse = Static<typeof projectPublicListShape>;
type ProjectAdminResponse = Static<typeof projectAdminShape>;
type ProjectAdminListResponse = Static<typeof projectAdminListShape>;
type ProjectLinkResponse = Static<typeof projectLinkShape>;

export function mapProjectLink(row: ProjectLinkRow): ProjectLinkResponse {
    return { type: row.type, href: row.href };
}

export function projectVisibility(row: ProjectRow): ("portfolio" | "freelance")[] {
    return ((row.visibility as string[]) ?? ["portfolio"]) as ("portfolio" | "freelance")[];
}

export function mapProjectPublic(row: ProjectRow, links: ProjectLinkRow[], lang: Lang): ProjectPublicResponse {
    return {
        id: row.id,
        slug: row.slug,
        title: pickLocalized(row.title, lang),
        href: row.href,
        dates: row.dates,
        active: row.active,
        description: pickLocalized(row.description, lang),
        technologies: (row.technologies as string[]) ?? [],
        scope: (row.scope as string[]) ?? [],
        image: row.image,
        kind: row.kind as "project" | "package",
        content: pickLocalized(row.content, lang),
        category: row.category ?? null,
        company: row.company ?? null,
        role: row.role ?? null,
        logoUrl: row.logoUrl ?? null,
        gradient: row.gradient ?? null,
        brandBg: row.brandBg ?? null,
        brandChar: row.brandChar ?? null,
        order: row.order,
        showInCv: row.showInCv,
        links: links.map(mapProjectLink),
    };
}

export function mapProjectPublicList(row: ProjectRow, links: ProjectLinkRow[], lang: Lang): ProjectPublicListResponse {
    const { content, ...rest } = mapProjectPublic(row, links, lang);
    return rest;
}

export function mapProjectAdmin(row: ProjectRow, links: ProjectLinkRow[] = []): ProjectAdminResponse {
    return {
        id: row.id,
        slug: row.slug,
        // toLocalizedRaw() jaga-jaga buat row lama yang title/description/
        // content-nya masih string biasa (belum diedit ulang lewat admin
        // sejak migrasi) — tanpa ini form edit bisa kelihatan kosong &
        // menimpa isi asli jadi {en:"",id:""} pas disimpan.
        title: toLocalizedRaw(row.title),
        href: row.href,
        dates: row.dates,
        active: row.active,
        description: toLocalizedRaw(row.description),
        technologies: (row.technologies as string[]) ?? [],
        scope: (row.scope as string[]) ?? [],
        image: row.image,
        kind: row.kind as "project" | "package",
        content: toLocalizedRaw(row.content),
        category: row.category ?? null,
        company: row.company ?? null,
        role: row.role ?? null,
        logoUrl: row.logoUrl ?? null,
        gradient: row.gradient ?? null,
        brandBg: row.brandBg ?? null,
        brandChar: row.brandChar ?? null,
        visibility: projectVisibility(row),
        order: row.order,
        showInCv: row.showInCv,
        links: links.map(mapProjectLink),
    };
}

export function mapProjectAdminList(row: ProjectRow, links: ProjectLinkRow[] = []): ProjectAdminListResponse {
    const { content, ...rest } = mapProjectAdmin(row, links);
    return rest;
}
