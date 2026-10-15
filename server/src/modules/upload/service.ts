import { fault } from "#src/utils/response.util.js";
import { buildPresignedURL } from "#src/utils/upload.util.js";
import type { Static } from "elysia";
import type { uploadCreateUrlBodyShape } from "#src/modules/upload/schema.js";

type CreateUrlInput = Static<typeof uploadCreateUrlBodyShape>;

class Service {
    async createURL({ filenameWithExtension, contentType }: CreateUrlInput): Promise<{ success: boolean; url: string; key: string }> {
        const generate = await buildPresignedURL({
            filename: filenameWithExtension,
            contentType,
        });
        if (generate.success) return generate;

        throw fault({
            code: 400,
            message: generate.message,
            cause: generate.reason,
        });
    }
}

export default new Service();
