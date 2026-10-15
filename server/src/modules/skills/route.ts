import { Elysia } from 'elysia';
import handler from '#src/modules/skills/handler.js';
import {
    categoryCreateRequestSchema,
    categoryUpdateRequestSchema,
    categoryDeleteRequestSchema,
    itemCreateRequestSchema,
    itemUpdateRequestSchema,
    itemDeleteRequestSchema,
} from '#src/modules/skills/schema.js';
import { authMiddleware } from '#src/middlewares/auth.middleware.js';

export default new Elysia({ prefix: '/skills', detail: { tags: ["Skills"] } })
    .get('/', handler.list, { detail: { summary: 'List skills', security: [] } })
    .use(authMiddleware)
    .post('/', handler.createCategory, { ...categoryCreateRequestSchema, detail: { summary: 'Create skill category' } })
    .put('/:id', handler.updateCategory, { ...categoryUpdateRequestSchema, detail: { summary: 'Update skill category' } })
    .delete('/:id', handler.removeCategory, { ...categoryDeleteRequestSchema, detail: { summary: 'Delete skill category' } })
    .post('/:id/items', handler.createItem, { ...itemCreateRequestSchema, detail: { summary: 'Add skill item to category' } })
    .put('/items/:itemId', handler.updateItem, { ...itemUpdateRequestSchema, detail: { summary: 'Update skill item' } })
    .delete('/items/:itemId', handler.removeItem, { ...itemDeleteRequestSchema, detail: { summary: 'Delete skill item' } });
