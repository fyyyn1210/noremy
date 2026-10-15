import { t } from "elysia";
import { tResponse, type RequestSchema, type ApiSchema } from "#src/utils/schema.util.js";

export const workShape = t.Object({
    id: t.Number(),
    company: t.String(),
    href: t.String(),
    badges: t.Array(t.String()),
    location: t.String(),
    title: t.String(),
    logoUrl: t.String(),
    start: t.String(),
    end: t.Nullable(t.String()),
    description: t.String(),
    order: t.Number(),
});

export const workBodyShape = t.Object({
    company: t.String(),
    href: t.String(),
    badges: t.Array(t.String()),
    location: t.String(),
    title: t.String(),
    logoUrl: t.String(),
    start: t.String(),
    end: t.Nullable(t.String()),
    description: t.String(),
    order: t.Optional(t.Number()),
});

export const workUpdateBodyShape = t.Partial(workBodyShape);

export const workListApiSchema: ApiSchema = {
    response: { 200: tResponse(t.Array(workShape)) },
};

export const workCreateRequestSchema: RequestSchema = {
    body: workBodyShape,
};

export const workCreateApiSchema: ApiSchema = {
    ...workCreateRequestSchema,
    response: { 200: tResponse(workShape) },
};

export const workUpdateRequestSchema: RequestSchema = {
    params: t.Object({ id: t.String() }),
    body: workUpdateBodyShape,
};

export const workUpdateApiSchema: ApiSchema = {
    ...workUpdateRequestSchema,
    response: { 200: tResponse(workShape) },
};

export const workDeleteRequestSchema: RequestSchema = {
    params: t.Object({ id: t.String() }),
};
