/**
 * Typed client for the Rytmix ASP.NET Core API.
 *
 * The base URL is ALWAYS read from `NEXT_PUBLIC_API_BASE_URL` — never hardcoded.
 * Both the web build (Cloudflare Pages) and the planned Tauri desktop build read the
 * exact same variable, so the same compiled frontend works in both. The frontend
 * holds no secrets; only this public base URL.
 *
 * All talking to the backend should go through this module — no scattered
 * `fetch` calls in components (see ../CLAUDE.md).
 */

// Next.js inlines `NEXT_PUBLIC_*` vars at build time, so this is a string literal
// in the bundle, not a runtime lookup. It may be `undefined` if the var is unset.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/** Thrown when the API responds with a non-2xx status. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Resolve the configured base URL, failing loudly if it's missing. */
function resolveBaseUrl(): string {
  if (!API_BASE_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL is not set. Copy .env.example to .env.local " +
        "and point it at your API (see ../CLAUDE.md).",
    );
  }
  // Tolerate a trailing slash in config so callers can pass `/path` cleanly.
  return API_BASE_URL.replace(/\/+$/, "");
}

export type ApiRequestOptions = Omit<RequestInit, "body"> & {
  /** JSON-serializable request body; serialized and sent as application/json. */
  body?: unknown;
};

/**
 * Make a typed JSON request to the API.
 *
 * @example
 *   const tracks = await apiFetch<Track[]>("/api/tracks/search?q=lofi");
 */
export async function apiFetch<T>(
  path: string,
  { body, headers, ...init }: ApiRequestOptions = {},
): Promise<T> {
  const url = `${resolveBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;

  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    throw new ApiError(res.status, `API request to ${path} failed (${res.status} ${res.statusText})`);
  }

  // 204 No Content (e.g. a successful DELETE) has no body to parse.
  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

/**
 * Lightweight liveness check against the API's `GET /health` endpoint.
 * Returns `true` on a 2xx response, `false` on any error — never throws,
 * so it's safe to call from UI (e.g. a cold-start "waking up" indicator).
 */
export async function pingHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${resolveBaseUrl()}/health`, { cache: "no-store" });
    return res.ok;
  } catch {
    return false;
  }
}
