import { t } from "elysia";
import { tResponse, type RequestSchema, type ApiSchema } from "#src/utils/schema.util.js";

export const certificateShape = t.Object({
    id: t.Number(),
    title: t.String(),
    issuer: t.String(),
    href: t.String(),
    dates: t.String(),
    logoUrl: t.String(),
    order: t.Number(),
});

export const certificateBodyShape = t.Object({
    title: t.String(),
    issuer: t.String(),
    href: t.String(),
    dates: t.String(),
    logoUrl: t.String(),
    order: t.Optional(t.Number()),
});

export const certificateUpdateBodyShape = t.Partial(certificateBodyShape);

export const certificateListApiSchema: ApiSchema = {
    response: { 200: tResponse(t.Array(certificateShape)) },
};

export const certificateCreateRequestSchema: RequestSchema = {
    body: certificateBodyShape,
};

export const certificateCreateApiSchema: ApiSchema = {
    ...certificateCreateRequestSchema,
    response: { 200: tResponse(certificateShape) },
};

export const certificateUpdateRequestSchema: RequestSchema = {
    params: t.Object({ id: t.String() }),
    body: certificateUpdateBodyShape,
};

export const certificateUpdateApiSchema: ApiSchema = {
    ...certificateUpdateRequestSchema,
    response: { 200: tResponse(certificateShape) },
};

export const certificateDeleteRequestSchema: RequestSchema = {
    params: t.Object({ id: t.String() }),
};
