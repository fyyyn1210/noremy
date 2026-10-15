import settingsUtil from "#src/utils/settings.util.js";
import { finalizeUploadField } from "#src/utils/upload.util.js";
import { mapProfile } from "#src/modules/profile/map.js";
import type { Static } from "elysia";
import { profileUpdateShape } from "#src/modules/profile/schema.js";

type UpdateProfileInput = Static<typeof profileUpdateShape>;

const PROFILE_KEYS = [
    "profile.name",
    "profile.initials",
    "profile.url",
    "profile.location",
    "profile.locationLink",
    "profile.description",
    "profile.summary",
    "profile.avatarUrl",
    "profile.cvUrl",
    "profile.contact",
    "profile.socials",
];

class ProfileService {
    async getProfile() {
        const settings = await settingsUtil.gets(PROFILE_KEYS);

        // mapProfile sudah membaca key ber-prefix ("profile.xxx") langsung
        // dari settings dan menerapkan default-nya masing-masing — jangan
        // di-unprefix dulu di sini, nanti keynya nggak ketemu dan semua
        // field balik jadi null (bug lama).
        return mapProfile(settings);
    }

    async updateProfile(payload: UpdateProfileInput) {
        const current = await this.getProfile();
        const finalizedPayload: Record<string, any> = { ...payload };

        // avatarUrl & cvUrl bisa dikirim berupa key temp R2 hasil presigned
        // upload ("temporary/..."), makanya perlu difinalize (pindah ke
        // folder aktual + hapus file lama) sebelum disimpan ke settings.
        if ("avatarUrl" in payload) {
            finalizedPayload.avatarUrl = await finalizeUploadField({
                newValue: payload.avatarUrl,
                oldValue: current.avatarUrl,
                targetFolder: "profile",
            });
        }

        if ("cvUrl" in payload) {
            finalizedPayload.cvUrl = await finalizeUploadField({
                newValue: payload.cvUrl,
                oldValue: current.cvUrl,
                targetFolder: "cv",
            });
        }

        for (const key of Object.keys(finalizedPayload)) {
            const value = finalizedPayload[key];
            if (value === undefined) continue;
            await settingsUtil.set(`profile.${key}`, value);
        }

        return this.getProfile();
    }
}

export default new ProfileService();
