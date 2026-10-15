import type { Static } from "elysia";
import type { certificateSchema } from "#src/drizzle/schemas/index.js";
import type { InferSelectModel } from "drizzle-orm";
import { certificateShape } from "#src/modules/certificate/schema.js";

export type CertificateRow = InferSelectModel<typeof certificateSchema>;
type CertificateResponse = Static<typeof certificateShape>;

export function mapCertificate(row: CertificateRow): CertificateResponse {
    return {
        id: row.id,
        title: row.title,
        issuer: row.issuer,
        href: row.href,
        dates: row.dates,
        logoUrl: row.logoUrl,
        order: row.order,
    };
}
