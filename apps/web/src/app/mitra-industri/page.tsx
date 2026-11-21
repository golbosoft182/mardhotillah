import { EmptyState, PageHero, Section } from "@/components/ui/section";
import { InfiniteList } from "@/components/infinite-list";
import { apiServer, type IndustryPartner, type ListResponse } from "@/lib/api";

export const revalidate = 60;

export const metadata = {
  title: "Mitra Industri",
  description:
    "Kemitraan dunia usaha dan industri (DUDI) Yayasan Mardhotillah — perusahaan mitra yang mendukung pendidikan dan penyaluran kerja siswa.",
};

export default async function MitraIndustriPage() {
  const data = await apiServer<ListResponse<IndustryPartner>>("/industry-partners", { limit: 20 });

  return (
    <>
      <PageHero
        title="Mitra Industri"
        description="Kemitraan Dunia Usaha dan Industri (DUDI) yang bekerja sama dengan Yayasan Mardhotillah."
        breadcrumbs={[{ label: "Beranda", href: "/" }, { label: "Mitra Industri" }]}
      />
      <Section>
        {data?.items?.length ? (
          <InfiniteList
            endpoint="/industry-partners"
            initialItems={data.items}
            initialTotalPages={data.totalPages}
            variant="partner"
            gridClassName="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          />
        ) : (
          <EmptyState
            title="Belum ada data mitra industri"
            hint="Daftar mitra industri akan diperbarui oleh admin."
          />
        )}
      </Section>
    </>
  );
}
