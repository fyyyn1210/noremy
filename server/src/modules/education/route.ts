import { Elysia } from 'elysia';
import handler from '#src/modules/education/handler.js';
import { educationCreateRequestSchema, educationUpdateRequestSchema, educationDeleteRequestSchema } from '#src/modules/education/schema.js';
import { authMiddleware } from '#src/middlewares/auth.middleware.js';

export default new Elysia({ prefix: '/education', detail: { tags: ["Education"] } })
    .get('/', handler.list, { detail: { summary: 'List education', security: [] } })
    .use(authMiddleware)
    .post('/', handler.create, { ...educationCreateRequestSchema, detail: { summary: 'Create education' } })
    .put('/:id', handler.update, { ...educationUpdateRequestSchema, detail: { summary: 'Update education' } })
    .delete('/:id', handler.remove, { ...educationDeleteRequestSchema, detail: { summary: 'Delete education' } });
