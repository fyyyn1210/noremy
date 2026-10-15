import { Elysia } from "elysia";
import authRoute from "#src/modules/auth/route.js";
import profileRoute from "#src/modules/profile/route.js";
import workRoute from "#src/modules/work/route.js";
import educationRoute from "#src/modules/education/route.js";
import skillsRoute from "#src/modules/skills/route.js";
import projectRoute from "#src/modules/project/route.js";
import postRoute from "#src/modules/post/route.js";
import certificateRoute from "#src/modules/certificate/route.js";
import activityRoute from "#src/modules/activity/route.js";
import uploadRoute from "#src/modules/upload/route.js";
import freelanceRoute from "#src/modules/freelance/route.js";
import cvRoute from "#src/modules/cv/route.js";
import integrationsRoute from "#src/modules/integrations/route.js";
import env from "#src/configs/env.config.js";
import openapi from "@elysiajs/openapi";
import cors from "@elysiajs/cors";
import { staticPlugin } from "@elysiajs/static";
import response, { FaultError } from "./utils/response.util";
import { logger } from "./configs/pino.config";
import type { Context } from 'elysia';

const siteAllowed = env.NODE_ENV !== "production" ? ['*'] : ['wannen.work', 'putera.vercel.app'];
const app = new Elysia()
  .use(cors({ origin: siteAllowed}))
  .use(staticPlugin({ assets: "public/uploads", prefix: "/uploads" }))
  .use(openapi({
    path: "/api/docs",
    enabled: env.NODE_ENV !== "production",
    scalar: {
      url: "/api/docs/json",
    },
    documentation: {
      info: {
        title: "Portfolio API",
        version: "1.0.0",
        description: "API documentation untuk project portfolio",
      },
      tags: [{ name: "Auth", description: "Authentication endpoints" }],
      servers: [
        { url: `http://localhost:${env.APP_PORT}`, description: "Local (localhost)" },
        { url: `http://127.0.0.1:${env.APP_PORT}`, description: "Local (127.0.0.1)" },
      ],
      security: [{ bearerAuth: [] }],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    },
  }))
  .onError({ as: "global" }, ({ code, error, status }) => {
    if (error instanceof FaultError) return status(error.code, response({
      success: false,
      message: error.message,
      data: error.data, cause:
        error.cause as string | undefined
    }));

    if (code === "VALIDATION") return status("Unprocessable Content", response({
      success: false,
      message: "ERROR_VALIDATION",
      data: error.all.map(e => {
        const reasons = [...e.errors].flatMap((branch) =>
          [...(branch as Iterable<{ message: string }>)].map((x) => x.message)
        );
        return {
          path: e.type,
          filed: e.path.slice(1).replaceAll("/", "."),
          message: e.message,
          schema: e.schema,
          ...(reasons.length > 0 && { reasons })
        }
      })
    }));

    if (code === "NOT_FOUND") return status("Not Found", response({
      success: false,
      message: code,
      data: null
    }));

    logger.error({ err: error }, "Unhandled error");
    return status("Internal Server Error", response({
      success: false,
      data: null,
      message: "INTERNAL_ERROR",
      cause: "An error has occurred, please contact the developer"
    }));
  })
  .get('/healthcheck', ({ status }: Context) => {
    return status("OK", response({
      success: true,
      message: "HEALTHCHECK",
      cause: "The server is healthy!",
      data: null
    }))
  })
  .group('/api/v1', (app) =>
    app
      .use(authRoute)
      .use(profileRoute)
      .use(workRoute)
      .use(educationRoute)
      .use(skillsRoute)
      .use(projectRoute)
      .use(postRoute)
      .use(certificateRoute)
      .use(activityRoute)
      .use(uploadRoute)
      .use(freelanceRoute)
      .use(cvRoute)
      .use(integrationsRoute)
  )
  .onStart(({ server }) => {
    console.log(`🚀 Server run on port:${server?.port}`);
  })
  .listen(env.APP_PORT);

export type App = typeof app;