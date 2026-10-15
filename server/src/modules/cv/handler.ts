import response from "#src/utils/response.util.js";
import service from "#src/modules/cv/service.js";
import { normalizeLang } from "#src/utils/i18n.util.js";

class Handler {
    async get(ctx: any) {
        const data = await service.getData(normalizeLang(ctx.query?.lang));
        return ctx.status("OK", response({ data, message: "CV_DATA_FETCHED" }));
    }
}

export default new Handler();
