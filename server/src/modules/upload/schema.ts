import { t } from "elysia";
import { ALLOWED_CONTENT_TYPES } from "#src/types/allowed-content.type.js";
import { tResponse, type RequestSchema, type ApiSchema } from "#src/utils/schema.util.js";

export const uploadCreateUrlShape = t.Object({
    success: t.Boolean(),
    url: t.String(),
    key: t.String(),
});

export const uploadCreateUrlBodyShape = t.Object({
    filenameWithExtension: t.String({ minLength: 1, error: "REQUIRED" }),
    contentType: t.UnionEnum(ALLOWED_CONTENT_TYPES, { error: "INVALID_CONTENT_TYPE" }),
});

export const uploadCreateUrlRequestSchema: RequestSchema = {
    body: uploadCreateUrlBodyShape,
};

export const uploadCreateUrlApiSchema: ApiSchema = {
    ...uploadCreateUrlRequestSchema,
    response: { 200: tResponse(uploadCreateUrlShape) },
};
