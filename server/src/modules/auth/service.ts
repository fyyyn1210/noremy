import env from "#src/configs/env.config.js";
import { fault } from "#src/utils/response.util.js";
import settingsUtil from "#src/utils/settings.util.js";
import bcrypt from "bcryptjs";
import { mapAuthLogin, mapAuthUser } from "#src/modules/auth/map.js";

class AuthService {
    async login(payload: any) {
        const { email, password } = payload;
        const AUTH_EMAIL = await settingsUtil.get('auth.email', 'rioputrapratama1210@gmail.com');
        const AUTH_PASSWORD = await settingsUtil.get('auth.password', '$2b$10$71ppEDemU/6S42WssKCoi.dQbK9WzPHJBNOcZumZz27MH57Kz2Hcu');
        if (email !== AUTH_EMAIL) {
            throw fault({ code: 401, message: "UNAUTHORIZED", cause: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, AUTH_PASSWORD!);
        if (!isMatch) {
            throw fault({ code: 401, message: "UNAUTHORIZED", cause: "Invalid credentials" });
        }

        return { sub: "admin" };
    }

    createLoginResponse(token: string, expiresIn: string) {
        return mapAuthLogin(token, expiresIn);
    }

    async me() {
        const AUTH_EMAIL = await settingsUtil.get('auth.email', 'rioputrapratama1210@gmail.com');
        return mapAuthUser(AUTH_EMAIL!);
    }
}

export default new AuthService();
