import { t } from "elysia";
import { tResponse, type RequestSchema, type ApiSchema } from "#src/utils/schema.util.js";

/**
 * Nullable, bukan Optional: mapProfile() selalu mengembalikan tiap key
 * (nilainya `null` kalau belum diisi), jadi field-nya memang selalu
 * ada di response — cuma isinya yang bisa null. `socials` juga selalu
 * ada (default array kosong), makanya bukan Optional juga.
 */
export const profileShape = t.Object({
    name: t.Nullable(t.String()),
    initials: t.Nullable(t.String()),
    url: t.Nullable(t.String()),
    location: t.Nullable(t.String()),
    locationLink: t.Nullable(t.String()),
    description: t.Nullable(t.String()),
    summary: t.Nullable(t.String()),
    avatarUrl: t.Nullable(t.String()),
    cvUrl: t.Nullable(t.String()),
    contact: t.Nullable(t.Object({
        email: t.String(),
        tel: t.String(),
    })),
    socials: t.Array(t.Object({
        id: t.Number(),
        name: t.String(),
        url: t.String(),
        handle: t.String(),
        showInNavbar: t.Boolean(),
    })),
});

// Update itu partial (cuma kirim field yang berubah).
export const profileUpdateShape = t.Partial(profileShape);

export const getProfileApiSchema: ApiSchema = {
    response: {
        200: tResponse(profileShape),
    },
};

export const putProfileRequestSchema: RequestSchema = {
    body: profileUpdateShape,
};

export const putProfileApiSchema: ApiSchema = {
    ...putProfileRequestSchema,
    response: {
        200: tResponse(profileShape),
    },
};
