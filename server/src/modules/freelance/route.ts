import { Elysia } from 'elysia';
import handler from '#src/modules/freelance/handler.js';
import { authMiddleware } from '#src/middlewares/auth.middleware.js';
import {
    heroUpdateRequestSchema,
    contactUpdateRequestSchema,
    serviceCreateRequestSchema,
    serviceUpdateRequestSchema,
    serviceDeleteRequestSchema,
    packageCreateRequestSchema,
    packageUpdateRequestSchema,
    packageDeleteRequestSchema,
    testimonialCreateRequestSchema,
    testimonialUpdateRequestSchema,
    testimonialDeleteRequestSchema,
    reviewInviteCreateRequestSchema,
    reviewInviteDeleteRequestSchema,
    reviewTokenRequestSchema,
    reviewSubmitRequestSchema,
    statCreateRequestSchema,
    statUpdateRequestSchema,
    statDeleteRequestSchema,
    faqCreateRequestSchema,
    faqUpdateRequestSchema,
    faqDeleteRequestSchema,
} from '#src/modules/freelance/schema.js';

/**
 * Modul freelance sengaja dibagi jadi dua sub-prefix, bukan flat kayak
 * modul lain (work/post/dst):
 *   - /freelance/*        → publik, tanpa auth, field multi-bahasa sudah
 *                            di-resolve jadi satu bahasa (?lang=en|id).
 *   - /freelance/admin/*  → auth wajib, field multi-bahasa balik mentah
 *                            {en,id} supaya form admin bisa edit dua
 *                            bahasa sekaligus, plus semua operasi CRUD.
 * Kalau digabung di path yang sama, GET publik & GET admin buat resource
 * yang sama akan punya shape response yang beda-beda tergantung auth —
 * membingungkan dan gampang salah dipakai FE. Comparison table tidak
 * punya endpoint admin karena datanya auto-generate dari services+packages.
 */

const publicRoutes = new Elysia()
    .get('/hero', handler.getHeroPublic, { detail: { summary: 'Get freelance hero (resolved lang)', security: [] } })
    .get('/contact', handler.getContact, { detail: { summary: 'Get freelance contact', security: [] } })
    .get('/services', handler.listServicesPublic, { detail: { summary: 'List freelance services (resolved lang)', security: [] } })
    .get('/services/:slug', handler.getServicePublic, { detail: { summary: 'Get freelance service detail', security: [] } })
    .get('/comparison', handler.getComparison, { detail: { summary: 'Get auto-generated package comparison table', security: [] } })
    .get('/testimonials', handler.listTestimonialsPublic, { detail: { summary: 'List freelance testimonials', security: [] } })
    .get('/reviews/:token', handler.getReviewInvitePublic, { ...reviewTokenRequestSchema, detail: { summary: 'Check one-time review link status', security: [] } })
    .post('/reviews/:token', handler.submitReview, { ...reviewSubmitRequestSchema, detail: { summary: 'Submit review via one-time link', security: [] } })
    .get('/stats', handler.listStatsPublic, { detail: { summary: 'List freelance stats', security: [] } })
    .get('/faqs', handler.listFaqsPublic, { detail: { summary: 'List freelance FAQs', security: [] } })
    .get('/works', handler.listWorksPublic, { detail: { summary: 'List freelance portfolio works', security: [] } })
    .get('/works/:slug', handler.getWorkPublic, { detail: { summary: 'Get freelance portfolio work detail', security: [] } });

const adminRoutes = new Elysia({ prefix: '/admin' })
    .use(authMiddleware)
    .get('/hero', handler.getHeroAdmin, { detail: { summary: 'Get freelance hero (raw {en,id})' } })
    .put('/hero', handler.updateHero, { ...heroUpdateRequestSchema, detail: { summary: 'Update freelance hero' } })
    .put('/contact', handler.updateContact, { ...contactUpdateRequestSchema, detail: { summary: 'Update freelance contact' } })

    .get('/services', handler.listServicesAdmin, { detail: { summary: 'List freelance services (raw {en,id})' } })
    .post('/services', handler.createService, { ...serviceCreateRequestSchema, detail: { summary: 'Create freelance service' } })
    .put('/services/:slug', handler.updateService, { ...serviceUpdateRequestSchema, detail: { summary: 'Update freelance service' } })
    .delete('/services/:slug', handler.removeService, { ...serviceDeleteRequestSchema, detail: { summary: 'Delete freelance service' } })

    .post('/services/:slug/packages', handler.createPackage, { ...packageCreateRequestSchema, detail: { summary: 'Add package to a freelance service' } })
    .put('/packages/:packageId', handler.updatePackage, { ...packageUpdateRequestSchema, detail: { summary: 'Update freelance service package' } })
    .delete('/packages/:packageId', handler.removePackage, { ...packageDeleteRequestSchema, detail: { summary: 'Delete freelance service package' } })

    .get('/testimonials', handler.listTestimonialsAdmin, { detail: { summary: 'List freelance testimonials (raw {en,id})' } })
    .post('/testimonials', handler.createTestimonial, { ...testimonialCreateRequestSchema, detail: { summary: 'Create freelance testimonial' } })
    .put('/testimonials/:id', handler.updateTestimonial, { ...testimonialUpdateRequestSchema, detail: { summary: 'Update freelance testimonial' } })
    .delete('/testimonials/:id', handler.removeTestimonial, { ...testimonialDeleteRequestSchema, detail: { summary: 'Delete freelance testimonial' } })

    .get('/review-invites', handler.listReviewInvites, { detail: { summary: 'List one-time review links' } })
    .post('/review-invites', handler.createReviewInvite, { ...reviewInviteCreateRequestSchema, detail: { summary: 'Generate one-time review link' } })
    .delete('/review-invites/:id', handler.removeReviewInvite, { ...reviewInviteDeleteRequestSchema, detail: { summary: 'Revoke/delete one-time review link' } })

    .get('/stats', handler.listStatsAdmin, { detail: { summary: 'List freelance stats (raw {en,id})' } })
    .post('/stats', handler.createStat, { ...statCreateRequestSchema, detail: { summary: 'Create freelance stat' } })
    .put('/stats/:id', handler.updateStat, { ...statUpdateRequestSchema, detail: { summary: 'Update freelance stat' } })
    .delete('/stats/:id', handler.removeStat, { ...statDeleteRequestSchema, detail: { summary: 'Delete freelance stat' } })

    .get('/faqs', handler.listFaqsAdmin, { detail: { summary: 'List freelance FAQs (raw {en,id})' } })
    .post('/faqs', handler.createFaq, { ...faqCreateRequestSchema, detail: { summary: 'Create freelance FAQ' } })
    .put('/faqs/:id', handler.updateFaq, { ...faqUpdateRequestSchema, detail: { summary: 'Update freelance FAQ' } })
    .delete('/faqs/:id', handler.removeFaq, { ...faqDeleteRequestSchema, detail: { summary: 'Delete freelance FAQ' } });

// Catatan: works sekarang murni bacaan dari tabel `projects` terunifikasi
// (lihat publicRoutes di atas & modul project/admin untuk CRUD-nya) — tidak
// ada lagi CRUD works terpisah di sini.

export default new Elysia({ prefix: '/freelance', detail: { tags: ["Freelance"] } })
    .use(publicRoutes)
    .use(adminRoutes);
