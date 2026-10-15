import response from "#src/utils/response.util.js";
import service from "#src/modules/upload/service.js";
import type { uploadCreateUrlRequestSchema } from "#src/modules/upload/schema.js";
import type { InferContext } from "#src/types/context.type.js";

type CreateUrlCtx = InferContext<typeof uploadCreateUrlRequestSchema>;

class Handler {
    async createURL({ body, status }: CreateUrlCtx) {
        const result = await service.createURL(body);
        return status("OK", response({ data: result, message: "SUCCESS_CREATE_URL" }));
    }
}

export default new Handler();
