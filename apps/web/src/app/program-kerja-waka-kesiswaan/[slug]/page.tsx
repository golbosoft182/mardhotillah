import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Target, UserRound } from "lucide-react";
import { PageHero, Section } from "@/components/ui/section";
import { apiServer, type KesiswaanProgram } from "@/lib/api";
import { formatEventTime } from "@/lib/site";

export const revalidate = 60;

async function getProgram(slug: string): Promise<KesiswaanProgram | null> {
  return apiServer<KesiswaanProgram>(`/kesiswaan-programs/slug/${slug}`);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const program = await getProgram(slug);
  return {
    title: program?.title ?? "Program Kerja Waka Kesiswaan",
    description: program?.description,
  };
}

export default async function ProgramKerjaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const program = await getProgram(slug);
  if (!program) notFound();

  return (
    <>
      <PageHero
        title={program.title}
        description={program.description ?? undefined}
        breadcrumbs={[
          { label: "Beranda", href: "/" },
          { label: "Program Kerja Waka Kesiswaan", href: "/program-kerja-waka-kesiswaan" },
          { label: program.title },
        ]}
      />
      <Section className="bg-cream">
        <div className="mx-auto">
          <article className="overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-brand-900/5">
            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-soft">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-brand-500" aria-hidden />
                  {formatEventTime(program)}
                </span>
                {program.personInCharge && (
                  <span className="inline-flex items-center gap-2">
                    <UserRound className="h-4 w-4 text-brand-500" aria-hidden />
                    {program.personInCharge}
                  </span>
                )}
              </div>
              {program.objective && (
                <div className="mt-6">
                  <h2 className="mb-1.5 inline-flex items-center gap-2 font-display text-lg font-bold text-ink">
                    <Target className="h-4 w-4 text-brand-500" aria-hidden /> Tujuan
                  </h2>
                  <p className="leading-relaxed text-ink-soft">{program.objective}</p>
                </div>
              )}
              {program.description && (
                <div className="mt-6">
                  <h2 className="mb-1.5 font-display text-lg font-bold text-ink">Uraian Kegiatan</h2>
                  <p className="leading-relaxed text-ink-soft">{program.description}</p>
                </div>
              )}
              <p className="mt-6 rounded-xl bg-brand-50 p-4 text-sm text-ink-soft">
                Informasi program kerja ini dapat berubah. Silakan hubungi kami melalui halaman{" "}
                <Link href="/kontak" className="font-semibold text-brand-600 underline underline-offset-2">
                  Kontak
                </Link>{" "}
                untuk konfirmasi.
              </p>
            </div>
          </article>
          <div className="mt-6 text-center">
            <Link
              href="/program-kerja-waka-kesiswaan"
              className="text-sm font-semibold text-brand-600 underline-offset-4 hover:underline"
            >
              ← Kembali ke daftar program kerja
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
