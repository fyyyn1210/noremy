import response from '#src/utils/response.util.js';
import service from '#src/modules/activity/service.js';
import type {
    activityCreateRequestSchema,
    activityUpdateRequestSchema,
    activityDeleteRequestSchema,
} from '#src/modules/activity/schema.js';
import type { InferContext } from '#src/types/context.type.js';

type CreateCtx = InferContext<typeof activityCreateRequestSchema>;
type UpdateCtx = InferContext<typeof activityUpdateRequestSchema>;
type DeleteCtx = InferContext<typeof activityDeleteRequestSchema>;

class Handler {
    async list(ctx: any) {
        const rows = await service.list();
        return ctx.status("OK", response({ data: rows, message: "ACTIVITY_LIST_FETCHED" }));
    }

    async create({ body, status }: CreateCtx) {
        const row = await service.create(body);
        return status("OK", response({ data: row, message: "ACTIVITY_CREATED" }));
    }

    async update({ params, body, status }: UpdateCtx) {
        const row = await service.update(Number(params.id), body);
        return status("OK", response({ data: row, message: "ACTIVITY_UPDATED" }));
    }

    async remove({ params, status }: DeleteCtx) {
        await service.remove(Number(params.id));
        return status("No Content");
    }
}

export default new Handler();
