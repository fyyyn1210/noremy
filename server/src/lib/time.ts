// Semua tanggal/jam dibaca di zona WIB secara eksplisit.
export const TZ = "Asia/Jakarta";
const OFFSET = "+07:00";

/** "YYYY-MM-DD" di WIB. */
export const todayWIB = (d = new Date()) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d);

/** Awal hari WIB sebagai ISO, untuk filter Notion. */
export const startOfDayWIB = (date: string) => `${date}T00:00:00${OFFSET}`;

/** "20.00" / "8:05" -> [20, 0] / [8, 5]; selain itu null. */
export function parseHHMM(s: string | null | undefined): [number, number] | null {
  const m = s?.trim().match(/^(\d{1,2})[.:](\d{2})/);
  if (!m) return null;
  const h = +m[1], min = +m[2];
  return h < 24 && min < 60 ? [h, min] : null;
}

/** Jam teks pada tanggal WIB tertentu -> epoch ms. */
export function atWIB(date: string, hhmm: string | null | undefined): number | null {
  const t = parseHHMM(hhmm);
  if (!t) return null;
  const pad = (n: number) => String(n).padStart(2, "0");
  return Date.parse(`${date}T${pad(t[0])}:${pad(t[1])}:00${OFFSET}`);
}

/** Jam target sudah lewat, tapi belum lebih dari `windowMin` menit. */
export const dueNow = (target: number, now: number, windowMin = 30) =>
  now >= target && now - target <= windowMin * 60_000;
