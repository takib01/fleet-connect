/**
 * Thin REST client.
 *
 * - prepends VITE_API_BASE_URL
 * - attaches the staff JWT
 * - handles JSON + multipart/form-data bodies
 * - normalises API errors into ApiError
 * - handles 401 globally (clears session + returns staff to /login)
 *
 * While VITE_API_BASE_URL is unset the app runs on the in-memory mock
 * implementations in `src/api/mock`, so swapping to the real backend is a
 * matter of setting the env var.
 */

const TOKEN_KEY = "vrms.token";
const USER_KEY = "vrms.user";

export const API_BASE_URL: string = import.meta.env["VITE_API_BASE_URL"] ?? "";
export const USE_MOCK_API = API_BASE_URL.trim() === "";

export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string> | undefined;

  constructor(message: string, status: number, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }

  get isConflict() {
    return this.status === 409;
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setSession(token: string, user: unknown) {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getStoredUser<T>(): T | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

function onUnauthorized() {
  clearSession();
  if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
    window.location.assign("/login?expired=1");
  }
}

export function buildQuery(params: Record<string, string | number | undefined | null>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.set(key, String(value));
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  /** Skip the JWT header (login) */
  anonymous?: boolean;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, anonymous } = options;
  const headers: Record<string, string> = { Accept: "application/json" };

  if (!anonymous) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let payload: BodyInit | undefined;
  if (body instanceof FormData) {
    payload = body; // let the browser set the multipart boundary
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { method, headers, body: payload ?? null });
  } catch {
    throw new ApiError("Unable to reach the server. Check your connection and try again.", 0);
  }

  if (response.status === 401) {
    onUnauthorized();
    throw new ApiError("Your session has expired. Please sign in again.", 401);
  }

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    const record = (data ?? {}) as Record<string, unknown>;
    const message =
      (typeof record["message"] === "string" && record["message"]) ||
      (typeof record["error"] === "string" && record["error"]) ||
      defaultMessageForStatus(response.status);
    throw new ApiError(message, response.status, normaliseFieldErrors(record["errors"]));
  }

  const record = data as Record<string, unknown> | null;
  if (record && "data" in record && Object.keys(record).length <= 3) {
    return record["data"] as T;
  }
  return data as T;
}

function normaliseFieldErrors(errors: unknown): Record<string, string> | undefined {
  if (!errors || typeof errors !== "object") return undefined;
  const out: Record<string, string> = {};
  Object.entries(errors as Record<string, unknown>).forEach(([key, value]) => {
    out[key] = Array.isArray(value) ? String(value[0]) : String(value);
  });
  return out;
}

function defaultMessageForStatus(status: number) {
  switch (status) {
    case 400:
      return "The request could not be processed. Please review the form and try again.";
    case 403:
      return "You do not have permission to perform this action.";
    case 404:
      return "The requested record could not be found.";
    case 409:
      return "This action conflicts with an existing record.";
    case 422:
      return "Some of the submitted values are invalid.";
    case 429:
      return "Too many attempts. Please wait a moment and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}
