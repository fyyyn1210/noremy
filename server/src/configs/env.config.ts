import { readFileSync, existsSync } from "fs";
import { cleanEnv, str, port, bool, num, makeValidator } from "envalid";

function resolveIfSecretPath(value: string): string {
  if (value.startsWith("/run/secrets/") && existsSync(value)) {
    try {
      return readFileSync(value, "utf-8").trim();
    } catch (err) {
      console.error(`[env] Gagal baca secret file: ${value}`, err);
      return value;
    }
  }
  return value;
}

function resolveAllSecrets(): void {
  for (const [key, value] of Object.entries(process.env)) {
    if (typeof value === "string" && value.startsWith("/run/secrets/")) {
      process.env[key] = resolveIfSecretPath(value);
    }
  }
}

resolveAllSecrets();

const BCRYPT_HASH_PATTERN = /^\$2[aby]\$\d{2}\$/;
const MIN_SECRET_LENGTH = 32;

function assertStrongSecret(input: string, varName: string): void {
  if (!input || input.trim().length === 0) {
    throw new Error(`[${varName}] Secret tidak boleh kosong.`);
  }

  if (input.length < MIN_SECRET_LENGTH) {
    throw new Error(
      `[${varName}] Secret terlalu pendek (${input.length} karakter, minimal ${MIN_SECRET_LENGTH}). ` +
        `Generate secret baru dengan: openssl rand -hex 32`
    );
  }

  if (BCRYPT_HASH_PATTERN.test(input)) {
    throw new Error(
      `[${varName}] Nilai ini terdeteksi sebagai bcrypt hash ($2a$/$2b$/$2y$...), bukan random secret. ` +
        `JWT signing key harus string random murni, bukan hasil bcrypt.hash(). ` +
        `Generate ulang dengan: openssl rand -hex 32`
    );
  }

  const uniqueChars = new Set(input).size;
  const MIN_UNIQUE_CHARS = 10;
  if (uniqueChars < MIN_UNIQUE_CHARS) {
    throw new Error(
      `[${varName}] Variasi karakter terlalu rendah (${uniqueChars} karakter unik, minimal ${MIN_UNIQUE_CHARS}). ` +
        `Kemungkinan bukan random string yang aman.`
    );
  }
}

const strongSecret = makeValidator<string>((input: string) => {
  const trimmed = input.trim();
  assertStrongSecret(trimmed, "secret");
  return trimmed;
});

// Guards against Windows/CRLF-edited .env files leaving a stray \r on the
// value (or a leftover wrapping quote), which silently breaks exact
// comparisons like bcrypt.compare().
const trimmedStr = makeValidator<string>((input: string) =>
  input.trim().replace(/^(["'])(.*)\1$/, "$2")
);

const application = {
  NODE_ENV: str({ choices: ["development", "test", "production"], default: "development" }),
  APP_PORT: port({ default: 3000 }),
  APP_CLIENT_TIMEZONE: str({ choices: ["Asia/Qatar", "UTC"], default: "UTC" }),
};

const logs = {
  PRETTY_LOGGING: bool({ default: false }),
  LOG_LEVEL: str({
    choices: ["trace", "debug", "info", "warn", "error", "fatal", "silent"],
    default: "info",
  }),
};

const postgres = {
  DATABASE_NAME: str(),
  DATABASE_USER_NAME: str(),
  DATABASE_PASSWORD: str(),
  DATABASE_HOST: str(),
  DATABASE_PORT: port({ default: 5432 }),
  DATABASE_DIALECT: str({ choices: ["postgres", "postgresql", "mysql", "sqlite"], default: "postgres" }),
};

const jwt = {
  JWT_ACCESS_TOKEN_KEY: strongSecret(),
  JWT_REFRESH_TOKEN_KEY: strongSecret(),
  JWT_ACCESS_EXPIRES_IN: num({ default: 900 }),
  JWT_REFRESH_EXPIRES_IN: num({ default: 604800 }),
};

export const env = cleanEnv(process.env, {
  ...application,
  ...logs,
  ...postgres,
  ...jwt,
});

export default env;