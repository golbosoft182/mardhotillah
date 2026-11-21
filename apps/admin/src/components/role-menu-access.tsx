"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { api } from "@/lib/auth";
import { MENU_CATALOG, ROLE_LABELS, defaultMenusForRole, type MenuRole } from "@/components/shell";
import { AdminCard, ErrorAlert, PrimaryButton, SuccessAlert } from "@/components/ui";

/** Peran yang bisa diatur akses menunya (Super Admin selalu punya akses penuh). */
const EDITABLE_ROLES: MenuRole[] = ["ADMIN", "EDITOR", "OSIS"];

/** Menu yang tidak dapat dimatikan (agar pengguna tidak terkunci dari CMS). */
const ALWAYS_ON = new Set(["/dashboard"]);

export function RoleMenuAccess() {
  const [role, setRole] = useState<MenuRole>("EDITOR");
  const [menusByRole, setMenusByRole] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const map: Record<string, string[]> = {};
      for (const r of EDITABLE_ROLES) map[r] = defaultMenusForRole(r);
      try {
        const rows = await api<{ role: string; menus: string[] }[]>("/role-menus");
        for (const row of rows) {
          if (EDITABLE_ROLES.includes(row.role as MenuRole)) map[row.role] = row.menus ?? [];
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Gagal memuat pengaturan akses menu");
      } finally {
        setLoading(false);
      }
      setMenusByRole(map);
    })();
  }, []);

  const selected = menusByRole[role] ?? [];

  function toggle(href: string) {
    if (ALWAYS_ON.has(href)) return;
    setSuccess(null);
    setMenusByRole((prev) => {
      const list = prev[role] ?? [];
      const next = list.includes(href) ? list.filter((h) => h !== href) : [...list, href];
      return { ...prev, [role]: next };
    });
  }

  function toggleSection(hrefs: string[], on: boolean) {
    setSuccess(null);
    setMenusByRole((prev) => {
      const list = new Set(prev[role] ?? []);
      for (const h of hrefs) {
        if (ALWAYS_ON.has(h)) { list.add(h); continue; }
        if (on) list.add(h);
        else list.delete(h);
      }
      return { ...prev, [role]: [...list] };
    });
  }

  async function save() {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await api(`/role-menus/${role}`, { method: "PUT", body: { menus: menusByRole[role] ?? [] } });
      setSuccess(`Akses menu untuk peran ${ROLE_LABELS[role]} tersimpan`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminCard className="mt-6 p-6">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold text-ink">Akses Menu per Peran</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Tentukan menu CMS yang dapat diakses tiap peran. Super Admin selalu memiliki akses penuh.
          </p>
        </div>
        <PrimaryButton type="button" onClick={save} disabled={saving || loading}>
          <Save className="h-4 w-4" aria-hidden /> {saving ? "Menyimpan..." : "Simpan Akses"}
        </PrimaryButton>
      </div>

      <ErrorAlert message={error} />
      <SuccessAlert message={success} />

      {/* Tab peran */}
      <div className="mt-4 flex flex-wrap gap-2 border-b border-brand-100 pb-3">
        {EDITABLE_ROLES.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => { setRole(r); setSuccess(null); }}
            aria-pressed={role === r}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              role === r ? "bg-brand-500 text-white" : "bg-brand-50 text-brand-700 hover:bg-brand-100"
            }`}
          >
            {ROLE_LABELS[r]}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-ink-soft">Memuat...</p>
      ) : (
        <div className="mt-5 space-y-6">
          {MENU_CATALOG.map((group) => {
            const hrefs = group.items.map((i) => i.href);
            const allOn = hrefs.every((h) => selected.includes(h));
            return (
              <div key={group.section}>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">{group.section}</p>
                  <button
                    type="button"
                    onClick={() => toggleSection(hrefs, !allOn)}
                    className="text-xs font-semibold text-brand-600 hover:underline"
                  >
                    {allOn ? "Kosongkan" : "Pilih semua"}
                  </button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {group.items.map((item) => {
                    const locked = ALWAYS_ON.has(item.href);
                    const on = locked || selected.includes(item.href);
                    return (
                      <label
                        key={item.href}
                        className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition ${
                          on ? "border-brand-200 bg-brand-50/60 text-ink" : "border-brand-100 bg-white text-ink-soft"
                        } ${locked ? "opacity-70" : "cursor-pointer hover:border-brand-300"}`}
                      >
                        <input
                          type="checkbox"
                          checked={on}
                          disabled={locked}
                          onChange={() => toggle(item.href)}
                          className="h-4 w-4 rounded border-brand-300 text-brand-500"
                        />
                        <span className="font-medium">{item.label}</span>
                        {locked && <span className="ml-auto text-[10px] uppercase tracking-wide text-ink-soft">wajib</span>}
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminCard>
  );
}
