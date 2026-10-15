import { expect, test } from "bun:test";
import { atWIB, dueNow, parseHHMM, todayWIB } from "./time";
import { toNotion, value } from "./notion";

test("parseHHMM terima titik dan titik dua", () => {
  expect(parseHHMM("20.00")).toEqual([20, 0]);
  expect(parseHHMM("8:05")).toEqual([8, 5]);
  expect(parseHHMM("24.00")).toBeNull();
  expect(parseHHMM("")).toBeNull();
  expect(parseHHMM(null)).toBeNull();
});

test("tanggal WIB berganti di 17:00 UTC", () => {
  expect(todayWIB(new Date("2026-10-15T16:59:00Z"))).toBe("2026-10-15");
  expect(todayWIB(new Date("2026-10-15T17:00:00Z"))).toBe("2026-10-16");
});

test("jendela 30 menit", () => {
  const t = atWIB("2026-10-15", "20.00")!;
  expect(t).toBe(Date.parse("2026-10-15T13:00:00Z"));
  expect(dueNow(t, t - 60_000)).toBe(false);
  expect(dueNow(t, t)).toBe(true);
  expect(dueNow(t, t + 30 * 60_000)).toBe(true);
  expect(dueNow(t, t + 31 * 60_000)).toBe(false);
});

test("toNotion lalu value kembali ke nilai semula", () => {
  const schema = {
    T: { type: "title" }, N: { type: "number" }, C: { type: "checkbox" }, S: { type: "status" },
    M: { type: "multi_select" }, D: { type: "date" }, U: { type: "url" }, F: { type: "formula" },
  };
  const input = {
    T: "Halo", N: 3, C: true, S: "Done", M: ["a", "b"],
    D: { start: "2026-10-15", end: null }, U: "https://x.id", F: "abaikan",
  };
  const out = toNotion(schema, input);
  expect(out.F).toBeUndefined();
  // Bentuk respons Notion: tambahkan type + plain_text.
  const back = (name: string) => {
    const p = { type: schema[name as keyof typeof schema].type, ...out[name] };
    if (p.title) p.title = p.title.map((t: any) => ({ plain_text: t.text.content }));
    return value(p);
  };
  for (const k of ["T", "N", "C", "S", "M", "D", "U"]) expect(back(k)).toEqual(input[k as keyof typeof input]);
  expect(toNotion(schema, { N: "" }).N).toEqual({ number: null });
  expect(toNotion(schema, { T: "x".repeat(4500) }).T.title).toHaveLength(3);
});
