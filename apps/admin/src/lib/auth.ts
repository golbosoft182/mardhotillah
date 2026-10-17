"use client";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3102";

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

/** Fetch dengan access token; auto-refresh sekali bila 401 */
export async function api<T>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  const session = getSession();
  const doFetch = async (token: string | null) =>
    fetch(`${API_URL}/api${path}`, {
      method: options.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });

  let res = await doFetch(session?.accessToken ?? null);

  if (res.status === 401 && session?.refreshToken) {
    const refreshRes = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: session.refreshToken }),
    });
    if (refreshRes.ok) {
      const newSession = (await refreshRes.json()) as Session;
      setSession(newSession);
      res = await doFetch(newSession.accessToken);
    } else {
      clearSession();
      window.location.href = "/login";
      throw new Error("Sesi berakhir, silakan login kembali");
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Terjadi kesalahan" }));
    throw new Error(Array.isArray(err.message) ? err.message.join(", ") : err.message ?? `Error ${res.status}`);
  }
  return (await res.json()) as T;
}
