import webpush from "web-push";
import { notion, queryAll, richText, DEVICES_DS } from "./notion";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

type Sub = { endpoint: string; keys: { p256dh: string; auth: string } };
const text = (p: any) => p?.rich_text?.map((t: any) => t.plain_text).join("") ?? "";

async function devices() {
  return (await queryAll(DEVICES_DS)).map((p: any) => ({
    pageId: p.id as string,
    endpoint: text(p.properties.Endpoint),
    keys: JSON.parse(text(p.properties.Keys) || "{}"),
  }));
}

/** Simpan langganan; abaikan bila endpoint sudah terdaftar. */
export async function subscribe(sub: Sub, name: string) {
  if ((await devices()).some((d) => d.endpoint === sub.endpoint)) return false;
  await notion.pages.create({
    parent: { type: "data_source_id", data_source_id: DEVICES_DS },
    properties: {
      Name: { title: richText(name || "Perangkat") },
      Endpoint: { rich_text: richText(sub.endpoint) },
      Keys: { rich_text: richText(JSON.stringify(sub.keys)) },
    } as any,
  });
  return true;
}

/** Kirim ke semua perangkat. Langganan mati (404/410) dihapus. Return jumlah sukses. */
export async function sendAll(payload: { title: string; body?: string; url?: string }) {
  let ok = 0;
  for (const d of await devices()) {
    try {
      await webpush.sendNotification({ endpoint: d.endpoint, keys: d.keys }, JSON.stringify(payload));
      ok++;
    } catch (e: any) {
      if (e.statusCode === 404 || e.statusCode === 410)
        await notion.pages.update({ page_id: d.pageId, in_trash: true });
      else console.error("push gagal", e.statusCode, e.body);
    }
  }
  return ok;
}
