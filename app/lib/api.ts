export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export const LOGIN_PATH = "/admin/login";
const SESSION_KEY = "bfcg.admin.session";

export type Session = {
  access_token: string;
  refresh_token: string;
  expires_at?: number; // unix seconds
  user: { id: string; email: string };
};

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

// ── session storage (browser only) ──

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function setSession(session: Session) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    /* storage unavailable: session lasts for this page only */
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

// ── requests ──

async function readError(res: Response) {
  try {
    const body = await res.json();
    return body?.error ?? `Error ${res.status}`;
  } catch {
    return `Error ${res.status}`;
  }
}

export async function login(email: string, password: string): Promise<Session> {
  const res = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new ApiError(await readError(res), res.status);
  const session = (await res.json()) as Session;
  setSession(session);
  return session;
}

export function logout() {
  clearSession();
  window.location.assign(LOGIN_PATH);
}

let refreshing: Promise<Session | null> | null = null;

/** Exchanges the refresh token for a new session; concurrent callers share one request. */
function refreshSession(current: Session): Promise<Session | null> {
  refreshing ??= (async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: current.refresh_token }),
      });
      if (!res.ok) return null;
      const next = (await res.json()) as Session;
      setSession(next);
      return next;
    } catch {
      return null;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

function sendToLogin(): never {
  clearSession();
  window.location.assign(LOGIN_PATH);
  throw new ApiError("Sesión expirada.", 401);
}

/**
 * Authenticated request to /api/v1/admin/*. Refreshes the token when it is about to expire
 * or the API answers 401; if that fails, the user is sent back to the login page.
 */
export async function adminFetch<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  let session = getSession();
  if (!session) sendToLogin();

  const expiresSoon = session.expires_at && session.expires_at * 1000 < Date.now() + 60_000;
  if (expiresSoon) session = (await refreshSession(session)) ?? sendToLogin();

  const send = (token: string) => {
    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${token}`);
    if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    return fetch(`${API_URL}/api/v1/admin${path}`, { ...init, headers });
  };

  let res = await send(session.access_token);
  if (res.status === 401) {
    session = (await refreshSession(session)) ?? sendToLogin();
    res = await send(session.access_token);
    if (res.status === 401) sendToLogin();
  }

  if (!res.ok) throw new ApiError(await readError(res), res.status);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export async function uploadImage(file: File): Promise<string> {
  const body = new FormData();
  body.append("image", file);
  const { url } = await adminFetch<{ url: string }>("/upload", { method: "POST", body });
  return url;
}
