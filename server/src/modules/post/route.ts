import { Elysia } from 'elysia';
import handler from '#src/modules/post/handler.js';
import { postCreateRequestSchema, postUpdateRequestSchema, postDeleteRequestSchema } from '#src/modules/post/schema.js';
import { authMiddleware } from '#src/middlewares/auth.middleware.js';

export default new Elysia({ prefix: '/posts', detail: { tags: ["Posts"] } })
    .get('/', handler.list, { detail: { summary: 'List posts', security: [] } })
    .get('/:slug', handler.get, { detail: { summary: 'Get post details', security: [] } })
    .use(authMiddleware)
    .post('/', handler.create, { ...postCreateRequestSchema, detail: { summary: 'Create post' } })
    .put('/:slug', handler.update, { ...postUpdateRequestSchema, detail: { summary: 'Update post' } })
    .delete('/:slug', handler.remove, { ...postDeleteRequestSchema, detail: { summary: 'Delete post' } });
