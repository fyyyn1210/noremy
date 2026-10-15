import { t } from "elysia";
import { tResponse, type RequestSchema, type ApiSchema } from "#src/utils/schema.util.js";

export const authLoginShape = t.Object({
  token: t.String(),
  expiresIn: t.String(),
});

export const authUserShape = t.Object({
  id: t.Number(),
  email: t.String(),
});

export const loginRequestSchema: RequestSchema = {
  body: t.Object({
    email: t.String(),
    password: t.String(),
  }),
};

export const loginApiSchema: ApiSchema = {
  ...loginRequestSchema,
  response: {
    200: tResponse(authLoginShape),
  },
};

export const meApiSchema: ApiSchema = {
  response: {
    200: tResponse(authUserShape),
  },
};

export const logoutApiSchema: ApiSchema = {
  response: {
    200: tResponse(t.Null()),
  },
};
