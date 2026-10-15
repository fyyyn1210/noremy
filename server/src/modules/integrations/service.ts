import profileService from "#src/modules/profile/service.js";
import workService from "#src/modules/work/service.js";
import educationService from "#src/modules/education/service.js";
import certificateService from "#src/modules/certificate/service.js";
import skillService from "#src/modules/skills/service.js";
import projectService from "#src/modules/project/service.js";
import freelanceService from "#src/modules/freelance/service.js";
import settingsUtil from "#src/utils/settings.util.js";
import type { Static } from "elysia";
import { preferencesUpdateShape, DEFAULT_PREFERENCES } from "#src/modules/integrations/schema.js";

type UpdatePreferencesInput = Static<typeof preferencesUpdateShape>;

const PREFERENCES_KEY = "jobseeker.preferences";

class IntegrationsService {
    /**
     * Kontrak khusus buat Gibro (bot lamaran kerja), sengaja BUKAN reuse
     * cvService.getData(): `/cv` cuma ngasih project yang showInCv=true
     * dengan urutan yang sudah dikurasi manual buat tampilan CV manusia,
     * sedangkan di sini AI butuh SEMUA data (termasuk project non-CV &
     * yang tadinya "freelance work") supaya dia sendiri yang menyaring/
     * mengurutkan sesuai konteks lowongan yang sedang dilamar — bukan
     * kita yang membatasi duluan.
     *
     * Sejak `projects` & `freelance_works` disatukan jadi satu tabel,
     * `projects` di sini SUDAH termasuk item yang dulunya "freelance
     * work" (bisa dibedakan lewat field `visibility` tiap item: array
     * berisi "portfolio" dan/atau "freelance"). Karena itu tidak ada lagi
     * fetch works terpisah dari modul freelance di sini.
     *
     * Harga/paket freelance (freelance_service_packages) sengaja TIDAK
     * diikutkan — itu bukan bagian dari "siapa saya" yang relevan buat
     * lamaran kerja. Testimonials/stats freelance dikirim RAW {en,id}
     * (bukan di-resolve ke satu bahasa) supaya AI bisa memilih bahasa
     * yang sesuai dengan bahasa lowongan yang sedang dilamar.
     *
     * Endpoint ini sengaja tanpa auth (sama seperti /cv) karena semua
     * yang diikutkan memang sudah publicly visible di situs sendiri —
     * bedanya cuma diagregasi & tidak difilter/dikurasi.
     */
    async getContext() {
        const [
            profile,
            work,
            education,
            certificates,
            skills,
            projects,
            freelanceTestimonials,
            freelanceStats,
            preferences,
        ] = await Promise.all([
            profileService.getProfile(),
            workService.list(),
            educationService.list(),
            certificateService.list(),
            skillService.list(),
            projectService.listAdmin(),
            freelanceService.listTestimonialsAdmin(),
            freelanceService.listStatsAdmin(),
            this.getPreferences(),
        ]);

        return {
            profile,
            work,
            education,
            certificates,
            skills,
            projects,
            freelance: {
                testimonials: freelanceTestimonials,
                stats: freelanceStats,
            },
            preferences,
        };
    }

    async getPreferences(): Promise<typeof DEFAULT_PREFERENCES> {
        const preferences = await settingsUtil.get(PREFERENCES_KEY, DEFAULT_PREFERENCES);
        return (preferences ?? DEFAULT_PREFERENCES) as typeof DEFAULT_PREFERENCES;
    }

    async updatePreferences(payload: UpdatePreferencesInput) {
        const current = await this.getPreferences();
        const merged = { ...current, ...payload };
        await settingsUtil.set(PREFERENCES_KEY, merged);
        return merged;
    }
}

export default new IntegrationsService();
