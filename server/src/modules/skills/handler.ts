import response from '#src/utils/response.util.js';
import service from '#src/modules/skills/service.js';
import type {
    categoryCreateRequestSchema,
    categoryUpdateRequestSchema,
    categoryDeleteRequestSchema,
    itemCreateRequestSchema,
    itemUpdateRequestSchema,
    itemDeleteRequestSchema,
} from '#src/modules/skills/schema.js';
import type { InferContext } from '#src/types/context.type.js';

type CatCreateCtx = InferContext<typeof categoryCreateRequestSchema>;
type CatUpdateCtx = InferContext<typeof categoryUpdateRequestSchema>;
type CatDeleteCtx = InferContext<typeof categoryDeleteRequestSchema>;
type ItemCreateCtx = InferContext<typeof itemCreateRequestSchema>;
type ItemUpdateCtx = InferContext<typeof itemUpdateRequestSchema>;
type ItemDeleteCtx = InferContext<typeof itemDeleteRequestSchema>;

class Handler {
    async list(ctx: any) {
        const data = await service.list();
        return ctx.status("OK", response({
            data,
            message: "SKILL_LIST_FETCHED",
        }));
    }

    async createCategory({ body, status }: CatCreateCtx) {
        const data = await service.createCategory(body);
        return status("OK", response({ data, message: "SKILL_CATEGORY_CREATED" }));
    }

    async updateCategory({ params, body, status }: CatUpdateCtx) {
        const data = await service.updateCategory(Number(params.id), body);
        return status("OK", response({ data, message: "SKILL_CATEGORY_UPDATED" }));
    }

    async removeCategory({ params, status }: CatDeleteCtx) {
        await service.removeCategory(Number(params.id));
        return status("No Content");
    }

    async createItem({ params, body, status }: ItemCreateCtx) {
        const data = await service.createItem(Number(params.id), body);
        return status("OK", response({ data, message: "SKILL_ITEM_CREATED" }));
    }

    async updateItem({ params, body, status }: ItemUpdateCtx) {
        const data = await service.updateItem(Number(params.itemId), body);
        return status("OK", response({ data, message: "SKILL_ITEM_UPDATED" }));
    }

    async removeItem({ params, status }: ItemDeleteCtx) {
        await service.removeItem(Number(params.itemId));
        return status("No Content");
    }
}

export default new Handler();
