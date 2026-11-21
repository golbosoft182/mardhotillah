"use client";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3102";

/** basePath admin (di-inline saat build lewat `env` di next.config); kosong di dev. */
const BASE_PATH = process.env.NEXT_PUBLIC_ADMIN_BASE_PATH ?? "";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "EDITOR" | "OSIS";
  unit: string | null;
}

export interface Session {
  user: AdminUser;
  accessToken: string;
  refreshToken: string;
}

const KEY = "ym_session";

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function setSession(s: Session) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function clearSession() {
  localStorage.removeItem(KEY);
}

/** Role capability map — digunakan untuk menampilkan/menyembunyikan menu */
export const CAPABILITIES = {
  "SUPER_ADMIN": {
    canManageUsers: true,
    canDelete: true,
    canPublish: true,
    canManageSettings: true,
    canManageMenus: true,
    canManagePpdb: true,
    maxRole: "all" as const,
    label: "Super Admin",
  },
  "ADMIN": {
    canManageUsers: true,
    canDelete: true,
    canPublish: true,
    canManageSettings: true,
    canManageMenus: true,
    canManagePpdb: true,
    maxRole: "ADMIN" as const,
    label: "Admin",
  },
  "EDITOR": {
    canManageUsers: false,
    canDelete: false,
    canPublish: true,
    canManageSettings: false,
    canManageMenus: false,
    canManagePpdb: false,
    maxRole: "EDITOR" as const,
    label: "Editor",
  },
  "OSIS": {
    canManageUsers: false,
    canDelete: false,
    canPublish: false, // OSIS tidak bisa publish — hanya Draft/Review
    canManageSettings: false,
    canManageMenus: false,
    canManagePpdb: false,
    maxRole: "OSIS" as const,
    label: "OSIS",
  },
};

export type CapabilityKey = keyof typeof CAPABILITIES;

export function can(user: AdminUser | null, capability: string): boolean {
  if (!user) return false;
  const caps = CAPABILITIES[user.role] as unknown as Record<string, unknown>;
  return Boolean(caps?.[capability]);
}

/** True bila JWT mendekati kedaluwarsa (default ≤60 detik sebelum exp). */
function isTokenExpiring(token: string, skewMs = 60_000): boolean {
  try {
    const base64 = token.split(".")[1]?.replace(/-/g, "+").replace(/_/g, "/");
    if (!base64) return false;
    const payload = JSON.parse(atob(base64)) as { exp?: number };
    if (typeof payload.exp !== "number") return false;
    return payload.exp * 1000 - Date.now() <= skewMs;
  } catch {
    return false;
  }
}

// Single-flight: request bersamaan berbagi satu proses refresh yang sama, sehingga
// refresh token (rotasi sekali pakai) tidak saling membatalkan saat banyak request 401.
let refreshPromise: Promise<Session | null> | null = null;

function refreshSession(): Promise<Session | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const current = getSession();
      if (!current?.refreshToken) return null;
      const res = await fetch(`${API_URL}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: current.refreshToken }),
      });
      if (!res.ok) return null;
      const next = (await res.json()) as Session;
      setSession(next);
      return next;
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

function forceLogout(): never {
  clearSession();
  window.location.href = `${BASE_PATH}/login`;
  throw new Error("Sesi berakhir, silakan login kembali");
}

/** Fetch dengan access token; refresh proaktif bila token kedaluwarsa/mendekati. */
export async function api<T>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  const doFetch = (token: string | null) =>
    fetch(`${API_URL}/api${path}`, {
      method: options.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });

  let session = getSession();

  // Refresh lebih dulu agar tidak memicu 401 (menghindari spam error di console).
  if (session?.refreshToken && session.accessToken && isTokenExpiring(session.accessToken)) {
    const refreshed = await refreshSession();
    if (refreshed) session = refreshed;
  }

  let res = await doFetch(session?.accessToken ?? null);

  if (res.status === 401 && session?.refreshToken) {
    const refreshed = await refreshSession();
    if (refreshed) {
      res = await doFetch(refreshed.accessToken);
    } else {
      forceLogout();
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Terjadi kesalahan" }));
    throw new Error(Array.isArray(err.message) ? err.message.join(", ") : err.message ?? `Error ${res.status}`);
  }
  return (await res.json()) as T;
}
