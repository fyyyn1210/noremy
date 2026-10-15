import response from '#src/utils/response.util.js';
import service from '#src/modules/certificate/service.js';
import type {
    certificateCreateRequestSchema,
    certificateUpdateRequestSchema,
    certificateDeleteRequestSchema,
} from '#src/modules/certificate/schema.js';
import type { InferContext } from '#src/types/context.type.js';

type CreateCtx = InferContext<typeof certificateCreateRequestSchema>;
type UpdateCtx = InferContext<typeof certificateUpdateRequestSchema>;
type DeleteCtx = InferContext<typeof certificateDeleteRequestSchema>;

class Handler {
    async list(ctx: any) {
        const rows = await service.list();
        return ctx.status("OK", response({ data: rows, message: "CERTIFICATE_LIST_FETCHED" }));
    }

    async create({ body, status }: CreateCtx) {
        const row = await service.create(body);
        return status("OK", response({ data: row, message: "CERTIFICATE_CREATED" }));
    }

    async update({ params, body, status }: UpdateCtx) {
        const row = await service.update(Number(params.id), body);
        return status("OK", response({ data: row, message: "CERTIFICATE_UPDATED" }));
    }

    async remove({ params, status }: DeleteCtx) {
        await service.remove(Number(params.id));
        return status("No Content");
    }
}

export default new Handler();
