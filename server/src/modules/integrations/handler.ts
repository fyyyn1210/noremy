import response from "#src/utils/response.util.js";
import service from "#src/modules/integrations/service.js";

class Handler {
    async getContext(ctx: any) {
        const data = await service.getContext();
        return ctx.status("OK", response({ data, message: "GIBRO_CONTEXT_FETCHED" }));
    }

    async getPreferences(ctx: any) {
        const data = await service.getPreferences();
        return ctx.status("OK", response({ data, message: "PREFERENCES_FETCHED" }));
    }

    async updatePreferences(ctx: any) {
        const data = await service.updatePreferences(ctx.body);
        return ctx.status("OK", response({ data, message: "PREFERENCES_UPDATED" }));
    }
}

export default new Handler();
