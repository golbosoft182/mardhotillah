import type { MetadataRoute } from "next";
import { apiServer, SITE_URL, type ListResponse, type Post } from "@/lib/api";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL;
  const staticRoutes = [
    "",
    "/ponpes",
    "/smp",
    "/smk",
    "/ppdb",
    "/berita",
    "/artikel",
    "/opini",
    "/pojok-siswa",
    "/agenda",
    "/prestasi",
    "/galeri",
    "/program",
    "/fasilitas",
    "/kontak",
    "/tentang/profil",
    "/tentang/sejarah",
    "/tentang/visi-misi",
    "/tentang/struktur",
    "/tentang/legalitas",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const posts = await apiServer<ListResponse<Post>>("/posts", { limit: 50 });
  const postRoutes = (posts?.items ?? []).map((p) => ({
    url: `${base}/berita/${p.slug}`,
    lastModified: p.publishedAt ? new Date(p.publishedAt) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...postRoutes];
}
