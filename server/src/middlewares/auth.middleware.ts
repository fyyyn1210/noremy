import { Elysia } from "elysia";
import jwt from "@elysiajs/jwt";
import env from "#src/configs/env.config.js";
import response, { fault } from "#src/utils/response.util.js";

export const authMiddleware = new Elysia({ name: "auth.middleware" })
    .use(
        jwt({
            name: "jwt",
            secret: env.JWT_ACCESS_TOKEN_KEY,
        })
    )
    .derive(async ({ jwt, headers: { authorization } }) => {
        if (!authorization) {
            throw fault({ code: 401, message: "UNAUTHORIZED", cause: "Missing Authorization header" });
        }
        const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : authorization;
        const profile = await jwt.verify(token);

        if (!profile) {
            throw fault({ code: 401, message: "UNAUTHORIZED", cause: "Invalid or expired token" });
        }

        return { user: profile };
    });
