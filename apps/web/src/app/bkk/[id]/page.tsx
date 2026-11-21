import Link from "next/link";
import { notFound } from "next/navigation";
import { Briefcase, Building2, CalendarDays, Clock, Mail, MapPin, Wallet } from "lucide-react";
import { PageHero, Section } from "@/components/ui/section";
import { apiServer, resolveImageUrl, type JobVacancy } from "@/lib/api";
import { formatDate } from "@/lib/site";

export const revalidate = 60;

async function getVacancy(id: string): Promise<JobVacancy | null> {
  return apiServer<JobVacancy>(`/job-vacancies/${id}`);
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vacancy = await getVacancy(id);
  return {
    title: vacancy ? `${vacancy.position} — ${vacancy.company}` : "Detail Lowongan",
    description: vacancy?.description ?? undefined,
  };
}

export default async function BkkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vacancy = await getVacancy(id);
  if (!vacancy) notFound();

  const img = resolveImageUrl(vacancy.image);
  const posted = vacancy.postedAt ? formatDate(vacancy.postedAt) : null;
  const deadline = vacancy.deadline ? formatDate(vacancy.deadline) : null;

  const facts = [
    vacancy.employmentType && {
      icon: Clock,
      label: "Jenis Pekerjaan",
      value: vacancy.employmentType,
    },
    vacancy.location && { icon: MapPin, label: "Lokasi", value: vacancy.location },
    vacancy.salary && { icon: Wallet, label: "Gaji", value: vacancy.salary },
    posted && { icon: CalendarDays, label: "Tanggal Terbit", value: posted },
    deadline && { icon: CalendarDays, label: "Batas Lamaran", value: deadline },
    vacancy.contact && { icon: Mail, label: "Kontak", value: vacancy.contact },
  ].filter(Boolean) as { icon: typeof Clock; label: string; value: string }[];

  return (
    <>
      <PageHero
        title={vacancy.position}
        description={`${vacancy.company}${vacancy.location ? ` · ${vacancy.location}` : ""}`}
        breadcrumbs={[
          { label: "Beranda", href: "/" },
          { label: "Bursa Kerja Khusus", href: "/bkk" },
          { label: vacancy.position },
        ]}
        image={img ?? undefined}
      />
      <Section className="bg-cream">
        <div className="mx-auto max-w-3xl">
          <article className="overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-brand-900/5">
            {img && (
              <div className="relative aspect-[16/9] w-full bg-brand-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt={`Gambar lowongan ${vacancy.position}`} className="h-full w-full object-cover" />
              </div>
            )}
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-2 text-sm font-semibold text-brand-600">
                <Building2 className="h-4 w-4" aria-hidden />
                {vacancy.company}
              </div>

              {facts.length > 0 && (
                <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                  {facts.map((f) => (
                    <div
                      key={f.label}
                      className="flex items-start gap-2.5 rounded-xl bg-brand-50/60 p-3.5 ring-1 ring-brand-900/5"
                    >
                      <f.icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" aria-hidden />
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{f.label}</dt>
                        <dd className="text-sm font-medium text-ink">{f.value}</dd>
                      </div>
                    </div>
                  ))}
                </dl>
              )}

              {vacancy.description && (
                <div className="mt-7">
                  <h2 className="font-display text-lg font-bold text-ink">Deskripsi Pekerjaan</h2>
                  <p className="mt-2 whitespace-pre-line leading-relaxed text-ink-soft">{vacancy.description}</p>
                </div>
              )}

              {vacancy.requirements && (
                <div className="mt-7">
                  <h2 className="font-display text-lg font-bold text-ink">Persyaratan</h2>
                  <p className="mt-2 whitespace-pre-line leading-relaxed text-ink-soft">{vacancy.requirements}</p>
                </div>
              )}

              <p className="mt-8 flex items-start gap-2 rounded-xl bg-brand-50 p-4 text-sm text-ink-soft">
                <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" aria-hidden />
                <span>
                  Informasi lowongan ini bersifat informasi dari mitra industri. Untuk pendaftaran, silakan hubungi
                  kontak perusahaan atau kunjungi tautan lamaran yang tersedia.
                </span>
              </p>

              {vacancy.applyUrl && (
                <a
                  href={vacancy.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 font-display text-sm font-semibold text-white shadow-card transition hover:bg-brand-700"
                >
                  Buka Tautan Lamaran
                </a>
              )}
            </div>
          </article>

          <div className="mt-6 text-center">
            <Link href="/bkk" className="text-sm font-semibold text-brand-600 underline-offset-4 hover:underline">
              ← Kembali ke daftar lowongan
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
