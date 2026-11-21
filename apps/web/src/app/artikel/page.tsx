import { EmptyState, PageHero, Section } from "@/components/ui/section";
import { InfiniteList } from "@/components/infinite-list";
import { apiServer, type ListResponse, type Post } from "@/lib/api";

export const revalidate = 60;
export const metadata = { title: "Artikel", description: "Artikel pendidikan dan keislaman." };

export default async function ArtikelPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const q = params.q ?? "";

  const data = await apiServer<ListResponse<Post>>("/posts", {
    limit: 20,
    type: "ARTIKEL",
    q: q || undefined,
  });

  return (
    <>
      <PageHero
        title="Artikel"
        description="Artikel pendidikan, keislaman, dan catatan perjalanan pendidikan kami."
        breadcrumbs={[{ label: "Beranda", href: "/" }, { label: "Artikel" }]}
      />
      <Section>
        <form action="/artikel" className="mx-auto mb-10 flex max-w-xl gap-2" role="search">
          <label htmlFor="q" className="sr-only">Cari artikel</label>
          <input
            id="q"
            name="q"
            defaultValue={q}
            placeholder="Cari artikel..."
            className="w-full rounded-full border border-brand-200 bg-white px-5 py-3 text-sm outline-none transition focus:border-brand-500"
          />
          <button
            type="submit"
            className="rounded-full bg-brand-500 px-6 py-3 font-display text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Cari
          </button>
        </form>

        {data?.items?.length ? (
          <InfiniteList
            key={q}
            endpoint="/posts"
            params={{ type: "ARTIKEL", q: q || undefined }}
            initialItems={data.items}
            initialTotalPages={data.totalPages}
            variant="news"
            basePath="/artikel"
            gridClassName="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          />
        ) : (
          <EmptyState
            title={q ? `Tidak ada artikel untuk "${q}"` : "Belum ada artikel"}
            hint={q ? "Coba kata kunci lain." : "Konten akan tampil di sini setelah dipublikasikan."}
          />
        )}
      </Section>
    </>
  );
}
