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

type Day = { date: string; total: number; done: number };

/** Rekap habit per tanggal (WIB) + streak: hari berturut-turut dengan minimal 1 Done. */
export function habitDays(rows: { props: Record<string, any> }[], today: string, n: number) {
  const map = new Map<string, Day>();
  for (let i = n - 1; i >= 0; i--) {
    const date = todayWIB(new Date(Date.parse(today + "T12:00:00+07:00") - i * 86_400_000));
    map.set(date, { date, total: 0, done: 0 });
  }
  for (const r of rows) {
    const date = r.props["Due Date"]?.start?.slice(0, 10) ?? todayWIB(new Date(r.props["Created Time"]));
    const d = map.get(date);
    if (!d) continue;
    d.total++;
    if (r.props.Status === "Done") d.done++;
  }
  const days = [...map.values()];
  // Hari ini belum selesai tidak memutus streak.
  let i = days.length - 1;
  if (!days[i].done) i--;
  let streak = 0;
  for (; i >= 0 && days[i].done; i--) streak++;
  return { days, streak };
}

const WEEK_DAYS = 35;

export default new Elysia()
  // ponytail: streak dihitung dari 35 hari terakhir saja; perpanjang WEEK_DAYS bila streak lebih panjang.
  .get("/week", async () => {
    const today = todayWIB();
    const from = todayWIB(new Date(Date.parse(today + "T12:00:00+07:00") - (WEEK_DAYS - 1) * 86_400_000));
    const rows = await queryAll(DBS.habits!, {
      filter: { timestamp: "created_time", created_time: { on_or_after: startOfDayWIB(from) } },
    });
    return { today, ...habitDays(rows.map(simplify), today, WEEK_DAYS) };
  })
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
          // Task tanpa tanggal juga ikut (kebanyakan task memang tidak diberi Due Date).
          {
            or: [
              { property: "Due Date", date: { on_or_before: today } },
              { property: "Due Date", date: { is_empty: true } },
            ],
          },
        ],
      },
      sorts: [{ property: "Due Date", direction: "ascending" }, { timestamp: "created_time", direction: "descending" }],
    });
    // Task yang dicentang hari ini tetap tampil (pudar) supaya bisa dibatalkan.
    const tasksDone = await queryAll(DBS.tasks!, {
      filter: {
        and: [
          { property: "Done", checkbox: { equals: true } },
          { property: "Done At", date: { on_or_after: startOfDayWIB(today) } },
        ],
      },
      sorts: [{ property: "Done At", direction: "descending" }],
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
    // Mode belajar yang berjalan: Status Active, atau rentang Start–End mencakup hari ini.
    // Notion hanya mengizinkan filter bersarang 2 tingkat; Done/Skipped disaring di sini.
    const modes = DBS.learningMode
      ? (await queryAll(DBS.learningMode, {
          filter: {
            or: [
              { property: "Status", status: { equals: "Active" } },
              {
                and: [
                  { property: "Start Date", date: { on_or_before: today } },
                  { property: "End Date", date: { on_or_after: today } },
                ],
              },
            ],
          },
        })).filter((p: any) => !["Done", "Skipped"].includes(p.properties.Status?.status?.name))
      : [];
    return {
      today,
      habits: habits.map(simplify),
      tasks: tasks.map(simplify),
      tasksDone: tasksDone.map(simplify),
      learning: learning.map(simplify),
      modes: modes.map(simplify),
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
