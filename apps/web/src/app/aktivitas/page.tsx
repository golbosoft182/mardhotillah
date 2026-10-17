import Link from "next/link";
import { CtaBand, EmptyState, PageHero, Section } from "@/components/ui/section";
import { apiServer } from "@/lib/api";

export const revalidate = 60;
export const metadata = { title: "Aktivitas Siswa & Santri", description: "Kegiatan aktivitas siswa & santri Yayasan Mardhotillah per satuan pendidikan." };

interface ActivityItem {
  id: string;
  unit: string;
  title: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  category?: string | null;
}

const UNITS = [
  { key: "", label: "Semua Unit" },
  { key: "PONPES", label: "Ponpes" },
  { key: "SMP", label: "SMP" },
  { key: "SMK", label: "SMK" },
];

const UNIT_LABEL: Record<string, string> = { YAYASAN: "Yayasan", PONPES: "Ponpes", SMP: "SMP", SMK: "SMK" };

export default async function AktivitasPage({
  searchParams,
}: {
  searchParams: Promise<{ unit?: string }>;
}) {
  const params = await searchParams;
  const data = await apiServer<{ items: ActivityItem[] }>(
    "/activities",
    { limit: 48, unit: params.unit || undefined },
  );
  const items = data?.items ?? [];

  const buildHref = (unit: string) => `/aktivitas${unit ? `?unit=${unit}` : ""}`;

  return (
    <>
      <PageHero
        title="Aktivitas Siswa & Santri"
        description="Kehidupan sehari-hari, kegiatan akademik, dan pengembangan bakat di seluruh satuan pendidikan Mardhotillah."
        breadcrumbs={[{ label: "Beranda", href: "/" }, { label: "Aktivitas" }]}
      />
      <Section>
        <div className="mb-10 flex flex-wrap items-center justify-center gap-2" role="group" aria-label="Filter unit">
          {UNITS.map((u) => (
            <Link
              key={u.key}
              href={buildHref(u.key)}
              aria-pressed={(params.unit ?? "") === u.key}
              className={`rounded-full px-5 py-2.5 text-sm font-display font-semibold transition ${
                (params.unit ?? "") === u.key
                  ? "bg-brand-500 text-white shadow-card"
                  : "bg-white text-brand-700 ring-1 ring-brand-200 hover:bg-brand-50"
              }`}
            >
              {u.label}
            </Link>
          ))}
        </div>

        {items.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((a) => (
              <article key={a.id} className="group overflow-hidden rounded-2xl bg-white shadow-card transition hover:shadow-lift">
                <div className="relative aspect-[4/3] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={a.image ?? "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=75"}
                    alt={a.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {a.category && (
                    <span className="absolute left-3 top-3 rounded-full bg-brand-500/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                      {a.category}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gold-500">{UNIT_LABEL[a.unit] ?? a.unit}</p>
                  <h3 className="mt-1 font-display text-base font-bold text-ink">{a.title}</h3>
                  {a.description && <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-ink-soft">{a.description}</p>}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="Belum ada aktivitas" hint="Aktivitas siswa & santri akan diperbarui oleh admin." />
        )}
      </Section>
      <Section className="bg-cream">
        <CtaBand />
      </Section>
    </>
  );
}
