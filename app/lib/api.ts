export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export const LOGIN_PATH = "/admin/login";

/** Fired after every successful admin request; the session watcher uses it to reset its idle timer. */
export const SESSION_TOUCH_EVENT = "bfcg:session-touch";

export type SessionInfo = {
  idle_timeout_seconds: number;
  expires_at: string; // absolute limit (ISO date)
};

export type Me = { user: { email: string }; session: SessionInfo };

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

// Tokens used to be kept in localStorage; they now live in httpOnly cookies. Remove any leftover copy.
try {
  if (typeof localStorage !== "undefined") localStorage.removeItem("bfcg.admin.session");
} catch {
  /* ignore */
}

async function readError(res: Response) {
  try {
    const body = await res.json();
    return body?.error ?? `Error ${res.status}`;
  } catch {
    return `Error ${res.status}`;
  }
}

/** Sends the user to the login page; `expired` shows the "session expired" notice there. */
export function goToLogin(expired = false): never {
  window.location.assign(expired ? `${LOGIN_PATH}?expired=1` : LOGIN_PATH);
  throw new ApiError("Sesión expirada.", 401);
}

export async function login(email: string, password: string): Promise<Me> {
  const res = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: "POST",
    credentials: "include", // lets the API set the httpOnly session cookies
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new ApiError(await readError(res), res.status);
  return (await res.json()) as Me;
}

export async function logout() {
  try {
    await fetch(`${API_URL}/api/v1/admin/logout`, { method: "POST", credentials: "include" });
  } finally {
    window.location.assign(LOGIN_PATH);
  }
}

/** Checks for a live session without redirecting (used by the login page). */
export async function currentSession(): Promise<Me | null> {
  try {
    const res = await fetch(`${API_URL}/api/v1/admin/me`, { credentials: "include" });
    return res.ok ? ((await res.json()) as Me) : null;
  } catch {
    return null;
  }
}

/**
 * Request to /api/v1/admin/*. The browser attaches the session cookies; the API refreshes tokens
 * and enforces the idle / absolute limits. A 401 means the session is over: back to the login page.
 */
export async function adminFetch<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_URL}/api/v1/admin${path}`, { ...init, headers, credentials: "include" });

  if (res.status === 401) goToLogin(true);
  if (!res.ok) throw new ApiError(await readError(res), res.status);

  window.dispatchEvent(new Event(SESSION_TOUCH_EVENT));
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export async function uploadImage(file: File): Promise<string> {
  const body = new FormData();
  body.append("image", file);
  const { url } = await adminFetch<{ url: string }>("/upload", { method: "POST", body });
  return url;
}
