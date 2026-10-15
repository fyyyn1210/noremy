import { Elysia } from 'elysia';
import handler from '#src/modules/work/handler.js';
import { workCreateRequestSchema, workUpdateRequestSchema, workDeleteRequestSchema } from '#src/modules/work/schema.js';
import { authMiddleware } from '#src/middlewares/auth.middleware.js';

export default new Elysia({ prefix: '/work', detail: { tags: ["Work"] } })
    .get('/', handler.list, { detail: { summary: 'List work experiences', security: [] } })
    .use(authMiddleware)
    .post('/', handler.create, { ...workCreateRequestSchema, detail: { summary: 'Create work experience' } })
    .put('/:id', handler.update, { ...workUpdateRequestSchema, detail: { summary: 'Update work experience' } })
    .delete('/:id', handler.remove, { ...workDeleteRequestSchema, detail: { summary: 'Delete work experience' } });
