import { workSchema } from "#src/drizzle/schemas/index.js";
import client from "#src/configs/database.config.js";
import { asc, eq } from "drizzle-orm";
import { fault } from "#src/utils/response.util.js";
import { finalizeUploadField } from "#src/utils/upload.util.js";
import { mapWork } from "#src/modules/work/map.js";
import type { Static } from "elysia";
import { workBodyShape, workUpdateBodyShape } from "#src/modules/work/schema.js";

type CreateWorkInput = Static<typeof workBodyShape>;
type UpdateWorkInput = Static<typeof workUpdateBodyShape>;

const UPLOAD_FOLDER = "work";

class WorkService {
    async list() {
        const rows = await client.select().from(workSchema).orderBy(asc(workSchema.order), asc(workSchema.id));
        return rows.map(mapWork);
    }

    async create(data: CreateWorkInput) {
        const logoUrl = await finalizeUploadField({ newValue: data.logoUrl, targetFolder: UPLOAD_FOLDER });

        const [result] = await client
            .insert(workSchema)
            .values({ ...data, logoUrl: logoUrl as string, order: data.order ?? 0 })
            .returning();
        return mapWork(result);
    }

    async update(id: number, data: UpdateWorkInput) {
        const [current] = await client.select().from(workSchema).where(eq(workSchema.id, id));
        if (!current) throw fault({ code: 404, message: "NOT_FOUND", cause: "Work not found" });

        const logoUrl = await finalizeUploadField({ newValue: data.logoUrl, oldValue: current.logoUrl, targetFolder: UPLOAD_FOLDER });

        const [result] = await client
            .update(workSchema)
            .set({ ...data, ...(logoUrl !== undefined ? { logoUrl: logoUrl as string } : {}), })
            .where(eq(workSchema.id, id))
            .returning();

        if (!result) throw fault({ code: 404, message: "NOT_FOUND", cause: "Work not found" });
        return mapWork(result);
    }

    async remove(id: number) {
        const [result] = await client.delete(workSchema).where(eq(workSchema.id, id)).returning();
        if (!result) throw fault({ code: 404, message: "NOT_FOUND", cause: "Work not found" });
        return mapWork(result);
    }
}

export default new WorkService();
