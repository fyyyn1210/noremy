import response from '#src/utils/response.util.js';
import service from '#src/modules/project/service.js';
import { normalizeLang } from '#src/utils/i18n.util.js';
import type {
    projectCreateRequestSchema,
    projectUpdateRequestSchema,
    projectDeleteRequestSchema,
} from '#src/modules/project/schema.js';
import type { InferContext } from '#src/types/context.type.js';

type CreateCtx = InferContext<typeof projectCreateRequestSchema>;
type UpdateCtx = InferContext<typeof projectUpdateRequestSchema>;
type DeleteCtx = InferContext<typeof projectDeleteRequestSchema>;

class Handler {
    // ---------- Public ----------
    async listPublic(ctx: any) {
        const data = await service.listPublic(normalizeLang(ctx.query?.lang), ctx.query?.kind);
        return ctx.status("OK", response({ data, message: "PROJECT_LIST_FETCHED" }));
    }

    async getPublic(ctx: any) {
        const data = await service.getBySlugPublic(ctx.params.slug, normalizeLang(ctx.query?.lang));
        return ctx.status("OK", response({ data, message: "PROJECT_FETCHED" }));
    }

    // ---------- Admin ----------
    async listAdmin(ctx: any) {
        const data = await service.listAdmin(ctx.query?.kind);
        return ctx.status("OK", response({ data, message: "PROJECT_LIST_FETCHED" }));
    }

    async getAdmin(ctx: any) {
        const data = await service.getBySlugAdmin(ctx.params.slug);
        return ctx.status("OK", response({ data, message: "PROJECT_FETCHED" }));
    }

    async create({ body, status }: CreateCtx) {
        const data = await service.create(body);
        return status("OK", response({ data, message: "PROJECT_CREATED" }));
    }

    async update({ params, body, status }: UpdateCtx) {
        const data = await service.update(params.slug, body);
        return status("OK", response({ data, message: "PROJECT_UPDATED" }));
    }

    async remove({ params, status }: DeleteCtx) {
        await service.remove(params.slug);
        return status("No Content");
    }
}

export default new Handler();
