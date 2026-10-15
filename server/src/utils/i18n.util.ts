/**
 * Helper untuk field multi-bahasa berbentuk JSONB { en: "...", id: "..." }
 * yang dipakai di modul freelance. Response publik selalu di-resolve jadi
 * satu string/array (berdasar ?lang=), response admin balikin object
 * {en,id} mentah supaya form admin bisa edit dua bahasa sekaligus.
 */

export type Lang = "en" | "id";

export type Localized = { en: string; id: string };
export type LocalizedArray = { en: string[]; id: string[] };

/** Normalisasi input query `?lang=` — default ke "en" kalau bukan "en"/"id". */
export function normalizeLang(input: unknown): Lang {
    return input === "id" ? "id" : "en";
}

/** Resolve field {en,id} (atau string biasa, buat jaga-jaga) jadi satu string sesuai lang. */
export function pickLocalized(value: unknown, lang: Lang): string {
    if (!value) return "";
    if (typeof value === "string") return value;
    const v = value as Partial<Localized>;
    return v[lang] ?? v.en ?? v.id ?? "";
}

/** Resolve field {en: string[], id: string[]} jadi satu array sesuai lang. */
export function pickLocalizedArray(value: unknown, lang: Lang): string[] {
    if (!value) return [];
    if (Array.isArray(value)) return value as string[];
    const v = value as Partial<LocalizedArray>;
    return v[lang] ?? v.en ?? v.id ?? [];
}

/**
 * Normalisasi field {en,id} (atau string legacy yang belum dikonversi
 * lewat admin) jadi object {en,id} MENTAH — dipakai di response ADMIN
 * (bukan public) supaya form edit dua-bahasa tetap ke-populate walau
 * datanya masih string biasa peninggalan migrasi (lihat
 * migrate-unify-projects.ts), bukan cuma di-cast langsung yang bisa
 * bikin form kosong & nulis ulang jadi {en:"",id:""} pas disimpan.
 */
export function toLocalizedRaw(value: unknown): Localized {
    if (!value) return { en: "", id: "" };
    if (typeof value === "string") return { en: value, id: value };
    const v = value as Partial<Localized>;
    return { en: v.en ?? "", id: v.id ?? "" };
}
