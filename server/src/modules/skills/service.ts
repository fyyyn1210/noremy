import { skillCategorySchema, skillItemSchema } from "#src/drizzle/schemas/index.js";
import client from "#src/configs/database.config.js";
import { eq } from "drizzle-orm";
import { fault } from "#src/utils/response.util.js";
import { mapSkillCategory, mapSkillItem } from "#src/modules/skills/map.js";
import type { Static } from "elysia";
import {
    categoryBodyShape,
    categoryUpdateBodyShape,
    itemBodyShape,
    itemUpdateBodyShape,
} from "#src/modules/skills/schema.js";

type CreateCategoryInput = Static<typeof categoryBodyShape>;
type UpdateCategoryInput = Static<typeof categoryUpdateBodyShape>;
type CreateItemInput = Static<typeof itemBodyShape>;
type UpdateItemInput = Static<typeof itemUpdateBodyShape>;

class SkillService {
    async list() {
        const categories = await client.select().from(skillCategorySchema);
        const items = await client.select().from(skillItemSchema);

        return categories.map(cat => mapSkillCategory(cat, items.filter(item => item.categoryId === cat.id)));
    }

    async createCategory(data: CreateCategoryInput) {
        const [result] = await client.insert(skillCategorySchema).values(data).returning();
        return mapSkillCategory(result, []);
    }

    async updateCategory(id: number, data: UpdateCategoryInput) {
        const [result] = await client
            .update(skillCategorySchema)
            .set(data)
            .where(eq(skillCategorySchema.id, id))
            .returning();

        if (!result) throw fault({ code: 404, message: "NOT_FOUND", cause: "Category not found" });
        return mapSkillCategory(result, []);
    }

    async removeCategory(id: number) {
        const [result] = await client.delete(skillCategorySchema).where(eq(skillCategorySchema.id, id)).returning();
        if (!result) throw fault({ code: 404, message: "NOT_FOUND", cause: "Category not found" });
        return mapSkillCategory(result, []);
    }

    async createItem(categoryId: number, data: CreateItemInput) {
        const [result] = await client.insert(skillItemSchema).values({ ...data, categoryId }).returning();
        return mapSkillItem(result);
    }

    async updateItem(id: number, data: UpdateItemInput) {
        const [result] = await client
            .update(skillItemSchema)
            .set(data)
            .where(eq(skillItemSchema.id, id))
            .returning();

        if (!result) throw fault({ code: 404, message: "NOT_FOUND", cause: "Item not found" });
        return mapSkillItem(result);
    }

    async removeItem(id: number) {
        const [result] = await client.delete(skillItemSchema).where(eq(skillItemSchema.id, id)).returning();
        if (!result) throw fault({ code: 404, message: "NOT_FOUND", cause: "Item not found" });
        return mapSkillItem(result);
    }
}

export default new SkillService();
