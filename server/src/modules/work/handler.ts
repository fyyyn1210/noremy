import response from '#src/utils/response.util.js';
import service from '#src/modules/work/service.js';
import type { workCreateRequestSchema, workUpdateRequestSchema, workDeleteRequestSchema } from '#src/modules/work/schema.js';
import type { InferContext } from '#src/types/context.type.js';

type CreateCtx = InferContext<typeof workCreateRequestSchema>;
type UpdateCtx = InferContext<typeof workUpdateRequestSchema>;
type DeleteCtx = InferContext<typeof workDeleteRequestSchema>;

class Handler {
    async list(ctx: any) {
        const rows = await service.list();
        return ctx.status("OK", response({ data: rows, message: "WORK_LIST_FETCHED" }));
    }

    async create({ body, status }: CreateCtx) {
        const row = await service.create(body);
        return status("OK", response({ data: row, message: "WORK_CREATED" }));
    }

    async update({ params, body, status }: UpdateCtx) {
        const row = await service.update(Number(params.id), body);
        return status("OK", response({ data: row, message: "WORK_UPDATED" }));
    }

    async remove({ params, status }: DeleteCtx) {
        await service.remove(Number(params.id));
        return status("No Content");
    }
}

export default new Handler();
