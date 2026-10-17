"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, FileText, FolderOpen, CalendarDays, Trophy, LayoutGrid,
  ImageIcon, Users, Star, Wrench, FileDown, ListTree, Search, Settings as SettingsIcon,
  LogOut, Menu as MenuIcon, Home, Loader2, ClipboardList,
} from "lucide-react";
import { getSession, clearSession, can, type AdminUser } from "@/lib/auth";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  visible: (u: AdminUser) => boolean;
}

const NAV: { section: string; items: NavItem[] }[] = [
  {
    section: "Utama",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, visible: () => true },
      { href: "/posts", label: "Berita & Artikel", icon: FileText, visible: () => true },
      { href: "/pages", label: "Halaman", icon: FolderOpen, visible: (u) => u.role !== "OSIS" },
      { href: "/agenda", label: "Agenda", icon: CalendarDays, visible: (u) => u.role !== "OSIS" },
      { href: "/prestasi", label: "Prestasi", icon: Trophy, visible: (u) => u.role !== "OSIS" },
      { href: "/aktivitas", label: "Aktivitas Siswa & Santri", icon: ClipboardList, visible: (u) => u.role !== "OSIS" },
      { href: "/galeri", label: "Galeri", icon: ImageIcon, visible: (u) => u.role !== "OSIS" },
    ],
  },
  {
    section: "Kelola",
    items: [
      { href: "/homepage", label: "Konten Beranda", icon: LayoutGrid, visible: (u) => ["SUPER_ADMIN", "ADMIN"].includes(u.role) },
      { href: "/popup", label: "Popup PPDB", icon: ImageIcon, visible: (u) => ["SUPER_ADMIN", "ADMIN"].includes(u.role) },
      { href: "/media", label: "Media", icon: ImageIcon, visible: () => true },
      { href: "/categories", label: "Kategori & Tag", icon: FolderOpen, visible: (u) => u.role !== "OSIS" },
      { href: "/programs", label: "Program & Ekstra", icon: LayoutGrid, visible: (u) => u.role !== "OSIS" },
      { href: "/teachers", label: "Guru & Tendik", icon: Users, visible: (u) => ["SUPER_ADMIN", "ADMIN"].includes(u.role) },
      { href: "/facilities", label: "Fasilitas", icon: Wrench, visible: (u) => ["SUPER_ADMIN", "ADMIN"].includes(u.role) },
      { href: "/ppdb", label: "PPDB", icon: FileDown, visible: (u) => ["SUPER_ADMIN", "ADMIN"].includes(u.role) },
      { href: "/ppdb-list", label: "List PPDB", icon: ClipboardList, visible: (u) => ["SUPER_ADMIN", "ADMIN"].includes(u.role) },
    ],
  },
  {
    section: "Situs & Pengguna",
    items: [
      { href: "/menus", label: "Menu Navigasi", icon: ListTree, visible: (u) => ["SUPER_ADMIN", "ADMIN"].includes(u.role) },
      { href: "/seo", label: "SEO", icon: Search, visible: (u) => ["SUPER_ADMIN", "ADMIN"].includes(u.role) },
      { href: "/users", label: "Pengguna", icon: Users, visible: (u) => ["SUPER_ADMIN", "ADMIN"].includes(u.role) },
      { href: "/settings", label: "Pengaturan", icon: SettingsIcon, visible: (u) => ["SUPER_ADMIN", "ADMIN"].includes(u.role) },
    ],
  },
];

const ROLE_BADGE: Record<string, string> = {
  SUPER_ADMIN: "bg-gold-100 text-gold-500",
  ADMIN: "bg-brand-100 text-brand-700",
  EDITOR: "bg-blue-100 text-blue-700",
  OSIS: "bg-purple-100 text-purple-700",
};

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [checked, setChecked] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.replace("/login");
      return;
    }
    setUser(s.user);
    setChecked(true);
  }, [router]);

  useEffect(() => setDrawerOpen(false), [pathname]);

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" aria-label="Memuat" />
      </div>
    );
  }

  const roleLabel = user ? { SUPER_ADMIN: "Super Admin", ADMIN: "Admin", EDITOR: "Editor", OSIS: "OSIS" }[user.role] : "";

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 border-b border-brand-800/40 px-5 py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-400 font-display font-bold text-brand-800">M</span>
        <div>
          <p className="font-display text-sm font-bold text-white">CMS Mardhotillah</p>
          <p className="text-[11px] text-white/50">Manajemen Konten</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Menu admin">
        {NAV.map((group) => {
          const visibleItems = group.items.filter((i) => user && i.visible(user));
          if (!visibleItems.length) return null;
          return (
            <div key={group.section} className="mb-5">
              <p className="mb-1.5 px-3 text-[11px] font-bold uppercase tracking-wider text-white/40">{group.section}</p>
              <ul className="space-y-0.5">
                {visibleItems.map((item) => {
                  const active = pathname.startsWith(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                          active ? "bg-brand-500 text-white shadow" : "text-white/70 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <item.icon className="h-4 w-4 shrink-0" aria-hidden />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>
      <div className="border-t border-brand-800/40 p-3">
        <Link href="/" target="_blank" className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-white/70 transition hover:bg-white/10 hover:text-white">
          <Home className="h-4 w-4" aria-hidden /> Lihat Website
        </Link>
        <button
          type="button"
          onClick={() => { clearSession(); router.push("/login"); }}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-4 w-4" aria-hidden /> Keluar
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-brand-700 lg:block">{sidebar}</aside>

      {/* Topbar mobile */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-brand-900/10 bg-white px-4 lg:hidden">
        <button type="button" onClick={() => setDrawerOpen(true)} aria-label="Buka menu" className="rounded-lg p-2 hover:bg-brand-50">
          <MenuIcon className="h-5 w-5 text-brand-700" />
        </button>
        <span className="font-display font-bold text-brand-700">CMS Mardhotillah</span>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${ROLE_BADGE[user?.role ?? ""]}`}>{roleLabel}</span>
      </div>
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-brand-900/50" onClick={() => setDrawerOpen(false)} aria-hidden />
          <aside className="absolute inset-y-0 left-0 w-64 bg-brand-700">{sidebar}</aside>
        </div>
      )}

      {/* Konten */}
      <div className="lg:pl-64">
        {/* Header desktop */}
        <header className="hidden h-16 items-center justify-between border-b border-brand-900/10 bg-white px-8 lg:flex">
          <div />
          <div className="flex items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${ROLE_BADGE[user?.role ?? ""]}`}>{roleLabel}</span>
            <div className="text-right">
              <p className="text-sm font-semibold text-ink">{user?.name}</p>
              <p className="text-xs text-ink-soft">{user?.email}</p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 font-display font-bold text-white">
              {user?.name?.charAt(0) ?? "?"}
            </span>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink-soft">{description}</p>}
      </div>
      {action}
    </div>
  );
}
