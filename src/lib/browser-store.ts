/**
 * JSON-backed browser storage with a memory fallback.
 *
 * localStorage throws in private mode and in sandboxed embeds, so every read
 * and write falls back to an in-memory map there: the session keeps working,
 * it just does not survive a reload.
 */

const memory = new Map<string, string>();

function storage() {
  if (typeof window === "undefined") return null;
  try {
    const probe = "deluxla:probe";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = storage()?.getItem(key) ?? memory.get(key) ?? null;
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  const raw = JSON.stringify(value);
  memory.set(key, raw);
  try {
    storage()?.setItem(key, raw);
  } catch {
    /* quota or blocked — the in-memory copy still serves this session */
  }
}

export function removeKey(key: string) {
  if (typeof window === "undefined") return;
  memory.delete(key);
  try {
    storage()?.removeItem(key);
  } catch {
    /* ignore */
  }
}
