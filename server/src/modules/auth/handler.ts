import { loginRequestSchema } from '#src/modules/auth/schema.js';
import response from '#src/utils/response.util.js';
import env from "#src/configs/env.config.js";
import authService from '#src/modules/auth/service.js';
import settingsUtil from '#src/utils/settings.util.js';

class Handler {
    async login(ctx: any) {
        const { body, status, jwt } = ctx;
        const profile = await authService.login(body);

        const token = await jwt.sign({ ...profile, exp: Math.floor(Date.now() / 1000) + env.JWT_ACCESS_EXPIRES_IN });

        return status("OK", response({
            data: authService.createLoginResponse(token, String(env.JWT_ACCESS_EXPIRES_IN)),
            message: "LOGGED_IN",
        }));
    }

    async me(ctx: any) {
        const { status } = ctx;
        const data = await authService.me();
        return status("OK", response({ data, message: "CURRENT_USER" }));
    }

    async logout(ctx: any) {
        const { status } = ctx;
        return status("OK", response({ data: null, message: "LOGGED_OUT" }));
    }
}
export default new Handler();