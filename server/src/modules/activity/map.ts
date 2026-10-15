import type { Static } from "elysia";
import type { activitySchema } from "#src/drizzle/schemas/index.js";
import type { InferSelectModel } from "drizzle-orm";
import { activityShape } from "#src/modules/activity/schema.js";

export type ActivityRow = InferSelectModel<typeof activitySchema>;
type ActivityResponse = Static<typeof activityShape>;

export function mapActivity(row: ActivityRow): ActivityResponse {
    return {
        id: row.id,
        organization: row.organization,
        role: row.role,
        start: row.start,
        end: row.end,
        logoUrl: row.logoUrl,
        description: row.description,
        order: row.order,
    };
}
