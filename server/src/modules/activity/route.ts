import { Elysia } from 'elysia';
import handler from '#src/modules/activity/handler.js';
import { activityCreateRequestSchema, activityUpdateRequestSchema, activityDeleteRequestSchema } from '#src/modules/activity/schema.js';
import { authMiddleware } from '#src/middlewares/auth.middleware.js';

export default new Elysia({ prefix: '/activities', detail: { tags: ["Activities"] } })
    .get('/', handler.list, { detail: { summary: 'List activities', security: [] } })
    .use(authMiddleware)
    .post('/', handler.create, { ...activityCreateRequestSchema, detail: { summary: 'Create activity' } })
    .put('/:id', handler.update, { ...activityUpdateRequestSchema, detail: { summary: 'Update activity' } })
    .delete('/:id', handler.remove, { ...activityDeleteRequestSchema, detail: { summary: 'Delete activity' } });
