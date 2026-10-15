import type { Static } from "elysia";
import type { postSchema } from "#src/drizzle/schemas/index.js";
import type { InferSelectModel } from "drizzle-orm";
import { postShape, postListShape } from "#src/modules/post/schema.js";

export type PostRow = InferSelectModel<typeof postSchema>;
type PostResponse = Static<typeof postShape>;
type PostListResponse = Static<typeof postListShape>;

export function mapPost(row: PostRow): PostResponse {
    return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        publishedAt: row.publishedAt,
        updatedAt: row.updatedAt ?? null,
        author: row.author,
        summary: row.summary,
        image: row.image,
        language: row.language,
        content: row.content,
    };
}

export function mapPostList(row: PostRow): PostListResponse {
    const { content, ...rest } = mapPost(row);
    return rest;
}
