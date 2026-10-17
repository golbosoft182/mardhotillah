import Link from "next/link";
import { SectionHeading } from "@/components/ui/container";
import { AchievementCard } from "@/components/ui/cards";
import { CtaBand, EmptyState, PageHero, Section } from "@/components/ui/section";
import { apiServer, type Achievement } from "@/lib/api";

export const revalidate = 60;
export const metadata = { title: "Prestasi" };

const TYPES = [
  { key: "", label: "Semua" },
  { key: "SISWA", label: "Siswa" },
  { key: "GURU", label: "Guru" },
  { key: "LEMBAGA", label: "Lembaga" },
];

const UNITS = [
  { key: "", label: "Semua Unit" },
  { key: "PONPES", label: "Ponpes" },
  { key: "SMP", label: "SMP" },
  { key: "SMK", label: "SMK" },
];

export default async function PrestasiPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; unit?: string; year?: string }>;
}) {
  const params = await searchParams;
  const data = await apiServer<{ items: Achievement[]; total: number }>("/achievements", {
    limit: 24,
    type: params.type || undefined,
    unit: params.unit || undefined,
    year: params.year || undefined,
  });

  const buildHref = (patch: Record<string, string>) => {
    const next = { type: params.type ?? "", unit: params.unit ?? "", year: params.year ?? "", ...patch };
    const qs = Object.entries(next)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");
    return `/prestasi${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      <PageHero
        title="Wall of Fame"
        description="Capaian siswa, santri, guru, dan lembaga yang membanggakan."
        breadcrumbs={[{ label: "Beranda", href: "/" }, { label: "Prestasi" }]}
      />
      <Section>
        <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter jenis prestasi">
            {TYPES.map((t) => (
              <Link
                key={t.key}
                href={buildHref({ type: t.key })}
                aria-pressed={params.type === t.key}
                className={`rounded-full px-4 py-2 text-sm font-display font-semibold transition ${
                  (params.type ?? "") === t.key
                    ? "bg-brand-500 text-white"
                    : "bg-white text-brand-700 ring-1 ring-brand-200 hover:bg-brand-50"
                }`}
              >
                {t.label}
              </Link>
            ))}
          </div>
          <span className="hidden h-6 w-px bg-brand-100 sm:block" aria-hidden />
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter unit">
            {UNITS.map((u) => (
              <Link
                key={u.key}
                href={buildHref({ unit: u.key })}
                aria-pressed={params.unit === u.key}
                className={`rounded-full px-4 py-2 text-sm font-display font-semibold transition ${
                  (params.unit ?? "") === u.key
                    ? "bg-gold-400 text-brand-800"
                    : "bg-white text-brand-700 ring-1 ring-brand-200 hover:bg-brand-50"
                }`}
              >
                {u.label}
              </Link>
            ))}
          </div>
        </div>

        {data?.items?.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {data.items.map((a) => (
              <AchievementCard key={a.id} item={a} />
            ))}
          </div>
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
