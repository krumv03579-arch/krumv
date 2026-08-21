/**
 * Which Supabase project this app talks to.
 *
 * The publishable key is a browser key: it ships inside the client bundle no
 * matter where it is kept, and row level security — not secrecy — is what
 * guards the data. Keeping the project's own values here means a fresh clone
 * connects without any setup, while `VITE_SUPABASE_*` (browser) and
 * `SUPABASE_*` (server) still win when they are set, so a deployment can point
 * the app at a different project.
 *
 * The service role key is deliberately absent — it must never reach the client
 * bundle. `client.server.ts` reads it from the environment only.
 */

const PROJECT_URL = "https://efgggrjoknbwbwbwhejd.supabase.co";
const PROJECT_PUBLISHABLE_KEY =
  "sb_publishable_YavXhAt6v8Ui7O-RRjLSyQ_b-DUatyA";

/** `process` is absent in the browser, so every server read has to be guarded. */
function fromProcessEnv(name: string): string | undefined {
  if (typeof process === "undefined" || !process.env) return undefined;
  return process.env[name] || undefined;
}

function resolve(viteValue: unknown, serverName: string, fallback: string) {
  return (
    (typeof viteValue === "string" && viteValue ? viteValue : undefined) ??
    fromProcessEnv(serverName) ??
    fallback
  );
}

export const SUPABASE_URL = resolve(
  import.meta.env.VITE_SUPABASE_URL,
  "SUPABASE_URL",
  PROJECT_URL,
);

export const SUPABASE_PUBLISHABLE_KEY = resolve(
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  "SUPABASE_PUBLISHABLE_KEY",
  PROJECT_PUBLISHABLE_KEY,
);

/** New-style keys (`sb_publishable_…`) are opaque strings, not bearer JWTs. */
export function isNewSupabaseApiKey(value: string): boolean {
  return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}

/**
 * supabase-js sends the api key as a bearer token by default. The new opaque
 * keys are rejected that way, so the header is dropped and only `apikey` is
 * sent — while leaving a real user token in place when one is present.
 */
export function createSupabaseFetch(supabaseKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request
        ? input.headers
        : undefined,
    );

    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) =>
        headers.set(key, value),
      );
    }

    if (
      isNewSupabaseApiKey(supabaseKey) &&
      headers.get("Authorization") === `Bearer ${supabaseKey}`
    ) {
      headers.delete("Authorization");
    }

    headers.set("apikey", supabaseKey);
    return fetch(input, { ...init, headers });
  };
}
