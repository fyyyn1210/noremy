import { Elysia } from 'elysia';
import handler from '#src/modules/profile/handler.js';
import { putProfileRequestSchema } from '#src/modules/profile/schema.js';
import { authMiddleware } from '#src/middlewares/auth.middleware.js';

export default new Elysia({ prefix: '/profile', detail: { tags: ["Profile"] } })
    .get('/', handler.getProfile, { detail: { summary: 'Get profile settings', security: [] } })
    .use(authMiddleware)
    .put('/', handler.updateProfile, { ...putProfileRequestSchema, detail: { summary: 'Update profile settings' } });
