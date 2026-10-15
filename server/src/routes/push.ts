import { Elysia } from "elysia";
import { DBS, notion, queryAll, simplify } from "../lib/notion";
import { sendAll, subscribe } from "../lib/push";
import { atWIB, dueNow, startOfDayWIB, todayWIB } from "../lib/time";

const WINDOW_MIN = 30;

/** Kirim push untuk Habit (kolom Time) dan Task (Due Date berjam) yang jamnya tiba. */
export async function tick(now = Date.now()) {
  const today = todayWIB(new Date(now));
  const due: { id: string; title: string; body: string; url: string }[] = [];

  const habits = await queryAll(DBS.habits!, {
    filter: {
      and: [
        { property: "Notified", checkbox: { equals: false } },
        { property: "Status", status: { does_not_equal: "Done" } },
        { property: "Status", status: { does_not_equal: "Missed" } },
        {
          or: [
            { timestamp: "created_time", created_time: { on_or_after: startOfDayWIB(today) } },
            { property: "Due Date", date: { equals: today } },
          ],
        },
      ],
    },
  });
  // ponytail: jendela yang melewati tengah malam (mis. Time 23.50) tidak ditangani.
  for (const h of habits.map(simplify)) {
    const t = atWIB(today, h.props.Time as string);
    if (t && dueNow(t, now, WINDOW_MIN)) due.push({ id: h.id, title: h.title, body: `Habit · ${h.props.Time}`, url: h.url });
  }

  const tasks = await queryAll(DBS.tasks!, {
    filter: {
      and: [
        { property: "Done", checkbox: { equals: false } },
        { property: "Notified", checkbox: { equals: false } },
        { property: "Due Date", date: { on_or_after: new Date(now - WINDOW_MIN * 60_000).toISOString() } },
        { property: "Due Date", date: { on_or_before: new Date(now).toISOString() } },
      ],
    },
  });
  for (const t of tasks.map(simplify)) {
    const start = (t.props["Due Date"] as { start: string } | null)?.start;
    if (start?.includes("T") && dueNow(Date.parse(start), now, WINDOW_MIN))
      due.push({ id: t.id, title: t.title, body: "Task jatuh tempo", url: t.url });
  }

  for (const d of due) {
    // Tandai hanya bila minimal satu perangkat menerima, supaya tidak hilang saat push gagal.
    if (await sendAll({ title: d.title, body: d.body, url: d.url }))
      await notion.pages.update({ page_id: d.id, properties: { Notified: { checkbox: true } } });
  }
  return { checked: habits.length + tasks.length, sent: due.map((d) => d.title) };
}

export default new Elysia()
  .get("/vapid", () => ({ key: process.env.VAPID_PUBLIC_KEY }))
  .post("/subscribe", async ({ body }) => {
    const { subscription, name } = body as { subscription: any; name?: string };
    return { created: await subscribe(subscription, name ?? "") };
  })
  .all("/tick", () => tick());
