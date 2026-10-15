import type { Static } from "elysia";
import type { skillCategorySchema, skillItemSchema } from "#src/drizzle/schemas/index.js";
import type { InferSelectModel } from "drizzle-orm";
import { skillItemShape, skillCategoryWithItemsShape } from "#src/modules/skills/schema.js";

export type SkillCategoryRow = InferSelectModel<typeof skillCategorySchema>;
export type SkillItemRow = InferSelectModel<typeof skillItemSchema>;

type SkillItemResponse = Static<typeof skillItemShape>;
type SkillCategoryResponse = Static<typeof skillCategoryWithItemsShape>;

export function mapSkillItem(row: SkillItemRow): SkillItemResponse {
    return {
        id: row.id,
        categoryId: row.categoryId,
        name: row.name,
        iconSlug: row.iconSlug,
    };
}

export function mapSkillCategory(
    row: SkillCategoryRow,
    items: SkillItemRow[] = []
): SkillCategoryResponse {
    return {
        id: row.id,
        category: row.category,
        order: row.order,
        items: items.map(mapSkillItem),
    };
}
