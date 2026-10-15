import { certificateSchema } from "#src/drizzle/schemas/index.js";
import client from "#src/configs/database.config.js";
import { asc, eq } from "drizzle-orm";
import { fault } from "#src/utils/response.util.js";
import { finalizeUploadField } from "#src/utils/upload.util.js";
import { mapCertificate } from "#src/modules/certificate/map.js";
import type { Static } from "elysia";
import { certificateBodyShape, certificateUpdateBodyShape } from "#src/modules/certificate/schema.js";

type CreateCertificateInput = Static<typeof certificateBodyShape>;
type UpdateCertificateInput = Static<typeof certificateUpdateBodyShape>;

const UPLOAD_FOLDER = "certificates";

class CertificateService {
    async list() {
        const rows = await client.select().from(certificateSchema).orderBy(asc(certificateSchema.order), asc(certificateSchema.id));
        return rows.map(mapCertificate);
    }

    async create(data: CreateCertificateInput) {
        const logoUrl = await finalizeUploadField({ newValue: data.logoUrl, targetFolder: UPLOAD_FOLDER });

        const [result] = await client
            .insert(certificateSchema)
            .values({ ...data, logoUrl: logoUrl as string, order: data.order ?? 0 })
            .returning();
        return mapCertificate(result);
    }

    async update(id: number, data: UpdateCertificateInput) {
        const [current] = await client.select().from(certificateSchema).where(eq(certificateSchema.id, id));
        if (!current) throw fault({ code: 404, message: "NOT_FOUND", cause: "Certificate not found" });

        const logoUrl = await finalizeUploadField({ newValue: data.logoUrl, oldValue: current.logoUrl, targetFolder: UPLOAD_FOLDER });

        const [result] = await client
            .update(certificateSchema)
            .set({ ...data, ...(logoUrl !== undefined ? { logoUrl: logoUrl as string } : {}), })
            .where(eq(certificateSchema.id, id))
            .returning();

        if (!result) throw fault({ code: 404, message: "NOT_FOUND", cause: "Certificate not found" });
        return mapCertificate(result);
    }

    async remove(id: number) {
        const [result] = await client.delete(certificateSchema).where(eq(certificateSchema.id, id)).returning();
        if (!result) throw fault({ code: 404, message: "NOT_FOUND", cause: "Certificate not found" });
        return mapCertificate(result);
    }
}

export default new CertificateService();
