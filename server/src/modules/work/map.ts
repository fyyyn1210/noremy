import type { Static } from "elysia";
import type { workSchema } from "#src/drizzle/schemas/index.js";
import type { InferSelectModel } from "drizzle-orm";
import { workShape } from "#src/modules/work/schema.js";

export type WorkRow = InferSelectModel<typeof workSchema>;
type WorkResponse = Static<typeof workShape>;

export function mapWork(row: WorkRow): WorkResponse {
    return {
        id: row.id,
        company: row.company,
        href: row.href,
        badges: (row.badges as string[]) ?? [],
        location: row.location,
        title: row.title,
        logoUrl: row.logoUrl,
        start: row.start,
        end: row.end ?? null,
        description: row.description,
        order: row.order,
    };
}
