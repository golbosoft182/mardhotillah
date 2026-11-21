import { CtaBand, EmptyState, PageHero, Section } from "@/components/ui/section";
import { InfiniteList } from "@/components/infinite-list";
import { apiServer, type Achievement, type ListResponse } from "@/lib/api";

// Render on demand: data selalu segar di setiap request (API tidak tersedia saat build).
export const dynamic = "force-dynamic";
export const metadata = { title: "Prestasi" };

export default async function PrestasiPage() {
  const data = await apiServer<ListResponse<Achievement>>("/achievements", { limit: 20, sort: "newest" });

  return (
    <>
      <PageHero
        title="Wall of Fame"
        description="Capaian siswa, santri, guru, dan lembaga yang membanggakan."
        breadcrumbs={[{ label: "Beranda", href: "/" }, { label: "Prestasi" }]}
      />
      <Section>
        {data?.items?.length ? (
          <InfiniteList
            endpoint="/achievements"
            params={{ sort: "newest" }}
            initialItems={data.items}
            initialTotalPages={data.totalPages}
            variant="achievement"
            gridClassName="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          />
        ) : (
          <EmptyState title="Belum ada data prestasi" hint="[Data Prestasi] — akan diperbarui oleh admin." />
        )}
      </Section>
      <Section className="bg-cream">
        <CtaBand />
      </Section>
    </>
  );
}
