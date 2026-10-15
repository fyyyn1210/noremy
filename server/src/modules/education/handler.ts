import response from '#src/utils/response.util.js';
import service from '#src/modules/education/service.js';
import type { educationCreateRequestSchema, educationUpdateRequestSchema, educationDeleteRequestSchema } from '#src/modules/education/schema.js';
import type { InferContext } from '#src/types/context.type.js';

type CreateCtx = InferContext<typeof educationCreateRequestSchema>;
type UpdateCtx = InferContext<typeof educationUpdateRequestSchema>;
type DeleteCtx = InferContext<typeof educationDeleteRequestSchema>;

class Handler {
    async list(ctx: any) {
        const rows = await service.list();
        return ctx.status("OK", response({ data: rows, message: "EDUCATION_LIST_FETCHED" }));
    }

    async create({ body, status }: CreateCtx) {
        const row = await service.create(body);
        return status("OK", response({ data: row, message: "EDUCATION_CREATED" }));
    }

    async update({ params, body, status }: UpdateCtx) {
        const row = await service.update(Number(params.id), body);
        return status("OK", response({ data: row, message: "EDUCATION_UPDATED" }));
    }

    async remove({ params, status }: DeleteCtx) {
        await service.remove(Number(params.id));
        return status("No Content");
    }
}

export default new Handler();
