import { Elysia } from "elysia";
import handler from "#src/modules/integrations/handler.js";
import { authMiddleware } from "#src/middlewares/auth.middleware.js";
import { preferencesUpdateRequestSchema } from "#src/modules/integrations/schema.js";

/**
 * /integrations/gibro/context  → publik, tanpa auth (sama seperti /cv),
 *   isinya agregasi mentah semua data personal+freelance (non-harga) +
 *   preferensi lowongan, buat dikonsumsi AI di Gibro.
 * /integrations/gibro/preferences → admin, auth wajib, buat kelola
 *   preferensi lowongan (posisi diincar, tipe kerja, ekspektasi gaji, dst).
 */
const publicRoutes = new Elysia()
    .get("/gibro/context", handler.getContext, {
        detail: {
            summary: "Agregasi data personal + freelance (tanpa harga) + preferensi lowongan, buat konteks AI Gibro",
            security: [],
        },
    });

const adminRoutes = new Elysia({ prefix: "/gibro" })
    .use(authMiddleware)
    .get("/preferences", handler.getPreferences, { detail: { summary: "Get preferensi lowongan" } })
    .put("/preferences", handler.updatePreferences, { ...preferencesUpdateRequestSchema, detail: { summary: "Update preferensi lowongan" } });

export default new Elysia({ prefix: "/integrations", detail: { tags: ["Integrations"] } })
    .use(publicRoutes)
    .use(adminRoutes);
