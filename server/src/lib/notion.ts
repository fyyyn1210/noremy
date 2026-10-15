import { Client } from "@notionhq/client";

export const notion = new Client({ auth: process.env.NOTION_TOKEN });

// Whitelist database yang boleh diakses PWA. Tambah DB baru = satu baris di sini + env.
export const DBS: Record<string, string | undefined> = {
  habits: process.env.DS_HABITS,
  tasks: process.env.DS_TASKS,
  learningMode: process.env.DS_LEARNING_MODE,
  english: process.env.DS_ENGLISH,
  learning: process.env.DS_LEARNING,
  streak: process.env.DS_STREAK,
  notesDb: process.env.DS_NOTES,
};
export const DEVICES_DS = process.env.DS_DEVICES!;

export const EDITABLE = new Set([
  "title", "rich_text", "number", "checkbox", "select", "multi_select",
  "status", "date", "url", "email", "phone_number",
]);

type Any = any;
const plain = (rt: Any[] = []) => rt.map((t) => t.plain_text).join("");

/** Nilai properti Notion -> JSON polos. */
export function value(p: Any): unknown {
  switch (p.type) {
    case "title": case "rich_text": return plain(p[p.type]);
    case "number": case "checkbox": case "url": case "email": case "phone_number":
    case "created_time": case "last_edited_time": return p[p.type];
    case "select": case "status": return p[p.type]?.name ?? null;
    case "multi_select": return p.multi_select.map((o: Any) => o.name);
    case "date": return p.date && { start: p.date.start, end: p.date.end };
    case "relation": return p.relation.map((r: Any) => r.id);
    case "people": return p.people.map((u: Any) => u.name ?? u.id);
    case "files": return p.files.map((f: Any) => f.name);
    case "unique_id": return `${p.unique_id.prefix ?? ""}${p.unique_id.number}`;
    case "formula": {
      const f = p.formula;
      return f.type === "date" ? f.date?.start ?? null : f[f.type];
    }
    case "rollup": {
      const r = p.rollup;
      return r.type === "array" ? r.array.map(value) : r.type === "date" ? r.date?.start ?? null : r[r.type];
    }
    default: return null;
  }
}

export function simplify(page: Any) {
  const props: Record<string, unknown> = {};
  let title = "";
  for (const [name, p] of Object.entries<Any>(page.properties ?? {})) {
    props[name] = value(p);
    if (p.type === "title") title = props[name] as string;
  }
  return { id: page.id, url: page.url, title, props };
}

/** Notion membatasi 2000 karakter per potongan rich_text. */
export const richText = (s: string) =>
  (s.match(/[\s\S]{1,2000}/g) ?? []).map((content) => ({ type: "text", text: { content } }));

/** JSON polos -> properti Notion, sesuai skema. Properti read-only/tak dikenal dilewati. */
export function toNotion(schema: Record<string, { type: string }>, values: Record<string, Any>) {
  const out: Record<string, Any> = {};
  for (const [name, v] of Object.entries(values)) {
    const t = schema[name]?.type;
    if (!t || !EDITABLE.has(t)) continue;
    switch (t) {
      case "title": case "rich_text": out[name] = { [t]: richText(v ?? "") }; break;
      case "number": out[name] = { number: v === "" || v == null ? null : Number(v) }; break;
      case "checkbox": out[name] = { checkbox: !!v }; break;
      case "select": case "status": out[name] = { [t]: v ? { name: v } : null }; break;
      case "multi_select": out[name] = { multi_select: (v ?? []).map((n: string) => ({ name: n })) }; break;
      case "date": out[name] = { date: v?.start ? { start: v.start, end: v.end || null } : null }; break;
      default: out[name] = { [t]: v || null }; // url, email, phone_number
    }
  }
  return out;
}

/** Database dengan "Done" + "Done At": isi/kosongkan Done At otomatis saat Done berubah. */
export function stampDone(schema: Record<string, { type: string }>, values: Record<string, Any>, now = new Date()) {
  if (schema.Done?.type !== "checkbox" || schema["Done At"]?.type !== "date") return values;
  if (!("Done" in values) || "Done At" in values) return values;
  return { ...values, "Done At": values.Done ? { start: now.toISOString(), end: null } : null };
}

/** Skema ringkas: nama, tipe, opsi, read-only. */
export async function schemaOf(dsId: string) {
  const ds: Any = await notion.dataSources.retrieve({ data_source_id: dsId });
  return Object.values<Any>(ds.properties).map((p) => ({
    name: p.name as string,
    type: p.type as string,
    options: (p[p.type]?.options as Any[] | undefined)?.map((o) => o.name),
    readOnly: !EDITABLE.has(p.type),
  }));
}

export const schemaMap = async (dsId: string) =>
  Object.fromEntries((await schemaOf(dsId)).map((p) => [p.name, p]));

/** Query semua halaman (ikuti cursor). */
export async function queryAll(dsId: string, body: Any = {}) {
  const rows: Any[] = [];
  let cursor: string | undefined;
  do {
    const r: Any = await notion.dataSources.query({
      data_source_id: dsId, page_size: 100, start_cursor: cursor, ...body,
    });
    rows.push(...r.results);
    cursor = r.has_more ? r.next_cursor : undefined;
  } while (cursor);
  return rows;
}
