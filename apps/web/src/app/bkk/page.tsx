import { EmptyState, PageHero, Section } from "@/components/ui/section";
import { BkkFilter } from "@/components/bkk-filter";
import { InfiniteList } from "@/components/infinite-list";
import { apiServer, type JobVacancy, type ListResponse } from "@/lib/api";

export const revalidate = 60;

export const metadata = {
  title: "Bursa Kerja Khusus",
  description: "Informasi lowongan kerja dari mitra industri dan perusahaan untuk siswa dan alumni Mardhotillah.",
};

export default async function BkkPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const company = sp.company ?? "";
  const position = sp.position ?? "";
  const from = sp.from ?? "";
  const to = sp.to ?? "";
  const sort = sp.sort ?? "newest";

  const [data, options] = await Promise.all([
    apiServer<ListResponse<JobVacancy>>("/job-vacancies", {
      limit: 20,
      status: "PUBLISHED",
      company: company || undefined,
      position: position || undefined,
      from: from || undefined,
      to: to || undefined,
      sort,
    }),
    apiServer<{ companies: string[]; positions: string[] }>("/job-vacancies/filters"),
  ]);

  return (
    <>
      <PageHero
        title="Bursa Kerja Khusus"
        description="Lowongan kerja dari mitra industri dan perusahaan untuk siswa serta alumni Yayasan Mardhotillah."
        breadcrumbs={[{ label: "Beranda", href: "/" }, { label: "Bursa Kerja Khusus" }]}
      />
      <Section>
        <BkkFilter
          companies={options?.companies ?? []}
          positions={options?.positions ?? []}
          value={{ company, position, from, to, sort }}
        />
        {data?.items?.length ? (
          <InfiniteList
            key={`${company}|${position}|${from}|${to}|${sort}`}
            endpoint="/job-vacancies"
            params={{
              status: "PUBLISHED",
              sort,
              company: company || undefined,
              position: position || undefined,
              from: from || undefined,
              to: to || undefined,
            }}
            initialItems={data.items}
            initialTotalPages={data.totalPages}
            variant="vacancy"
            gridClassName="grid gap-5 md:grid-cols-2"
          />
        ) : (
          <EmptyState
            title="Tidak ada lowongan ditemukan"
            hint="Coba ubah filter perusahaan, posisi, atau rentang tanggal."
          />
        )}
      </Section>
    </>
  );
}
