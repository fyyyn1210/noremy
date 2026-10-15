import { t } from "elysia";
import { tResponse, type RequestSchema, type ApiSchema } from "#src/utils/schema.util.js";

export const activityShape = t.Object({
    id: t.Number(),
    organization: t.String(),
    role: t.String(),
    start: t.String(),
    end: t.String(),
    logoUrl: t.String(),
    description: t.String(),
    order: t.Number(),
});

export const activityBodyShape = t.Object({
    organization: t.String(),
    role: t.String(),
    start: t.String(),
    end: t.String(),
    logoUrl: t.String(),
    description: t.String(),
    order: t.Optional(t.Number()),
});

export const activityUpdateBodyShape = t.Partial(activityBodyShape);

export const activityListApiSchema: ApiSchema = {
    response: { 200: tResponse(t.Array(activityShape)) },
};

export const activityCreateRequestSchema: RequestSchema = {
    body: activityBodyShape,
};

export const activityCreateApiSchema: ApiSchema = {
    ...activityCreateRequestSchema,
    response: { 200: tResponse(activityShape) },
};

export const activityUpdateRequestSchema: RequestSchema = {
    params: t.Object({ id: t.String() }),
    body: activityUpdateBodyShape,
};

export const activityUpdateApiSchema: ApiSchema = {
    ...activityUpdateRequestSchema,
    response: { 200: tResponse(activityShape) },
};

export const activityDeleteRequestSchema: RequestSchema = {
    params: t.Object({ id: t.String() }),
};
