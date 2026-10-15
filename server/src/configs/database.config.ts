import { drizzle } from "drizzle-orm/bun-sql";
import { SQL } from "bun";
import env from "#src/configs/env.config.js";
import * as schema from "#src/drizzle/schemas/index.js";

const instance = new SQL({
  hostname: env.DATABASE_HOST,
  port: Number(env.DATABASE_PORT),
  username: env.DATABASE_USER_NAME,
  password: env.DATABASE_PASSWORD,
  database: env.DATABASE_NAME,
  ssl: "require"
});

export const client = drizzle({ client: instance, schema });

export default client;