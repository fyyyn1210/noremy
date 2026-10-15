import type { Static } from "elysia";
import type { educationSchema } from "#src/drizzle/schemas/index.js";
import type { InferSelectModel } from "drizzle-orm";
import { educationShape } from "#src/modules/education/schema.js";

export type EducationRow = InferSelectModel<typeof educationSchema>;
type EducationResponse = Static<typeof educationShape>;

export function mapEducation(row: EducationRow): EducationResponse {
    return {
        id: row.id,
        school: row.school,
        href: row.href,
        degree: row.degree,
        logoUrl: row.logoUrl,
        start: row.start,
        end: row.end,
        order: row.order,
    };
}
