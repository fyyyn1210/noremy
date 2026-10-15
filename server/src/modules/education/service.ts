import { educationSchema } from "#src/drizzle/schemas/index.js";
import client from "#src/configs/database.config.js";
import { asc, eq } from "drizzle-orm";
import { fault } from "#src/utils/response.util.js";
import { finalizeUploadField } from "#src/utils/upload.util.js";
import { mapEducation } from "#src/modules/education/map.js";
import type { Static } from "elysia";
import { educationBodyShape, educationUpdateBodyShape } from "#src/modules/education/schema.js";

type CreateEducationInput = Static<typeof educationBodyShape>;
type UpdateEducationInput = Static<typeof educationUpdateBodyShape>;

const UPLOAD_FOLDER = "education";

class EducationService {
    async list() {
        const rows = await client.select().from(educationSchema).orderBy(asc(educationSchema.order), asc(educationSchema.id));
        return rows.map(mapEducation);
    }

    async create(data: CreateEducationInput) {
        const logoUrl = await finalizeUploadField({ newValue: data.logoUrl, targetFolder: UPLOAD_FOLDER });

        const [result] = await client
            .insert(educationSchema)
            .values({ ...data, logoUrl: logoUrl as string, order: data.order ?? 0 })
            .returning();
        return mapEducation(result);
    }

    async update(id: number, data: UpdateEducationInput) {
        const [current] = await client.select().from(educationSchema).where(eq(educationSchema.id, id));
        if (!current) throw fault({ code: 404, message: "NOT_FOUND", cause: "Education not found" });

        const logoUrl = await finalizeUploadField({ newValue: data.logoUrl, oldValue: current.logoUrl, targetFolder: UPLOAD_FOLDER });

        const [result] = await client
            .update(educationSchema)
            .set({ ...data, ...(logoUrl !== undefined ? { logoUrl: logoUrl as string } : {}), })
            .where(eq(educationSchema.id, id))
            .returning();

        if (!result) throw fault({ code: 404, message: "NOT_FOUND", cause: "Education not found" });
        return mapEducation(result);
    }

    async remove(id: number) {
        const [result] = await client.delete(educationSchema).where(eq(educationSchema.id, id)).returning();
        if (!result) throw fault({ code: 404, message: "NOT_FOUND", cause: "Education not found" });
        return mapEducation(result);
    }
}

export default new EducationService();
