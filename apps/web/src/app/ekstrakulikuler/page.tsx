import { CtaBand, EmptyState, PageHero, Section } from "@/components/ui/section";
import { InfiniteList } from "@/components/infinite-list";
import { apiServer, type Activity, type ListResponse } from "@/lib/api";

// Render on demand: data selalu segar di setiap request (API tidak tersedia saat build).
export const dynamic = "force-dynamic";
export const metadata = { title: "Ekstrakulikuler", description: "Kegiatan ekstrakulikuler siswa & santri Yayasan Mardhotillah per satuan pendidikan." };

export default async function EkstrakulikulerPage() {
  const data = await apiServer<ListResponse<Activity>>("/activities", { limit: 20, sort: "newest" });
  const items = data?.items ?? [];

  return (
    <>
      <PageHero
        title="Ekstrakulikuler"
        description="Kehidupan sehari-hari, kegiatan akademik, dan pengembangan bakat di seluruh satuan pendidikan Mardhotillah."
        breadcrumbs={[{ label: "Beranda", href: "/" }, { label: "Ekstrakulikuler" }]}
      />
      <Section>
        {items.length ? (
          <InfiniteList
            endpoint="/activities"
            params={{ sort: "newest" }}
            initialItems={items}
            initialTotalPages={data?.totalPages ?? 1}
            variant="activity"
            gridClassName="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          />
        ) : (
          <EmptyState title="Belum ada ekstrakulikuler" hint="Kegiatan ekstrakulikuler siswa & santri akan diperbarui oleh admin." />
        )}
      </Section>
      <Section className="bg-cream">
        <CtaBand />
      </Section>
    </>
  );
}
