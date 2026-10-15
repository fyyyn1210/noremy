import { postSchema } from "#src/drizzle/schemas/index.js";
import client from "#src/configs/database.config.js";
import { eq, and } from "drizzle-orm";
import { fault } from "#src/utils/response.util.js";
import { finalizeUploadField } from "#src/utils/upload.util.js";
import { mapPost, mapPostList } from "#src/modules/post/map.js";
import type { Static } from "elysia";
import { postBodyShape, postUpdateBodyShape } from "#src/modules/post/schema.js";

type CreatePostInput = Static<typeof postBodyShape>;
type UpdatePostInput = Static<typeof postUpdateBodyShape>;

const UPLOAD_FOLDER = "posts";

class PostService {
    async list(page: number, limit: number, lang?: string) {
        // Implement full pagination if needed. For now returns filtered results.
        let posts = await client.select().from(postSchema);
        if (lang) {
            posts = posts.filter(p => p.language === lang);
        }

        posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

        const total = posts.length;
        const startIndex = (page - 1) * limit;
        const pagedData = posts.slice(startIndex, startIndex + limit);

        return {
            data: pagedData.map(mapPostList),
            total,
            page,
            limit
        };
    }

    async getBySlug(slug: string, lang?: string) {
        let conditions = [eq(postSchema.slug, slug)];
        if (lang) {
            conditions.push(eq(postSchema.language, lang));
        }

        const [post] = await client.select().from(postSchema).where(and(...conditions));
        if (!post) throw fault({ code: 404, message: "NOT_FOUND", cause: "Post not found" });
        return mapPost(post);
    }

    async create(data: CreatePostInput) {
        const image = await finalizeUploadField({ newValue: data.image, targetFolder: UPLOAD_FOLDER });

        const [result] = await client
            .insert(postSchema)
            .values({ ...data, image: image as string })
            .returning();
        return mapPost(result);
    }

    async update(slug: string, data: UpdatePostInput) {
        // Catatan: `image` sengaja nggak ada di postUpdateBodyShape (belum
        // bisa diganti lewat endpoint update ini), jadi nggak perlu
        // finalizeUploadField di sini.
        const [result] = await client
            .update(postSchema)
            .set(data)
            .where(eq(postSchema.slug, slug))
            .returning();

        if (!result) throw fault({ code: 404, message: "NOT_FOUND", cause: "Post not found" });
        return mapPost(result);
    }

    async remove(slug: string) {
        const [result] = await client.delete(postSchema).where(eq(postSchema.slug, slug)).returning();
        if (!result) throw fault({ code: 404, message: "NOT_FOUND", cause: "Post not found" });
        return mapPost(result);
    }
}

export default new PostService();
