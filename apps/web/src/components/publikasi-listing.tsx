import { NewsCard } from "@/components/ui/cards";
import { EmptyState, PageHero, Section } from "@/components/ui/section";
import { apiServer, type ListResponse, type Post } from "@/lib/api";

export function PublikasiListing({
  type,
  title,
  description,
  basePath,
}: {
  type: string;
  title: string;
  description: string;
  basePath: string;
}) {
  return Listing({ type, title, description, basePath });
}

async function Listing({
  type,
  title,
  description,
  basePath,
}: {
  type: string;
  title: string;
  description: string;
  basePath: string;
}) {
  const data = await apiServer<ListResponse<Post>>("/posts", { limit: 12, type });

  return (
    <>
      <PageHero title={title} description={description} breadcrumbs={[{ label: "Beranda", href: "/" }, { label: title }]} />
      <Section>
        {data?.items?.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((p) => (
              <NewsCard key={p.id} post={p} basePath={basePath} />
            ))}
          </div>
          ) : (
          <EmptyState
            title={`Belum ada ${title.toLowerCase()}`}
            hint="Konten akan tampil di sini setelah dipublikasikan."
          />
        )}
      </Section>
    </>
  );
}
