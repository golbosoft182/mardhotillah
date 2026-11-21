import { EmptyState, PageHero, Section } from "@/components/ui/section";
import { AgendaMonthFilter } from "@/components/agenda-filter";
import { InfiniteList } from "@/components/infinite-list";
import { apiServer, type KesiswaanProgram, type ListResponse } from "@/lib/api";

export const revalidate = 60;
export const metadata = {
  title: "Program Kerja Waka Kesiswaan",
  description: "Program kerja dan kegiatan bidang kesiswaan Yayasan Mardhotillah.",
};

const BASE_PATH = "/program-kerja-waka-kesiswaan";

export default async function ProgramKerjaKesiswaanPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const month = params.month ?? "";
  const data = await apiServer<ListResponse<KesiswaanProgram>>("/kesiswaan-programs", {
    limit: 20,
    sort: "newest",
    month: month || undefined,
  });

  return (
    <>
      <PageHero
        title="Program Kerja Waka Kesiswaan"
        description="Program kerja dan kegiatan bidang kesiswaan Yayasan Mardhotillah."
        breadcrumbs={[{ label: "Beranda", href: "/" }, { label: "Program Kerja Waka Kesiswaan" }]}
      />
      <Section>
        <AgendaMonthFilter value={month} basePath={BASE_PATH} />
        {data?.items?.length ? (
          <InfiniteList
            key={month}
            endpoint="/kesiswaan-programs"
            params={{ sort: "newest", month: month || undefined }}
            initialItems={data.items}
            initialTotalPages={data.totalPages}
            variant="program"
            gridClassName="mx-auto grid max-w-4xl gap-4"
          />
        ) : (
          <EmptyState
            title={month ? "Tidak ada program pada bulan ini" : "Belum ada program kerja"}
            hint="Program kerja kesiswaan akan segera diumumkan."
          />
        )}
      </Section>
    </>
  );
}
