import { t } from "elysia";

/** Schema untuk validasi REQUEST (body, params, query). Dipakai di route handler. */
export interface RequestSchema {
    body?: any;
    params?: any;
    query?: any;
    type?: string;
    detail?: any;
}

/** Schema untuk mendokumentasikan RESPONSE (hanya untuk OpenAPI docs). JANGAN spread ke route handler. */
export interface ResponseSchema {
    response?: {
        200?: any;
        [key: number]: any;
    };
}

/** Gabungan keduanya — hanya untuk definisi schema di schema.ts, BUKAN untuk di-spread ke route. */
export interface ApiSchema extends RequestSchema, ResponseSchema { }

export const tResponse = (dataSchema: any) => t.Object({
    success: t.Literal(true),
    data: dataSchema,
    message: t.Nullable(t.String()),
    timestamp: t.String(),
});
