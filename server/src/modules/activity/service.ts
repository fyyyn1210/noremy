import { activitySchema } from "#src/drizzle/schemas/index.js";
import client from "#src/configs/database.config.js";
import { asc, eq } from "drizzle-orm";
import { fault } from "#src/utils/response.util.js";
import { finalizeUploadField } from "#src/utils/upload.util.js";
import { mapActivity } from "#src/modules/activity/map.js";
import type { Static } from "elysia";
import { activityBodyShape, activityUpdateBodyShape } from "#src/modules/activity/schema.js";

type CreateActivityInput = Static<typeof activityBodyShape>;
type UpdateActivityInput = Static<typeof activityUpdateBodyShape>;

const UPLOAD_FOLDER = "activities";

class ActivityService {
    async list() {
        const rows = await client.select().from(activitySchema).orderBy(asc(activitySchema.order), asc(activitySchema.id));
        return rows.map(mapActivity);
    }

    async create(data: CreateActivityInput) {
        const logoUrl = await finalizeUploadField({ newValue: data.logoUrl, targetFolder: UPLOAD_FOLDER });

        const [result] = await client
            .insert(activitySchema)
            .values({ ...data, logoUrl: logoUrl as string, order: data.order ?? 0 })
            .returning();
        return mapActivity(result);
    }

    async update(id: number, data: UpdateActivityInput) {
        const [current] = await client.select().from(activitySchema).where(eq(activitySchema.id, id));
        if (!current) throw fault({ code: 404, message: "NOT_FOUND", cause: "Activity not found" });

        const logoUrl = await finalizeUploadField({ newValue: data.logoUrl, oldValue: current.logoUrl, targetFolder: UPLOAD_FOLDER });

        const [result] = await client
            .update(activitySchema)
            .set({ ...data, ...(logoUrl !== undefined ? { logoUrl: logoUrl as string } : {}), })
            .where(eq(activitySchema.id, id))
            .returning();

        if (!result) throw fault({ code: 404, message: "NOT_FOUND", cause: "Activity not found" });
        return mapActivity(result);
    }

    async remove(id: number) {
        const [result] = await client.delete(activitySchema).where(eq(activitySchema.id, id)).returning();
        if (!result) throw fault({ code: 404, message: "NOT_FOUND", cause: "Activity not found" });
        return mapActivity(result);
    }
}

export default new ActivityService();
