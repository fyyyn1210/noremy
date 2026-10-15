import { t } from "elysia";
import { tResponse, type RequestSchema, type ApiSchema } from "#src/utils/schema.util.js";

export const postShape = t.Object({
    id: t.Number(),
    slug: t.String(),
    title: t.String(),
    publishedAt: t.String(),
    updatedAt: t.Nullable(t.String()),
    author: t.String(),
    summary: t.String(),
    image: t.String(),
    language: t.String(),
    content: t.String(),
});

export const postListShape = t.Omit(postShape, ["content"]);

export const postBodyShape = t.Object({
    slug: t.String(),
    title: t.String(),
    publishedAt: t.String(),
    author: t.String(),
    summary: t.String(),
    image: t.String(),
    language: t.String(),
    content: t.String(),
});

// Update post cuma boleh ubah subset field ini (bukan Partial dari
// postBodyShape penuh — slug/publishedAt/author/dst sengaja nggak bisa diubah).
export const postUpdateBodyShape = t.Partial(t.Object({
    title: t.String(),
    updatedAt: t.String(),
    content: t.String(),
}));

export const postListApiSchema: ApiSchema = {
    query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
        lang: t.Optional(t.String()),
    }),
    response: {
        200: tResponse(t.Object({
            data: t.Array(postListShape),
            total: t.Number(),
            page: t.Number(),
            limit: t.Number(),
        })),
    },
};

export const postGetApiSchema: ApiSchema = {
    params: t.Object({ slug: t.String() }),
    query: t.Object({ lang: t.Optional(t.String()) }),
    response: { 200: tResponse(postShape) },
};

export const postCreateRequestSchema: RequestSchema = {
    body: postBodyShape,
};

export const postCreateApiSchema: ApiSchema = {
    ...postCreateRequestSchema,
    response: { 200: tResponse(postShape) },
};

export const postUpdateRequestSchema: RequestSchema = {
    params: t.Object({ slug: t.String() }),
    body: postUpdateBodyShape,
};

export const postUpdateApiSchema: ApiSchema = {
    ...postUpdateRequestSchema,
    response: { 200: tResponse(postShape) },
};

export const postDeleteRequestSchema: RequestSchema = {
    params: t.Object({ slug: t.String() }),
};
