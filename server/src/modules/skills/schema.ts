import { t } from "elysia";
import { tResponse, type RequestSchema, type ApiSchema } from "#src/utils/schema.util.js";

export const skillItemShape = t.Object({
    id: t.Number(),
    categoryId: t.Number(),
    name: t.String(),
    iconSlug: t.String(),
});

export const skillCategoryShape = t.Object({
    id: t.Number(),
    category: t.String(),
    order: t.Number(),
});

export const skillCategoryWithItemsShape = t.Intersect([
    skillCategoryShape,
    t.Object({ items: t.Array(skillItemShape) }),
]);

export const categoryBodyShape = t.Object({ category: t.String(), order: t.Number() });
export const categoryUpdateBodyShape = t.Partial(categoryBodyShape);

export const itemBodyShape = t.Object({ name: t.String(), iconSlug: t.String() });
export const itemUpdateBodyShape = t.Partial(itemBodyShape);

export const skillListApiSchema: ApiSchema = {
    response: { 200: tResponse(t.Array(skillCategoryWithItemsShape)) },
};

export const categoryCreateRequestSchema: RequestSchema = {
    body: categoryBodyShape,
};

export const categoryCreateApiSchema: ApiSchema = {
    ...categoryCreateRequestSchema,
    response: { 200: tResponse(skillCategoryWithItemsShape) },
};

export const categoryUpdateRequestSchema: RequestSchema = {
    params: t.Object({ id: t.String() }),
    body: categoryUpdateBodyShape,
};

export const categoryUpdateApiSchema: ApiSchema = {
    ...categoryUpdateRequestSchema,
    response: { 200: tResponse(skillCategoryShape) },
};

export const categoryDeleteRequestSchema: RequestSchema = {
    params: t.Object({ id: t.String() }),
};

export const itemCreateRequestSchema: RequestSchema = {
    params: t.Object({ id: t.String() }),
    body: itemBodyShape,
};

export const itemCreateApiSchema: ApiSchema = {
    ...itemCreateRequestSchema,
    response: { 200: tResponse(skillItemShape) },
};

export const itemUpdateRequestSchema: RequestSchema = {
    params: t.Object({ itemId: t.String() }),
    body: itemUpdateBodyShape,
};

export const itemUpdateApiSchema: ApiSchema = {
    ...itemUpdateRequestSchema,
    response: { 200: tResponse(skillItemShape) },
};

export const itemDeleteRequestSchema: RequestSchema = {
    params: t.Object({ itemId: t.String() }),
};
