import { Elysia } from 'elysia';
import handler from '#src/modules/certificate/handler.js';
import { certificateCreateRequestSchema, certificateUpdateRequestSchema, certificateDeleteRequestSchema } from '#src/modules/certificate/schema.js';
import { authMiddleware } from '#src/middlewares/auth.middleware.js';

export default new Elysia({ prefix: '/certificates', detail: { tags: ["Certificates"] } })
    .get('/', handler.list, { detail: { summary: 'List certificates', security: [] } })
    .use(authMiddleware)
    .post('/', handler.create, { ...certificateCreateRequestSchema, detail: { summary: 'Create certificate' } })
    .put('/:id', handler.update, { ...certificateUpdateRequestSchema, detail: { summary: 'Update certificate' } })
    .delete('/:id', handler.remove, { ...certificateDeleteRequestSchema, detail: { summary: 'Delete certificate' } });
