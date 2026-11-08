export const API_PUBLIC_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3102";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3100";

/** URL internal untuk fetch dari server component (container-to-container) */
const API_INTERNAL = process.env.API_INTERNAL_URL;

export function resolveImageUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("http")) return path;
  return `${API_PUBLIC_URL}/uploads/${path.replace(/^\//, "")}`;
}

type Params = Record<string, string | number | undefined>;

/** Fetch di server component: lewat jaringan docker internal (dengan retry) */
export async function apiServer<T>(path: string, params: Params = {}): Promise<T | null> {
  const base = API_INTERNAL ?? API_PUBLIC_URL;
  const qs = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== "")
      .map(([k, v]) => [k, String(v)]),
  ).toString();
  const url = `${base}/api${path}${qs ? `?${qs}` : ""}`;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { next: { revalidate: 60 } });
      if (!res.ok) return null; // 404/500 dari API — bukan masalah jaringan
      return (await res.json()) as T;
    } catch {
      if (attempt < 2) {
        await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
      }
    }
  }
  return null; // API benar-benar tidak terjangkau
}

/** Fetch di client component: lewat URL publik */
export async function apiClient<T>(path: string, params: Params = {}): Promise<T | null> {
  const qs = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== "")
      .map(([k, v]) => [k, String(v)]),
  ).toString();
  const url = `${API_PUBLIC_URL}/api${path}${qs ? `?${qs}` : ""}`;
  try {
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

// ---------- Types ----------

export type Unit = "YAYASAN" | "PONPES" | "SMP" | "SMK";

export interface ListResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Post {
  id: string;
  unit: Unit;
  type: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  featuredImage?: string;
  ogImage?: string;
  status: string;
  publishedAt?: string;
  seoTitle?: string;
  seoDescription?: string;
  ogTitle?: string;
  ogDescription?: string;
  viewCount: number;
  author?: { id: string; name: string; avatar?: string; bio?: string } | null;
  category?: { id: string; name: string; slug: string } | null;
  tags?: { tag: { id: string; name: string; slug: string } }[];
}

export interface EventItem {
  id: string;
  unit: Unit;
  title: string;
  slug: string;
  description?: string;
  location?: string;
  featuredImage?: string;
  startDate: string;
  endDate?: string;
  allDay: boolean;
}

export interface Achievement {
  id: string;
  unit: Unit;
  studentName: string;
  photo?: string;
  className?: string;
  competition: string;
  category?: string;
  rank?: string;
  organizer?: string;
  year?: number;
  description?: string;
  type: string;
}

export interface Program {
  id: string;
  unit?: Unit | null;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  featured: boolean;
}

export interface GalleryItem {
  id: string;
  url: string;
  caption?: string;
  alt?: string;
}

export interface Gallery {
  id: string;
  unit?: Unit | null;
  title: string;
  slug: string;
  description?: string;
  coverImage?: string;
  kind: string;
  items?: GalleryItem[];
}

export interface MenuItem {
  id: string;
  label: string;
  url: string;
  children?: MenuItem[];
}

export interface MenuResponse {
  id: string | null;
  items: MenuItem[];
}

export interface Settings {
  site_name?: string;
  site_subtitle?: string;
  site_tagline?: string;
  address?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  maps_embed?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
  announcement_text?: string;
  announcement_link?: string;
  hero_title?: string;
  hero_subtitle?: string;
  ponpes_hero?: string;
  smp_hero?: string;
  smk_hero?: string;
}

export interface Page {
  id: string;
  unit?: Unit | null;
  title: string;
  slug: string;
  content?: string;
  heroImage?: string;
  status?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface Facility {
  id: string;
  unit: Unit;
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

export interface Extracurricular {
  id: string;
  unit: Unit;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  schedule?: string;
}

export interface Teacher {
  id: string;
  unit: Unit;
  name: string;
  position?: string;
  subject?: string;
  photo?: string;
  isPimpinan: boolean;
}

export interface PopupData {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  buttonText: string;
  /** Jenjang popup: PONPES/SMP/SMK — null berarti umum (Yayasan) */
  unit?: "PONPES" | "SMP" | "SMK" | "YAYASAN" | null;
  widthDesktop?: number;
  widthTablet?: number;
  widthMobile?: number;
}

export interface HomeSection {
  key: string;
  label: string;
  data: Record<string, unknown>;
}

export interface PpdbData {
  id: string;
  name: string;
  year: string;
  brochureUrl?: string;
  content: { section: string; title?: string; body?: string; data?: unknown; order: number }[];
  faqs: { id: string; question: string; answer: string; order: number }[];
}
