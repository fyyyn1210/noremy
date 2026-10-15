import { Elysia } from 'elysia'
import handler from '#src/modules/auth/handler.js';
import { loginRequestSchema } from '#src/modules/auth/schema.js';
import { authMiddleware } from '#src/middlewares/auth.middleware.js';
import jwt from "@elysiajs/jwt";
import env from "#src/configs/env.config.js";

export default new Elysia({ prefix: '/auth', detail: { tags: ["Auth"] } })
    .use(jwt({ name: "jwt", secret: env.JWT_ACCESS_TOKEN_KEY }))
    .post('/login', handler.login, { ...loginRequestSchema, detail: { summary: 'Admin login', security: [] } })
    .use(authMiddleware)
    .get('/me', handler.me, { detail: { summary: 'Get current user data' } })
    .post('/logout', handler.logout, { detail: { summary: 'Logout user' } });