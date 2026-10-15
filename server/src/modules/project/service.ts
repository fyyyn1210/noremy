import { projectSchema, projectLinkSchema } from "#src/drizzle/schemas/index.js";
import client from "#src/configs/database.config.js";
import { asc, eq } from "drizzle-orm";
import { fault } from "#src/utils/response.util.js";
import { finalizeUploadField } from "#src/utils/upload.util.js";
import type { Lang } from "#src/utils/i18n.util.js";
import {
    mapProjectPublic,
    mapProjectPublicList,
    mapProjectAdmin,
    mapProjectAdminList,
    projectVisibility,
} from "#src/modules/project/map.js";
import type { Static } from "elysia";
import { projectBodyShape, projectUpdateBodyShape } from "#src/modules/project/schema.js";

type CreateProjectInput = Static<typeof projectBodyShape>;
type UpdateProjectInput = Static<typeof projectUpdateBodyShape>;

const UPLOAD_FOLDER = "projects";

async function loadAll(kind?: string) {
    let projects = await client.select().from(projectSchema).orderBy(asc(projectSchema.order), asc(projectSchema.id));
    if (kind) {
        projects = projects.filter((p) => p.kind === kind);
    }

    const links = await client.select().from(projectLinkSchema);

    return { projects, links };
}

class ProjectService {
    // ---------- Public (lang-resolved, difilter visibility "portfolio") ----------
    async listPublic(lang: Lang, kind?: string) {
        const { projects, links } = await loadAll(kind);
        return projects
            .filter((p) => projectVisibility(p).includes("portfolio"))
            .map((p) => mapProjectPublicList(p, links.filter((l) => l.projectId === p.id), lang));
    }

    async getBySlugPublic(slug: string, lang: Lang) {
        const [project] = await client.select().from(projectSchema).where(eq(projectSchema.slug, slug));
        if (!project || !projectVisibility(project).includes("portfolio")) {
            throw fault({ code: 404, message: "NOT_FOUND", cause: "Project not found" });
        }

        const links = await client.select().from(projectLinkSchema).where(eq(projectLinkSchema.projectId, project.id));
        return mapProjectPublic(project, links, lang);
    }

    // ---------- Admin (raw {en,id}, semua item apapun visibility-nya) ----------
    async listAdmin(kind?: string) {
        const { projects, links } = await loadAll(kind);
        return projects.map((p) => mapProjectAdminList(p, links.filter((l) => l.projectId === p.id)));
    }

    async getBySlugAdmin(slug: string) {
        const [project] = await client.select().from(projectSchema).where(eq(projectSchema.slug, slug));
        if (!project) throw fault({ code: 404, message: "NOT_FOUND", cause: "Project not found" });

        const links = await client.select().from(projectLinkSchema).where(eq(projectLinkSchema.projectId, project.id));
        return mapProjectAdmin(project, links);
    }

    // Dipakai modul lain (mis. integrations) yang butuh baris mentah tanpa
    // melalui shape response HTTP.
    async listAllRaw() {
        const { projects, links } = await loadAll();
        return { projects, links };
    }

    async create(data: CreateProjectInput) {
        const { links, ...projectData } = data;

        const image = await finalizeUploadField({ newValue: projectData.image, targetFolder: UPLOAD_FOLDER });
        const logoUrl = await finalizeUploadField({ newValue: projectData.logoUrl, targetFolder: UPLOAD_FOLDER });

        const [project] = await client
            .insert(projectSchema)
            .values({
                ...projectData,
                image: image as string,
                logoUrl: logoUrl ?? null,
                scope: projectData.scope ?? [],
                visibility: projectData.visibility ?? ["portfolio"],
                order: projectData.order ?? 0,
                showInCv: projectData.showInCv ?? false,
            })
            .returning();

        let createdLinks: any[] = [];
        if (links && links.length > 0) {
            createdLinks = await client.insert(projectLinkSchema).values(links.map((l) => ({ ...l, projectId: project.id }))).returning();
        }

        return mapProjectAdmin(project, createdLinks);
    }

    async update(slug: string, data: UpdateProjectInput) {
        const [current] = await client.select().from(projectSchema).where(eq(projectSchema.slug, slug));
        if (!current) throw fault({ code: 404, message: "NOT_FOUND", cause: "Project not found" });

        const image = await finalizeUploadField({ newValue: data.image, oldValue: current.image, targetFolder: UPLOAD_FOLDER });
        const logoUrl = await finalizeUploadField({ newValue: data.logoUrl, oldValue: current.logoUrl, targetFolder: UPLOAD_FOLDER });

        const { links, ...rest } = data;

        const [result] = await client
            .update(projectSchema)
            .set({
                ...rest,
                ...(image !== undefined ? { image: image as string } : {}),
                ...(logoUrl !== undefined ? { logoUrl: logoUrl as string } : {}),
            })
            .where(eq(projectSchema.slug, slug))
            .returning();

        if (!result) throw fault({ code: 404, message: "NOT_FOUND", cause: "Project not found" });

        if (links !== undefined) {
            await client.delete(projectLinkSchema).where(eq(projectLinkSchema.projectId, result.id));
            if (links.length > 0) {
                await client.insert(projectLinkSchema).values(links.map((l) => ({ ...l, projectId: result.id })));
            }
        }

        return this.getBySlugAdmin(slug);
    }

    async remove(slug: string) {
        const [result] = await client.delete(projectSchema).where(eq(projectSchema.slug, slug)).returning();
        if (!result) throw fault({ code: 404, message: "NOT_FOUND", cause: "Project not found" });
        return mapProjectAdmin(result, []);
    }
}

export default new ProjectService();
