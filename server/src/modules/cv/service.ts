import profileService from "#src/modules/profile/service.js";
import workService from "#src/modules/work/service.js";
import educationService from "#src/modules/education/service.js";
import certificateService from "#src/modules/certificate/service.js";
import skillService from "#src/modules/skills/service.js";
import projectService from "#src/modules/project/service.js";
import type { Lang } from "#src/utils/i18n.util.js";

class CvService {
    /**
     * Agregasi data live buat CV. Server cuma nyediain data mentah (JSON) —
     * render tampilan/PDF-nya dikerjakan di frontend (halaman /cv + browser
     * print), bukan di server. Ini sengaja menghindari dependency headless
     * Chromium (Puppeteer) yang berat & ribet di-setup di mesin user, dan
     * "download PDF"-nya jadi murni aksi manual (Ctrl+P / Save as PDF),
     * bukan auto-generate dari server.
     *
     * Project title/description sekarang bilingual (sejak disatukan dengan
     * data freelance) — makanya endpoint ini sekarang terima `?lang=`
     * seperti endpoint publik lain, di-resolve lewat projectService.listPublic().
     */
    async getData(lang: Lang) {
        const [profile, work, education, certificates, skills, allProjects] = await Promise.all([
            profileService.getProfile(),
            workService.list(),
            educationService.list(),
            certificateService.list(),
            skillService.list(),
            projectService.listPublic(lang),
        ]);

        const projects = allProjects
            .filter((p) => p.showInCv)
            .sort((a, b) => a.order - b.order);

        return { profile, work, education, certificates, skills, projects };
    }
}

export default new CvService();
