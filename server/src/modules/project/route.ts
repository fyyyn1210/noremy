import { Elysia } from 'elysia';
import handler from '#src/modules/project/handler.js';
import {
    projectCreateRequestSchema,
    projectUpdateRequestSchema,
    projectDeleteRequestSchema,
} from '#src/modules/project/schema.js';
import { authMiddleware } from '#src/middlewares/auth.middleware.js';

/**
 * Sejak unifikasi dengan freelance works, modul ini ikut pola public/admin
 * split-nya modul freelance:
 *   - /projects/*        → publik, tanpa auth, field multi-bahasa sudah
 *                            di-resolve (?lang=en|id), hanya item yang
 *                            visibility-nya mengandung "portfolio".
 *   - /projects/admin/*  → auth wajib, field multi-bahasa balik mentah
 *                            {en,id}, semua item apapun visibility-nya,
 *                            plus semua operasi CRUD.
 * GET routes sengaja tanpa schema spreading (samain sama konvensi lama
 * modul ini & modul freelance) — cuma mutation (POST/PUT/DELETE) yang
 * pakai *RequestSchema buat validasi body/params.
 */

const publicRoutes = new Elysia()
    .get('/', handler.listPublic, { detail: { summary: 'List projects (resolved lang, visibility=portfolio)', security: [] } })
    .get('/:slug', handler.getPublic, { detail: { summary: 'Get project details (resolved lang)', security: [] } });

const adminRoutes = new Elysia({ prefix: '/admin' })
    .use(authMiddleware)
    .get('/', handler.listAdmin, { detail: { summary: 'List projects (raw {en,id}, semua visibility)' } })
    .get('/:slug', handler.getAdmin, { detail: { summary: 'Get project details (raw {en,id})' } })
    .post('/', handler.create, { ...projectCreateRequestSchema, detail: { summary: 'Create project' } })
    .put('/:slug', handler.update, { ...projectUpdateRequestSchema, detail: { summary: 'Update project' } })
    .delete('/:slug', handler.remove, { ...projectDeleteRequestSchema, detail: { summary: 'Delete project' } });

export default new Elysia({ prefix: '/projects', detail: { tags: ["Projects"] } })
    .use(publicRoutes)
    .use(adminRoutes);
