import { t } from "elysia";
import { tResponse, type RequestSchema, type ApiSchema } from "#src/utils/schema.util.js";

export const educationShape = t.Object({
    id: t.Number(),
    school: t.String(),
    href: t.String(),
    degree: t.String(),
    logoUrl: t.String(),
    start: t.String(),
    end: t.String(),
    order: t.Number(),
});

export const educationBodyShape = t.Object({
    school: t.String(),
    href: t.String(),
    degree: t.String(),
    logoUrl: t.String(),
    start: t.String(),
    end: t.String(),
    order: t.Optional(t.Number()),
});

export const educationUpdateBodyShape = t.Partial(educationBodyShape);

export const educationListApiSchema: ApiSchema = {
    response: { 200: tResponse(t.Array(educationShape)) },
};

export const educationCreateRequestSchema: RequestSchema = {
    body: educationBodyShape,
};

export const educationCreateApiSchema: ApiSchema = {
    ...educationCreateRequestSchema,
    response: { 200: tResponse(educationShape) },
};

export const educationUpdateRequestSchema: RequestSchema = {
    params: t.Object({ id: t.String() }),
    body: educationUpdateBodyShape,
};

export const educationUpdateApiSchema: ApiSchema = {
    ...educationUpdateRequestSchema,
    response: { 200: tResponse(educationShape) },
};

export const educationDeleteRequestSchema: RequestSchema = {
    params: t.Object({ id: t.String() }),
};
