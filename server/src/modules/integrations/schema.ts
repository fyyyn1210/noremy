import { t } from "elysia";
import type { RequestSchema } from "#src/utils/schema.util.js";

export const desiredPositionShape = t.Object({
    title: t.String(),
    // Sinonim/kata kunci buat posisi ini — dipakai AI Gibro buat
    // mencocokkan judul lowongan yang bunyinya beda-beda tapi maksudnya
    // sama (mis. "Software Engineer - Backend" vs "Backend Developer"),
    // dan buat memilih posisi yang tepat kalau satu poster memuat
    // beberapa lowongan sekaligus.
    keywords: t.Array(t.String()),
    priority: t.Number(),
});

export const salaryExpectationShape = t.Object({
    min: t.Nullable(t.Number()),
    max: t.Nullable(t.Number()),
    currency: t.String(),
});

export const preferencesShape = t.Object({
    desiredPositions: t.Array(desiredPositionShape),
    employmentTypes: t.Array(t.String()),
    workArrangement: t.Array(t.String()),
    locations: t.Array(t.String()),
    salaryExpectation: t.Nullable(salaryExpectationShape),
    availability: t.Nullable(t.String()),
    // "auto" = ikut bahasa lowongan yang dideteksi, atau paksa
    // "Indonesian"/"English".
    languagePreference: t.String(),
});

export const preferencesUpdateShape = t.Partial(preferencesShape);

export const preferencesUpdateRequestSchema: RequestSchema = {
    body: preferencesUpdateShape,
};

export const DEFAULT_PREFERENCES = {
    desiredPositions: [] as { title: string; keywords: string[]; priority: number }[],
    employmentTypes: [] as string[],
    workArrangement: [] as string[],
    locations: [] as string[],
    salaryExpectation: null as { min: number | null; max: number | null; currency: string } | null,
    availability: null as string | null,
    languagePreference: "auto",
};
