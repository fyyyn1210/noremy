import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { timingSafeEqual } from "node:crypto";
import db from "./routes/db";
import views from "./routes/views";
import pages from "./routes/pages";
import push from "./routes/push";

const REQUIRED = [
  "NOTION_TOKEN", "DS_HABITS", "DS_TASKS", "DS_DEVICES", "NOTES_PAGE_ID",
  "VAPID_PUBLIC_KEY", "VAPID_PRIVATE_KEY", "VAPID_SUBJECT", "TICK_SECRET", "APP_TOKEN",
];
const missing = REQUIRED.filter((k) => !process.env[k]);
if (missing.length) throw new Error(`Env belum diisi: ${missing.join(", ")}`);

const same = (a: string, b: string) =>
  a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

new Elysia()
  .use(cors({ origin: process.env.WEB_ORIGIN ?? true }))
  // /tick pakai TICK_SECRET (query ?secret= atau header), route lain pakai Bearer APP_TOKEN.
  .onRequest(({ request, set }) => {
    if (request.method === "OPTIONS") return;
    const url = new URL(request.url);
    if (url.pathname === "/healthz") return;
    const given = url.pathname === "/tick"
      ? url.searchParams.get("secret") ?? request.headers.get("x-tick-secret") ?? ""
      : (request.headers.get("authorization") ?? "").replace(/^Bearer /, "");
    const want = url.pathname === "/tick" ? process.env.TICK_SECRET! : process.env.APP_TOKEN!;
    if (!same(given, want)) {
      set.status = 401;
      return { error: "unauthorized" };
    }
  })
  .onError(({ code, error, set }) => {
    if (code === "NOT_FOUND") return { error: "not found" };
    const status = (error as any)?.status; // APIResponseError dari Notion
    console.error(error);
    // 401/403 dari Notion = token integration bermasalah, bukan token aplikasi -> 502.
    set.status = typeof status !== "number" ? 500 : status === 401 || status === 403 ? 502 : status;
    return { error: (error as Error).message };
  })
  .get("/healthz", () => "ok")
  .use(db)
  .use(views)
  .use(pages)
  .use(push)
  .listen(process.env.PORT ?? 3000, ({ port }) => console.log(`server :${port}`));
