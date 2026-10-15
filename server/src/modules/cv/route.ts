import { Elysia } from "elysia";
import handler from "#src/modules/cv/handler.js";

export default new Elysia({ prefix: "/cv", detail: { tags: ["CV"] } })
    .get("/", handler.get, {
        detail: {
            summary: "Ambil data CV teragregasi (profile+work+education+certificate+skills+project pilihan)",
            security: [],
        },
    });
