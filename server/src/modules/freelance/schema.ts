import { t } from "elysia";
import { tResponse, type RequestSchema, type ApiSchema } from "#src/utils/schema.util.js";

export const localizedShape = t.Object({ en: t.String(), id: t.String() });
export const localizedArrayShape = t.Object({ en: t.Array(t.String()), id: t.Array(t.String()) });

// ---------- Hero ----------
export const heroShape = t.Object({
    name: localizedShape,
    role: localizedShape,
    bioText1: localizedShape,
    bioHighlight: localizedShape,
    bioText2: localizedShape,
    bioText3: localizedShape,
});
export const heroUpdateShape = t.Partial(heroShape);
export const heroUpdateRequestSchema: RequestSchema = { body: heroUpdateShape };

// ---------- Contact ----------
export const contactShape = t.Object({
    email: t.String(),
    whatsapp: t.String(),
    linkedin: t.String(),
    githubPersonal: t.String(),
    githubOrg: t.String(),
});
export const contactUpdateShape = t.Partial(contactShape);
export const contactUpdateRequestSchema: RequestSchema = { body: contactUpdateShape };

// ---------- Services ----------
export const serviceBodyShape = t.Object({
    slug: t.String(),
    name: localizedShape,
    tagline: localizedShape,
    category: t.String(),
    brandBg: t.String(),
    brandChar: t.String(),
    brandImg: t.Optional(t.Nullable(t.String())),
    order: t.Optional(t.Number()),
});
export const serviceUpdateBodyShape = t.Partial(serviceBodyShape);

export const serviceCreateRequestSchema: RequestSchema = { body: serviceBodyShape };
export const serviceUpdateRequestSchema: RequestSchema = {
    params: t.Object({ slug: t.String() }),
    body: serviceUpdateBodyShape,
};
export const serviceDeleteRequestSchema: RequestSchema = {
    params: t.Object({ slug: t.String() }),
};

// ---------- Service packages ----------
export const servicePackageBodyShape = t.Object({
    name: t.String(),
    price: t.Optional(t.Nullable(t.String())),
    priceUsd: t.Optional(t.Nullable(t.String({ maxLength: 255 }))),
    description: localizedShape,
    features: localizedArrayShape,
    highlighted: t.Optional(t.Boolean()),
    order: t.Optional(t.Number()),
});
export const servicePackageUpdateBodyShape = t.Partial(servicePackageBodyShape);

export const packageCreateRequestSchema: RequestSchema = {
    params: t.Object({ slug: t.String() }),
    body: servicePackageBodyShape,
};
export const packageUpdateRequestSchema: RequestSchema = {
    params: t.Object({ packageId: t.String() }),
    body: servicePackageUpdateBodyShape,
};
export const packageDeleteRequestSchema: RequestSchema = {
    params: t.Object({ packageId: t.String() }),
};

// ---------- Testimonials ----------
export const testimonialBodyShape = t.Object({
    quote: localizedShape,
    name: t.String(),
    role: localizedShape,
    order: t.Optional(t.Number()),
});
export const testimonialUpdateBodyShape = t.Partial(testimonialBodyShape);

export const testimonialCreateRequestSchema: RequestSchema = { body: testimonialBodyShape };
export const testimonialUpdateRequestSchema: RequestSchema = {
    params: t.Object({ id: t.String() }),
    body: testimonialUpdateBodyShape,
};
export const testimonialDeleteRequestSchema: RequestSchema = {
    params: t.Object({ id: t.String() }),
};

// ---------- Review invites (link review sekali pakai) ----------
export const reviewInviteCreateShape = t.Object({
    label: t.Optional(t.String({ maxLength: 255 })),
    // Kosong = tidak kedaluwarsa (tetap hangus setelah dipakai sekali).
    expiresInDays: t.Optional(t.Number({ minimum: 1, maximum: 365 })),
});
export const reviewInviteCreateRequestSchema: RequestSchema = { body: reviewInviteCreateShape };
export const reviewInviteDeleteRequestSchema: RequestSchema = {
    params: t.Object({ id: t.String() }),
};

// Form publik: klien isi satu bahasa saja, disimpan ke en & id sekaligus.
export const reviewSubmitShape = t.Object({
    name: t.String({ minLength: 1, maxLength: 100 }),
    role: t.String({ maxLength: 150 }),
    quote: t.String({ minLength: 10, maxLength: 1000 }),
});
export const reviewTokenRequestSchema: RequestSchema = {
    params: t.Object({ token: t.String({ maxLength: 64 }) }),
};
export const reviewSubmitRequestSchema: RequestSchema = {
    params: t.Object({ token: t.String({ maxLength: 64 }) }),
    body: reviewSubmitShape,
};

// ---------- Stats ----------
export const statBodyShape = t.Object({
    value: t.String(),
    label: localizedShape,
    order: t.Optional(t.Number()),
});
export const statUpdateBodyShape = t.Partial(statBodyShape);

export const statCreateRequestSchema: RequestSchema = { body: statBodyShape };
export const statUpdateRequestSchema: RequestSchema = {
    params: t.Object({ id: t.String() }),
    body: statUpdateBodyShape,
};
export const statDeleteRequestSchema: RequestSchema = {
    params: t.Object({ id: t.String() }),
};

// ---------- FAQs ----------
export const faqBodyShape = t.Object({
    question: localizedShape,
    answer: localizedShape,
    order: t.Optional(t.Number()),
});
export const faqUpdateBodyShape = t.Partial(faqBodyShape);

export const faqCreateRequestSchema: RequestSchema = { body: faqBodyShape };
export const faqUpdateRequestSchema: RequestSchema = {
    params: t.Object({ id: t.String() }),
    body: faqUpdateBodyShape,
};
export const faqDeleteRequestSchema: RequestSchema = {
    params: t.Object({ id: t.String() }),
};
