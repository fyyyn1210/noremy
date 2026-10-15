import { Elysia } from "elysia";
import { notion, richText } from "../lib/notion";

type Any = any;
const plain = (rt: Any[] = []) => rt.map((t) => t.plain_text).join("");

async function children(id: string) {
  const out: Any[] = [];
  let cursor: string | undefined;
  do {
    const r: Any = await notion.blocks.children.list({ block_id: id, start_cursor: cursor, page_size: 100 });
    out.push(...r.results);
    cursor = r.has_more ? r.next_cursor : undefined;
  } while (cursor);
  return out;
}

// ponytail: hanya blok level atas, tanpa format inline. Blok lain jadi link "buka di Notion".
function toMarkdown(b: Any): string {
  const t = plain(b[b.type]?.rich_text);
  switch (b.type) {
    case "paragraph": return t;
    case "heading_1": return `# ${t}`;
    case "heading_2": return `## ${t}`;
    case "heading_3": return `### ${t}`;
    case "bulleted_list_item": return `- ${t}`;
    case "numbered_list_item": return `1. ${t}`;
    case "to_do": return `- [${b.to_do.checked ? "x" : " "}] ${t}`;
    case "quote": return `> ${t}`;
    case "callout": return `> ${b.callout.icon?.emoji ?? ""} ${t}`;
    case "toggle": return `▸ ${t}`;
    case "code": return "```" + (b.code.language ?? "") + "\n" + t + "\n```";
    case "divider": return "---";
    case "child_page": return `[[page:${b.id}|${b.child_page.title}]]`;
    case "child_database": return `[[db:${b.id}|${b.child_database.title}]]`;
    case "image": return `![](${b.image.file?.url ?? b.image.external?.url})`;
    default: return `[${b.type}: buka di Notion]`;
  }
}

/** Teks markdown sederhana -> blok Notion. */
function toBlocks(text: string) {
  return text.split(/\r?\n/).filter((l) => l.trim()).map((line) => {
    const rules: [RegExp, string, Any?][] = [
      [/^### (.*)/, "heading_3"],
      [/^## (.*)/, "heading_2"],
      [/^# (.*)/, "heading_1"],
      [/^- \[([ xX])\] (.*)/, "to_do"],
      [/^[-*] (.*)/, "bulleted_list_item"],
      [/^\d+\. (.*)/, "numbered_list_item"],
      [/^> (.*)/, "quote"],
    ];
    for (const [re, type] of rules) {
      const m = line.match(re);
      if (!m) continue;
      if (type === "to_do")
        return { type, to_do: { rich_text: richText(m[2]), checked: m[1] !== " " } };
      return { type, [type]: { rich_text: richText(m[1]) } };
    }
    return { type: "paragraph", paragraph: { rich_text: richText(line) } };
  });
}

async function append(id: string, text: string) {
  const blocks = toBlocks(text);
  for (let i = 0; i < blocks.length; i += 100)
    await notion.blocks.children.append({ block_id: id, children: blocks.slice(i, i + 100) as Any });
}

export default new Elysia({ prefix: "/pages" })
  .get("/notes", () => ({ id: process.env.NOTES_PAGE_ID }))
  // Sub-page (dan database) langsung di bawah halaman.
  .get("/:id/children", async ({ params }) =>
    (await children(params.id))
      .filter((b) => b.type === "child_page" || b.type === "child_database")
      .map((b) => ({ id: b.id, type: b.type, title: b[b.type].title })),
  )
  .get("/:id", async ({ params }) => {
    const page: Any = await notion.pages.retrieve({ page_id: params.id });
    const title = plain(Object.values<Any>(page.properties).find((p) => p.type === "title")?.title);
    const markdown = (await children(params.id)).map(toMarkdown).join("\n\n");
    return { id: page.id, url: page.url, title, markdown };
  })
  .post("/:id/children", async ({ params, body }) => {
    const { title, text = "" } = body as { title: string; text?: string };
    const page: Any = await notion.pages.create({
      parent: { page_id: params.id },
      properties: { title: { title: richText(title) } } as Any,
    });
    await append(page.id, text);
    return { id: page.id, url: page.url };
  })
  // Hanya menambah di akhir halaman. Tidak menimpa isi lama, supaya tidak ada data hilang.
  .patch("/:id", async ({ params, body }) => {
    await append(params.id, (body as { text: string }).text ?? "");
    return { ok: true };
  });
