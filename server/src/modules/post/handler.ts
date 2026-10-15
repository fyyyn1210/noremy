import response from '#src/utils/response.util.js';
import service from '#src/modules/post/service.js';
import type {
    postCreateRequestSchema,
    postUpdateRequestSchema,
    postDeleteRequestSchema,
} from '#src/modules/post/schema.js';
import type { InferContext } from '#src/types/context.type.js';

type CreateCtx = InferContext<typeof postCreateRequestSchema>;
type UpdateCtx = InferContext<typeof postUpdateRequestSchema>;
type DeleteCtx = InferContext<typeof postDeleteRequestSchema>;

class Handler {
    async list(ctx: any) {
        const page = parseInt(ctx.query?.page || "1", 10);
        const limit = parseInt(ctx.query?.limit || "10", 10);
        const data = await service.list(page, limit, ctx.query?.lang);
        return ctx.status("OK", response({
            data,
            message: "POST_LIST_FETCHED",
        }));
    }

    async get(ctx: any) {
        const data = await service.getBySlug(ctx.params.slug, ctx.query?.lang);
        return ctx.status("OK", response({ data, message: "POST_FETCHED" }));
    }

    async create({ body, status }: CreateCtx) {
        const row = await service.create(body);
        return status("OK", response({ data: row, message: "POST_CREATED" }));
    }

    async update({ params, body, status }: UpdateCtx) {
        const row = await service.update(params.slug, body);
        return status("OK", response({ data: row, message: "POST_UPDATED" }));
    }

    async remove({ params, status }: DeleteCtx) {
        await service.remove(params.slug);
        return status("No Content");
    }
}

export default new Handler();
