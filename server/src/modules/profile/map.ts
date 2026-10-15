/** Profile module — data disimpan di settings table, bukan structured DB row. */
import type { Static } from "elysia";
import { profileShape } from "#src/modules/profile/schema.js";

type ProfileResponse = Static<typeof profileShape>;

export function mapProfile(raw: Record<string, any>): ProfileResponse {
    return {
        name: raw["profile.name"] ?? null,
        initials: raw["profile.initials"] ?? null,
        url: raw["profile.url"] ?? null,
        location: raw["profile.location"] ?? null,
        locationLink: raw["profile.locationLink"] ?? null,
        description: raw["profile.description"] ?? null,
        summary: raw["profile.summary"] ?? null,
        avatarUrl: raw["profile.avatarUrl"] ?? null,
        cvUrl: raw["profile.cvUrl"] ?? null,
        contact: raw["profile.contact"] ?? null,
        socials: raw["profile.socials"] ?? [],
    };
}
