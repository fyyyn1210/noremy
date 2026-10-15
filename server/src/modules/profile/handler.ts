import response from '#src/utils/response.util.js';
import profileService from '#src/modules/profile/service.js';
import type { putProfileRequestSchema } from '#src/modules/profile/schema.js';
import type { InferContext } from '#src/types/context.type.js';

type UpdateCtx = InferContext<typeof putProfileRequestSchema>;

class Handler {
    async getProfile(ctx: any) {
        const { status } = ctx;
        const profile = await profileService.getProfile();
        return status("OK", response({ data: profile, message: "PROFILE_FETCHED" }));
    }

    async updateProfile({ body, status }: UpdateCtx) {
        const profile = await profileService.updateProfile(body);
        return status("OK", response({ data: profile, message: "PROFILE_UPDATED" }));
    }
}

export default new Handler();
