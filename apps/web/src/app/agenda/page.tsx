import { EmptyState, PageHero, Section } from "@/components/ui/section";
import { AgendaMonthFilter } from "@/components/agenda-filter";
import { InfiniteList } from "@/components/infinite-list";
import { apiServer, type EventItem, type ListResponse } from "@/lib/api";

export const revalidate = 60;
export const metadata = { title: "Agenda", description: "Agenda dan kalender kegiatan Yayasan Mardhotillah." };

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const month = params.month ?? "";
  const data = await apiServer<ListResponse<EventItem>>("/events", {
    limit: 20,
    sort: "newest",
    month: month || undefined,
  });

  return (
    <>
      <PageHero
        title="Agenda"
        description="Kalender kegiatan dan acara Yayasan Mardhotillah."
        breadcrumbs={[{ label: "Beranda", href: "/" }, { label: "Agenda" }]}
      />
      <Section>
        <AgendaMonthFilter value={month} />
        {data?.items?.length ? (
          <InfiniteList
            key={month}
            endpoint="/events"
            params={{ sort: "newest", month: month || undefined }}
            initialItems={data.items}
            initialTotalPages={data.totalPages}
            variant="event"
            gridClassName="mx-auto grid max-w-4xl gap-4"
          />
        ) : (
          <EmptyState
            title={month ? "Tidak ada agenda pada bulan ini" : "Belum ada agenda"}
            hint="Agenda kegiatan akan segera diumumkan."
          />
        )}
      </Section>
    </>
  );
}
