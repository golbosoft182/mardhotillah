import { EventCard } from "@/components/ui/cards";
import { EmptyState, PageHero, Section } from "@/components/ui/section";
import { apiServer, type EventItem } from "@/lib/api";

export const revalidate = 60;
export const metadata = { title: "Agenda", description: "Agenda dan kalender kegiatan Yayasan Mardhotillah." };

const UNITS = [
  { key: "", label: "Semua Unit" },
  { key: "YAYASAN", label: "Yayasan" },
  { key: "PONPES", label: "Ponpes" },
  { key: "SMP", label: "SMP" },
  { key: "SMK", label: "SMK" },
];

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ unit?: string }>;
}) {
  const params = await searchParams;
  const unit = params.unit ?? "";
  const data = await apiServer<{ items: EventItem[] }>("/events", {
    limit: 24,
    unit: unit || undefined,
  });

  return (
    <>
      <PageHero
        title="Agenda"
        description="Kalender kegiatan dan acara Yayasan Mardhotillah."
        breadcrumbs={[{ label: "Beranda", href: "/" }, { label: "Agenda" }]}
      />
      <Section>
        <div className="mb-10 flex flex-wrap items-center justify-center gap-2" role="group" aria-label="Filter unit">
          {UNITS.map((u) => (
            <a
              key={u.key}
              href={`/agenda${u.key ? `?unit=${u.key}` : ""}`}
              aria-pressed={unit === u.key}
              className={`rounded-full px-5 py-2.5 text-sm font-display font-semibold transition ${
                unit === u.key
                  ? "bg-brand-500 text-white shadow-card"
                  : "bg-white text-brand-700 ring-1 ring-brand-200 hover:bg-brand-50"
              }`}
            >
              {u.label}
            </a>
          ))}
        </div>
        {data?.items?.length ? (
          <div className="mx-auto grid max-w-4xl gap-4">
            {data.items.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        ) : (
          <EmptyState title="Belum ada agenda mendatang" hint="Agenda kegiatan akan segera diumumkan." />
        )}
      </Section>
    </>
  );
}
