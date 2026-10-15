/** Auth module tidak punya data dari DB — hanya identitas user dari JWT. */
import type { Static } from "elysia";
import { authUserShape, authLoginShape } from "#src/modules/auth/schema.js";

type AuthUserResponse = Static<typeof authUserShape>;
type AuthLoginResponse = Static<typeof authLoginShape>;

export function mapAuthUser(email: string): AuthUserResponse {
    return { id: 1, email };
}

export function mapAuthLogin(token: string, expiresIn: string): AuthLoginResponse {
    return { token, expiresIn };
}
