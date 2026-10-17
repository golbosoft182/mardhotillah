import Link from "next/link";
import { NewsCard } from "@/components/ui/cards";
import { EmptyState, PageHero, Section } from "@/components/ui/section";
import { apiServer, type ListResponse, type Post } from "@/lib/api";

export const revalidate = 60;

export const metadata = {
  title: "Berita",
  description: "Berita dan informasi terbaru dari Yayasan Mardhotillah dan seluruh satuan pendidikan.",
};

const CATEGORIES = [
  { key: "", label: "Semua Kategori" },
  { key: "berita-yayasan", label: "Berita Yayasan" },
  { key: "berita-ponpes", label: "Berita Ponpes" },
  { key: "berita-smp", label: "Berita SMP" },
  { key: "berita-smk", label: "Berita SMK" },
  { key: "event-kegiatan", label: "Event & Kegiatan" },
  { key: "prestasi-capaian", label: "Prestasi & Capaian" },
];

const UNITS = [
  { key: "", label: "Semua Unit" },
  { key: "YAYASAN", label: "Yayasan" },
  { key: "PONPES", label: "Ponpes" },
  { key: "SMP", label: "SMP" },
  { key: "SMK", label: "SMK" },
];

export default async function BeritaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; category?: string; unit?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const q = params.q ?? "";
  const category = params.category ?? "";
  const unit = params.unit ?? "";

  const data = await apiServer<ListResponse<Post>>("/posts", {
    page,
    limit: 9,
    type: "BERITA",
    q: q || undefined,
    category: category || undefined,
    unit: unit || undefined,
  });

  const buildHref = (patch: Record<string, string>) => {
    const next = { q, category, unit, ...patch };
    const qs = Object.entries(next)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");
    return `/berita${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      <PageHero
        title="Berita"
        description="Informasi dan kabar terbaru dari Yayasan Mardhotillah."
        breadcrumbs={[{ label: "Beranda", href: "/" }, { label: "Berita" }]}
      />
      <Section>
        <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter kategori">
            {CATEGORIES.map((c) => (
              <Link
                key={c.key}
                href={buildHref({ category: c.key, page: "" })}
                aria-pressed={category === c.key}
                className={`rounded-full px-4 py-2 text-sm font-display font-semibold transition ${
                  category === c.key
                    ? "bg-brand-500 text-white"
                    : "bg-white text-brand-700 ring-1 ring-brand-200 hover:bg-brand-50"
                }`}
              >
                {c.label}
              </Link>
            ))}
          </div>
          <span className="hidden h-6 w-px bg-brand-100 sm:block" aria-hidden />
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter unit">
            {UNITS.map((u) => (
              <Link
                key={u.key}
                href={buildHref({ unit: u.key, page: "" })}
                aria-pressed={unit === u.key}
                className={`rounded-full px-4 py-2 text-sm font-display font-semibold transition ${
                  unit === u.key
                    ? "bg-gold-400 text-brand-800"
                    : "bg-white text-brand-700 ring-1 ring-brand-200 hover:bg-brand-50"
                }`}
              >
                {u.label}
              </Link>
            ))}
          </div>
        </div>
        <form action="/berita" className="mx-auto mb-10 flex max-w-xl gap-2" role="search">
          <label htmlFor="q" className="sr-only">Cari berita</label>
          <input
            id="q"
            name="q"
            defaultValue={q}
            placeholder="Cari berita..."
            className="w-full rounded-full border border-brand-200 bg-white px-5 py-3 text-sm outline-none transition focus:border-brand-500"
          />
          {category && <input type="hidden" name="category" value={category} />}
          {unit && <input type="hidden" name="unit" value={unit} />}
          <button
            type="submit"
            className="rounded-full bg-brand-500 px-6 py-3 font-display text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Cari
          </button>
        </form>

        {data?.items?.length ? (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.items.map((p) => (
                <NewsCard key={p.id} post={p} />
              ))}
            </div>
            {data.totalPages > 1 && (
              <nav aria-label="Navigasi halaman" className="mt-10 flex justify-center gap-2">
                {Array.from({ length: data.totalPages }).map((_, i) => (
                  <Link
                    key={i}
                    href={buildHref({ page: String(i + 1) })}
                    aria-current={page === i + 1 ? "page" : undefined}
                    className={`flex h-10 w-10 items-center justify-center rounded-full font-display text-sm font-semibold transition ${
                      page === i + 1
                        ? "bg-brand-500 text-white"
                        : "bg-white text-brand-700 ring-1 ring-brand-200 hover:bg-brand-50"
                    }`}
                  >
                    {i + 1}
                  </Link>
                ))}
              </nav>
            )}
          </>
        ) : (
          <EmptyState
            title={q ? `Tidak ada berita untuk "${q}"` : "Belum ada berita"}
            hint={q ? "Coba kata kunci lain." : "Berita akan tampil di sini setelah dipublikasikan."}
          />
        )}
      </Section>
    </>
  );
}
