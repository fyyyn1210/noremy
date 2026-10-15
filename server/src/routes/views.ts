import { Elysia } from "elysia";
import { DBS, queryAll, simplify } from "../lib/notion";
import { startOfDayWIB, todayWIB } from "../lib/time";

// Sumber kalender: database + properti tanggalnya.
const CAL: { key: string; start: string; end?: string }[] = [
  { key: "habits", start: "Due Date" },
  { key: "tasks", start: "Due Date" },
  { key: "learning", start: "Next Session" },
  { key: "learningMode", start: "Start Date", end: "End Date" },
  { key: "english", start: "Start Date" },
];

export default new Elysia()
  // Hari ini: habit harian, task jatuh tempo (termasuk terlambat), review belajar yang jatuh tempo.
  .get("/today", async () => {
    const today = todayWIB();
    const habits = await queryAll(DBS.habits!, {
      filter: {
        or: [
          { timestamp: "created_time", created_time: { on_or_after: startOfDayWIB(today) } },
          { property: "Due Date", date: { equals: today } },
        ],
      },
    });
    const tasks = await queryAll(DBS.tasks!, {
      filter: {
        and: [
          { property: "Done", checkbox: { equals: false } },
          { property: "Due Date", date: { on_or_before: today } },
        ],
      },
      sorts: [{ property: "Due Date", direction: "ascending" }],
    });
    const learning = await queryAll(DBS.learning!, {
      filter: {
        and: [
          { property: "Next Session", date: { on_or_before: today } },
          { property: "Stage", status: { does_not_equal: "Mastered" } },
          { property: "Stage", status: { does_not_equal: "Archived" } },
        ],
      },
      sorts: [{ property: "Next Session", direction: "ascending" }],
    });
    return {
      today,
      habits: habits.map(simplify),
      tasks: tasks.map(simplify),
      learning: learning.map(simplify),
    };
  })
  // Kalender gabungan. Query berurutan supaya tetap di bawah ~3 request/detik.
  .get("/calendar", async ({ query }) => {
    const { from, to } = query as { from: string; to: string };
    const items = [];
    for (const c of CAL) {
      if (!DBS[c.key]) continue;
      const inRange = [
        { property: c.start, date: { on_or_after: from } },
        { property: c.start, date: { on_or_before: to } },
      ];
      const filter = c.end
        ? {
            or: [
              { and: inRange },
              { and: [{ property: c.start, date: { on_or_before: to } }, { property: c.end, date: { on_or_after: from } }] },
            ],
          }
        : { and: inRange };
      for (const p of (await queryAll(DBS[c.key]!, { filter })).map(simplify)) {
        const s = p.props[c.start] as { start: string; end: string | null } | null;
        if (!s) continue;
        const e = c.end ? (p.props[c.end] as any)?.start : s.end;
        items.push({ source: c.key, id: p.id, url: p.url, title: p.title, start: s.start, end: e ?? null });
      }
    }
    return items;
  });
