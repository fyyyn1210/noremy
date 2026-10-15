import response from '#src/utils/response.util.js';
import service from '#src/modules/freelance/service.js';
import { normalizeLang } from '#src/utils/i18n.util.js';
import type { InferContext } from '#src/types/context.type.js';
import type {
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

class Handler {
    // ---------- Hero ----------
    async getHeroPublic(ctx: any) {
        const data = await service.getHeroPublic(normalizeLang(ctx.query?.lang));
        return ctx.status("OK", response({ data, message: "FREELANCE_HERO_FETCHED" }));
    }

    async getHeroAdmin(ctx: any) {
        const data = await service.getHero();
        return ctx.status("OK", response({ data, message: "FREELANCE_HERO_FETCHED" }));
    }

    async updateHero({ body, status }: InferContext<typeof heroUpdateRequestSchema>) {
        const data = await service.updateHero(body);
        return status("OK", response({ data, message: "FREELANCE_HERO_UPDATED" }));
    }

    // ---------- Contact ----------
    async getContact(ctx: any) {
        const data = await service.getContact();
        return ctx.status("OK", response({ data, message: "FREELANCE_CONTACT_FETCHED" }));
    }

    async updateContact({ body, status }: InferContext<typeof contactUpdateRequestSchema>) {
        const data = await service.updateContact(body);
        return status("OK", response({ data, message: "FREELANCE_CONTACT_UPDATED" }));
    }

    // ---------- Services ----------
    async listServicesPublic(ctx: any) {
        const data = await service.listServicesPublic(normalizeLang(ctx.query?.lang));
        return ctx.status("OK", response({ data, message: "FREELANCE_SERVICE_LIST_FETCHED" }));
    }

    async listServicesAdmin(ctx: any) {
        const data = await service.listServicesAdmin();
        return ctx.status("OK", response({ data, message: "FREELANCE_SERVICE_LIST_FETCHED" }));
    }

    async getServicePublic(ctx: any) {
        const data = await service.getServicePublic(ctx.params.slug, normalizeLang(ctx.query?.lang));
        return ctx.status("OK", response({ data, message: "FREELANCE_SERVICE_FETCHED" }));
    }

    async createService({ body, status }: InferContext<typeof serviceCreateRequestSchema>) {
        const data = await service.createService(body);
        return status("OK", response({ data, message: "FREELANCE_SERVICE_CREATED" }));
    }

    async updateService({ params, body, status }: InferContext<typeof serviceUpdateRequestSchema>) {
        const data = await service.updateService(params.slug, body);
        return status("OK", response({ data, message: "FREELANCE_SERVICE_UPDATED" }));
    }

    async removeService({ params, status }: InferContext<typeof serviceDeleteRequestSchema>) {
        await service.removeService(params.slug);
        return status("No Content");
    }

    // ---------- Service packages ----------
    async createPackage({ params, body, status }: InferContext<typeof packageCreateRequestSchema>) {
        const data = await service.createPackage(params.slug, body);
        return status("OK", response({ data, message: "FREELANCE_PACKAGE_CREATED" }));
    }

    async updatePackage({ params, body, status }: InferContext<typeof packageUpdateRequestSchema>) {
        const data = await service.updatePackage(Number(params.packageId), body);
        return status("OK", response({ data, message: "FREELANCE_PACKAGE_UPDATED" }));
    }

    async removePackage({ params, status }: InferContext<typeof packageDeleteRequestSchema>) {
        await service.removePackage(Number(params.packageId));
        return status("No Content");
    }

    // ---------- Comparison ----------
    async getComparison(ctx: any) {
        const data = await service.getComparison(normalizeLang(ctx.query?.lang));
        return ctx.status("OK", response({ data, message: "FREELANCE_COMPARISON_FETCHED" }));
    }

    // ---------- Testimonials ----------
    async listTestimonialsPublic(ctx: any) {
        const data = await service.listTestimonialsPublic(normalizeLang(ctx.query?.lang));
        return ctx.status("OK", response({ data, message: "FREELANCE_TESTIMONIAL_LIST_FETCHED" }));
    }

    async listTestimonialsAdmin(ctx: any) {
        const data = await service.listTestimonialsAdmin();
        return ctx.status("OK", response({ data, message: "FREELANCE_TESTIMONIAL_LIST_FETCHED" }));
    }

    async createTestimonial({ body, status }: InferContext<typeof testimonialCreateRequestSchema>) {
        const data = await service.createTestimonial(body);
        return status("OK", response({ data, message: "FREELANCE_TESTIMONIAL_CREATED" }));
    }

    async updateTestimonial({ params, body, status }: InferContext<typeof testimonialUpdateRequestSchema>) {
        const data = await service.updateTestimonial(Number(params.id), body);
        return status("OK", response({ data, message: "FREELANCE_TESTIMONIAL_UPDATED" }));
    }

    async removeTestimonial({ params, status }: InferContext<typeof testimonialDeleteRequestSchema>) {
        await service.removeTestimonial(Number(params.id));
        return status("No Content");
    }

    // ---------- Review invites ----------
    async listReviewInvites(ctx: any) {
        const data = await service.listReviewInvites();
        return ctx.status("OK", response({ data, message: "FREELANCE_REVIEW_INVITE_LIST_FETCHED" }));
    }

    async createReviewInvite({ body, status }: InferContext<typeof reviewInviteCreateRequestSchema>) {
        const data = await service.createReviewInvite(body);
        return status("OK", response({ data, message: "FREELANCE_REVIEW_INVITE_CREATED" }));
    }

    async removeReviewInvite({ params, status }: InferContext<typeof reviewInviteDeleteRequestSchema>) {
        await service.removeReviewInvite(Number(params.id));
        return status("No Content");
    }

    async getReviewInvitePublic({ params, status }: InferContext<typeof reviewTokenRequestSchema>) {
        const data = await service.getReviewInvitePublic(params.token);
        return status("OK", response({ data, message: "FREELANCE_REVIEW_INVITE_FETCHED" }));
    }

    async submitReview({ params, body, status }: InferContext<typeof reviewSubmitRequestSchema>) {
        const data = await service.submitReview(params.token, body);
        return status("OK", response({ data, message: "FREELANCE_REVIEW_SUBMITTED" }));
    }

    // ---------- Stats ----------
    async listStatsPublic(ctx: any) {
        const data = await service.listStatsPublic(normalizeLang(ctx.query?.lang));
        return ctx.status("OK", response({ data, message: "FREELANCE_STAT_LIST_FETCHED" }));
    }

    async listStatsAdmin(ctx: any) {
        const data = await service.listStatsAdmin();
        return ctx.status("OK", response({ data, message: "FREELANCE_STAT_LIST_FETCHED" }));
    }

    async createStat({ body, status }: InferContext<typeof statCreateRequestSchema>) {
        const data = await service.createStat(body);
        return status("OK", response({ data, message: "FREELANCE_STAT_CREATED" }));
    }

    async updateStat({ params, body, status }: InferContext<typeof statUpdateRequestSchema>) {
        const data = await service.updateStat(Number(params.id), body);
        return status("OK", response({ data, message: "FREELANCE_STAT_UPDATED" }));
    }

    async removeStat({ params, status }: InferContext<typeof statDeleteRequestSchema>) {
        await service.removeStat(Number(params.id));
        return status("No Content");
    }

    // ---------- FAQs ----------
    async listFaqsPublic(ctx: any) {
        const data = await service.listFaqsPublic(normalizeLang(ctx.query?.lang));
        return ctx.status("OK", response({ data, message: "FREELANCE_FAQ_LIST_FETCHED" }));
    }

    async listFaqsAdmin(ctx: any) {
        const data = await service.listFaqsAdmin();
        return ctx.status("OK", response({ data, message: "FREELANCE_FAQ_LIST_FETCHED" }));
    }

    async createFaq({ body, status }: InferContext<typeof faqCreateRequestSchema>) {
        const data = await service.createFaq(body);
        return status("OK", response({ data, message: "FREELANCE_FAQ_CREATED" }));
    }

    async updateFaq({ params, body, status }: InferContext<typeof faqUpdateRequestSchema>) {
        const data = await service.updateFaq(Number(params.id), body);
        return status("OK", response({ data, message: "FREELANCE_FAQ_UPDATED" }));
    }

    async removeFaq({ params, status }: InferContext<typeof faqDeleteRequestSchema>) {
        await service.removeFaq(Number(params.id));
        return status("No Content");
    }

    // ---------- Works ----------
    async listWorksPublic(ctx: any) {
        const data = await service.listWorksPublic(normalizeLang(ctx.query?.lang));
        return ctx.status("OK", response({ data, message: "FREELANCE_WORK_LIST_FETCHED" }));
    }

    async getWorkPublic(ctx: any) {
        const data = await service.getWorkPublic(ctx.params.slug, normalizeLang(ctx.query?.lang));
        return ctx.status("OK", response({ data, message: "FREELANCE_WORK_FETCHED" }));
    }
}

export default new Handler();
