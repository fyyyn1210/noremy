import { Elysia, NotFoundError } from "elysia";
import { DBS, notion, schemaOf, schemaMap, simplify, stampDone, toNotion } from "../lib/notion";

const ds = (key: string) => {
  const id = DBS[key];
  if (!id) throw new NotFoundError();
  return id;
};

const props = async (id: string, body: unknown) => {
  const schema = await schemaMap(id);
  return toNotion(schema, stampDone(schema, body as any));
};

// CRUD generik untuk semua database di whitelist DBS.
export default new Elysia({ prefix: "/db" })
  .get("/", () => Object.keys(DBS).filter((k) => DBS[k]))
  .get("/:key/schema", ({ params }) => schemaOf(ds(params.key)))
  .get("/:key", async ({ params, query }) => {
    const r: any = await notion.dataSources.query({
      data_source_id: ds(params.key),
      page_size: 50,
      start_cursor: query.cursor || undefined,
      sorts: [{ timestamp: "last_edited_time", direction: "descending" }],
    });
    return { rows: r.results.map(simplify), next: r.has_more ? r.next_cursor : null };
  })
  .get("/:key/:id", async ({ params }) => {
    ds(params.key);
    return simplify(await notion.pages.retrieve({ page_id: params.id }));
  })
  .post("/:key", async ({ params, body }) => {
    const id = ds(params.key);
    const page = await notion.pages.create({
      parent: { type: "data_source_id", data_source_id: id },
      properties: await props(id, body),
    });
    return simplify(page);
  })
  .patch("/:key/:id", async ({ params, body }) => {
    const page = await notion.pages.update({
      page_id: params.id,
      properties: await props(ds(params.key), body),
    });
    return simplify(page);
  })
  .delete("/:key/:id", async ({ params }) => {
    ds(params.key);
    await notion.pages.update({ page_id: params.id, in_trash: true });
    return { ok: true };
  });
