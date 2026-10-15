import { t } from "elysia";
import { tResponse, type RequestSchema, type ApiSchema } from "#src/utils/schema.util.js";

export const localizedShape = t.Object({ en: t.String(), id: t.String() });

export const projectLinkShape = t.Object({
    type: t.String(),
    href: t.String(),
});

export const projectVisibilityShape = t.Array(
    t.Union([t.Literal("portfolio"), t.Literal("freelance")])
);

// ---------- Public (lang-resolved) ----------
// mapProjectPublic() selalu isi `links` (default array kosong), jadi di
// response field-nya wajib ada — bukan Optional.
export const projectPublicShape = t.Object({
    id: t.Number(),
    slug: t.String(),
    title: t.String(),
    href: t.String(),
    dates: t.String(),
    active: t.Boolean(),
    description: t.String(),
    technologies: t.Array(t.String()),
    scope: t.Array(t.String()),
    image: t.String(),
    kind: t.Union([t.Literal("project"), t.Literal("package")]),
    content: t.String(),
    category: t.Nullable(t.String()),
    company: t.Nullable(t.String()),
    role: t.Nullable(t.String()),
    logoUrl: t.Nullable(t.String()),
    gradient: t.Nullable(t.String()),
    brandBg: t.Nullable(t.String()),
    brandChar: t.Nullable(t.String()),
    order: t.Number(),
    showInCv: t.Boolean(),
    links: t.Array(projectLinkShape),
});

export const projectPublicListShape = t.Omit(projectPublicShape, ["content"]);

// ---------- Admin (raw {en,id}) ----------
export const projectAdminShape = t.Object({
    id: t.Number(),
    slug: t.String(),
    title: localizedShape,
    href: t.String(),
    dates: t.String(),
    active: t.Boolean(),
    description: localizedShape,
    technologies: t.Array(t.String()),
    scope: t.Array(t.String()),
    image: t.String(),
    kind: t.Union([t.Literal("project"), t.Literal("package")]),
    content: localizedShape,
    category: t.Nullable(t.String()),
    company: t.Nullable(t.String()),
    role: t.Nullable(t.String()),
    logoUrl: t.Nullable(t.String()),
    gradient: t.Nullable(t.String()),
    brandBg: t.Nullable(t.String()),
    brandChar: t.Nullable(t.String()),
    visibility: projectVisibilityShape,
    order: t.Number(),
    showInCv: t.Boolean(),
    links: t.Array(projectLinkShape),
});

export const projectAdminListShape = t.Omit(projectAdminShape, ["content"]);

export const projectBodyShape = t.Object({
    slug: t.String(),
    title: localizedShape,
    href: t.String(),
    dates: t.String(),
    active: t.Boolean(),
    description: localizedShape,
    technologies: t.Array(t.String()),
    scope: t.Optional(t.Array(t.String())),
    image: t.String(),
    kind: t.Union([t.Literal("project"), t.Literal("package")]),
    content: localizedShape,
    category: t.Optional(t.Nullable(t.String())),
    company: t.Optional(t.Nullable(t.String())),
    role: t.Optional(t.Nullable(t.String())),
    logoUrl: t.Optional(t.Nullable(t.String())),
    gradient: t.Optional(t.Nullable(t.String())),
    brandBg: t.Optional(t.Nullable(t.String())),
    brandChar: t.Optional(t.Nullable(t.String())),
    visibility: t.Optional(projectVisibilityShape),
    order: t.Optional(t.Number()),
    showInCv: t.Optional(t.Boolean()),
    links: t.Optional(t.Array(projectLinkShape)),
});

// Update boleh ubah field apa saja kecuali slug (slug immutable — dipakai
// sebagai identifier di URL & referensi eksternal).
export const projectUpdateBodyShape = t.Partial(t.Omit(projectBodyShape, ["slug"]));

export const projectListApiSchema: ApiSchema = {
    query: t.Object({ kind: t.Optional(t.String()), lang: t.Optional(t.String()) }),
    response: { 200: tResponse(t.Array(projectPublicListShape)) },
};

export const projectGetApiSchema: ApiSchema = {
    params: t.Object({ slug: t.String() }),
    query: t.Object({ lang: t.Optional(t.String()) }),
    response: { 200: tResponse(projectPublicShape) },
};

export const projectListAdminApiSchema: ApiSchema = {
    query: t.Object({ kind: t.Optional(t.String()) }),
    response: { 200: tResponse(t.Array(projectAdminListShape)) },
};

export const projectGetAdminApiSchema: ApiSchema = {
    params: t.Object({ slug: t.String() }),
    response: { 200: tResponse(projectAdminShape) },
};

export const projectCreateRequestSchema: RequestSchema = {
    body: projectBodyShape,
};

export const projectCreateApiSchema: ApiSchema = {
    ...projectCreateRequestSchema,
    response: { 200: tResponse(projectAdminShape) },
};

export const projectUpdateRequestSchema: RequestSchema = {
    params: t.Object({ slug: t.String() }),
    body: projectUpdateBodyShape,
};

export const projectUpdateApiSchema: ApiSchema = {
    ...projectUpdateRequestSchema,
    response: { 200: tResponse(projectAdminShape) },
};

export const projectDeleteRequestSchema: RequestSchema = {
    params: t.Object({ slug: t.String() }),
};
