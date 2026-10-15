import { Elysia } from "elysia";
import handler from "#src/modules/upload/handler.js";
import { uploadCreateUrlRequestSchema } from "#src/modules/upload/schema.js";
import { authMiddleware } from "#src/middlewares/auth.middleware.js";
import { fault } from "#src/utils/response.util.js";

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 menit
const RATE_LIMIT_MAX = 20;
const hits = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: Request): string {
    return (
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        request.headers.get("x-real-ip") ||
        "unknown"
    );
}

const uploadRateLimit = new Elysia({ name: "upload.rateLimit" }).onBeforeHandle(({ request }) => {
    const ip = getClientIp(request);
    const now = Date.now();
    const entry = hits.get(ip);

    if (!entry || now > entry.resetAt) {
        hits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
        return;
    }

    entry.count += 1;
    if (entry.count > RATE_LIMIT_MAX) {
        throw fault({ code: 429, message: "TOO_MANY_REQUESTS_TRY_AGAIN_LATER" });
    }
});

export default new Elysia({ prefix: "/upload", detail: { tags: ["Upload"] } })
    .use(authMiddleware)
    .use(uploadRateLimit)
    .post("/create-url", handler.createURL, {
        ...uploadCreateUrlRequestSchema,
        detail: { summary: "Create presigned upload URL" },
    });
