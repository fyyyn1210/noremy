import client from "#src/configs/database.config.js";
import CacheUtil from "#src/utils/cache.util.js";
import { settingSchema } from "#src/drizzle/schemas/index.js";
import { eq, ilike, inArray } from "drizzle-orm";

interface CacheItem<T = unknown> {
  value: T;
  timestamp: number;
}

const CACHE_TTL = 600 * 60 * 1000; // 600 menit
const settingsCache = new CacheUtil<CacheItem>(CACHE_TTL, 0);

const setCacheItem = (key: string, value: unknown): void => {
  settingsCache.set(key, {
    value,
    timestamp: Date.now(),
  });
};

const getCacheItem = <T = unknown>(key: string): T | null => {
  const cached = settingsCache.get(key);

  if (!cached) return null;
  const isExpired = Date.now() - cached.timestamp > CACHE_TTL;

  if (isExpired) {
    settingsCache.delete(key);
    return null;
  }

  return cached.value as T;
};

const clearCacheItem = (key: string): void => {
  settingsCache.delete(key);
};

const clearAllCache = (): void => {
  settingsCache.clear();
};

/**
 * Get setting value by key
 * @param key - Setting key
 * @param defaultValue - Default value jika setting tidak ditemukan
 * @returns Setting value atau null/defaultValue
 */
const get = async <T = unknown>(key: string, defaultValue: T | null = null): Promise<T | null> => {
  try {
    const cachedValue = getCacheItem<T>(key);
    if (cachedValue !== null) {
      return cachedValue;
    }

    const [setting] = await client.select({
      value: settingSchema.value
    }).from(settingSchema).where(eq(settingSchema.key, key));

    if (!setting) return defaultValue;

    let value: unknown = setting.value;
    try {
      value = JSON.parse(setting.value!);
    } catch {
      // bukan JSON, biarkan value tetap string asli
    }

    setCacheItem(key, value);
    return value as T;
  } catch {
    return defaultValue;
  }
};

/**
 * Set setting value by key
 * @param key - Setting key
 * @param value - Setting value (akan di-stringify jika object/array)
 * @returns value jika berhasil, false jika gagal
 */
const set = async (key: string, value: unknown): Promise<unknown | false> => {
  try {
    let stringValue: string;
    if (typeof value === "object" && value !== null) {
      stringValue = JSON.stringify(value);
    } else if (typeof value !== "string") {
      stringValue = String(value);
    } else {
      stringValue = value;
    }

    await client
    .insert(settingSchema)
    .values({ key, value: stringValue })
    .onConflictDoUpdate({
      target: settingSchema.key,
      set: { value: stringValue },
    });


    setCacheItem(key, value);

    return value;
  } catch {
    return false;
  }
};

/**
 * Delete setting by key
 * @param key - Setting key
 * @returns true jika berhasil, false jika gagal
 */
const flush = async (key: string): Promise<boolean> => {
  try {
    await client.delete(settingSchema).where(eq(settingSchema.key, key));

    clearCacheItem(key);

    return true;
  } catch {
    // Prisma delete() akan throw kalau record tidak ditemukan
    return false;
  }
};

/**
 * Get multiple settings sekaligus
 * @param keys - Array of setting keys
 * @returns Object dengan key-value pairs
 */
const gets = async (keys: string[]): Promise<Record<string, unknown>> => {
  try {
    const result: Record<string, unknown> = {};
    const keysToFetch: string[] = [];

    for (const key of keys) {
      const cachedValue = getCacheItem(key);
      if (cachedValue !== null) {
        result[key] = cachedValue;
      } else {
        keysToFetch.push(key);
      }
    }

    if (keysToFetch.length > 0) {
      const settings = await client.select().from(settingSchema).where(inArray(settingSchema.key, keysToFetch))

      for (const setting of settings) {
        let value: unknown = setting.value;
        try {
          value = JSON.parse(setting.value);
        } catch {
          // bukan JSON
        }

        result[setting.key] = value;
        setCacheItem(setting.key, value);
      }

      for (const key of keysToFetch) {
        if (!(key in result)) {
          result[key] = null;
        }
      }
    }

    return result;
  } catch (error) {
    console.error("Error getting multiple settings:", error);
    return {};
  }
};

/**
 * Clear cache untuk key tertentu atau semua cache
 * @param key - Setting key atau null untuk clear all
 */
const fresh = (key: string | null = null): void => {
  if (key) {
    clearCacheItem(key);
  } else {
    clearAllCache();
  }
};

/**
 * Get all settings dengan prefix key tertentu
 * @param prefix - Prefix key setting (contoh: "app.")
 * @returns Object dengan key-value pairs yang cocok dengan prefix
 */
const listByPrefix = async (prefix: string): Promise<Record<string, unknown>> => {
  try {
    const settings = await client
    .select()
    .from(settingSchema)
    .where(ilike(settingSchema.key, `${prefix}%`));

    const result: Record<string, unknown> = {};
    for (const setting of settings) {
      let value: unknown = setting.value;
      try {
        value = JSON.parse(setting.value);
      } catch {
        // Bukan JSON
      }

      result[setting.key] = value;
      setCacheItem(setting.key, value);
    }

    return result;
  } catch (error) {
    console.error("Error getting settings by prefix:", error);
    return {};
  }
};

/**
 * Get all settings
 * @returns Object dengan semua key-value pairs
 */
const list = async (): Promise<Record<string, unknown>> => {
  try {
    const settings = await client.select().from(settingSchema);

    const result: Record<string, unknown> = {};
    for (const setting of settings) {
      let value: unknown = setting.value;
      try {
        value = JSON.parse(setting.value);
      } catch {
        // Bukan JSON
      }

      result[setting.key] = value;
      setCacheItem(setting.key, value);
    }

    return result;
  } catch (error) {
    console.error("Error getting all settings:", error);
    return {};
  }
};

export default { get, set, flush, gets, list, listByPrefix, fresh };