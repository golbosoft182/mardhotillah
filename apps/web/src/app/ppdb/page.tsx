import Image from "next/image";
import { Suspense } from "react";
import { CheckCircle2, ChevronDown, Clock, Download, FileText, Phone } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/container";
import { CtaBand, EmptyState, Section } from "@/components/ui/section";
import { apiServer, resolveImageUrl, type PpdbData, type Settings } from "@/lib/api";
import { EducationUnitCard } from "@/components/ui/cards";
import { PpdbRegisterForm } from "@/components/ppdb-register-form";

export const revalidate = 60;

export async function generateMetadata() {
  const seo = await apiServer<{ title?: string; description?: string }>("/seo/ppdb");
  return {
    title: seo?.title ?? "SPMB — Seleksi Penerimaan Murid Baru",
    description:
      seo?.description ??
      "Informasi lengkap SPMB Yayasan Mardhotillah: pendaftaran online, persyaratan, jadwal, biaya, dan FAQ.",
  };
}

function SectionData({ data }: { data: unknown }) {
  if (!Array.isArray(data)) return null;
  return (
    <ul className="space-y-2.5">
      {(data as { label?: string; text?: string }[]).map((item, i) => (
        <li key={i} className="flex gap-3 rounded-xl bg-white p-3.5 shadow-card ring-1 ring-brand-900/5">
          {item.label && (
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-500 font-display text-xs font-bold text-white">
              {item.label}
            </span>
          )}
          {!item.label && <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-500" aria-hidden />}
          <span className="text-sm leading-relaxed text-ink">{item.text}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function SpmbPage() {
  const [ppdb, settings] = await Promise.all([
    apiServer<PpdbData>("/ppdb/active"),
    apiServer<Settings>("/settings"),
  ]);

  if (!ppdb) {
    return (
      <>
        <div className="pattern-islamic bg-brand-700 py-24 text-center">
          <h1 className="font-display text-4xl font-bold text-white">SPMB</h1>
          <p className="mt-3 text-white/70">Seleksi Penerimaan Murid Baru</p>
        </div>
        <Section>
          <EmptyState
            title="Informasi SPMB belum tersedia"
            hint="Panitia sedang mempersiapkan periode pendaftaran berikutnya. Silakan hubungi kami untuk info lebih lanjut."
          />
        </Section>
      </>
    );
  }

  const section = (key: string) => ppdb.content.find((c) => c.section === key);
  const hero = section("hero");
  const why = section("why");
  const requirements = section("requirements");
  const timeline = section("timeline");
  const process = section("process");
  const fees = section("fees");
  const contact = section("contact");

  const units = [
    {
      name: "Pondok Pesantren Mardhotillah",
      tagline: "Pendidikan Pesantren",
      description: "Tahfidzul Qur'an, bahasa, dan karakter dalam lingkungan asrama.",
      href: "/ponpes",
    },
    {
      name: "SMP Unggulan Mardhotillah",
      tagline: "Tahfidz · Bilingual · Leadership",
      description: "Program Tahfidz, Bilingual, Leadership, dan Mentorship akademik.",
      href: "/smp",
    },
    {
      name: "SMK Mardhotillah Plus",
      tagline: "Sekolah Plus Nyantren Makin Keren",
      description: "DKV, portofolio karya, dan kesiapan industri kreatif.",
      href: "/smk",
    },
  ];

  return (
    <>
      {/* Hero — ringkas */}
      <section className="relative overflow-hidden bg-brand-800">
        <Image
          src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&q=80"
          alt="Suasana pendidikan di Mardhotillah"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-900/75 to-brand-800/85" aria-hidden />
        <div className="relative mx-auto max-w-4xl px-4 py-14 text-center sm:px-6 sm:py-16">
          <p className="mb-2 font-display text-xs font-bold uppercase tracking-[0.25em] text-gold-400 sm:text-sm">
            {ppdb.name}
          </p>
          <h1 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
            {hero?.title ?? "SPMB Telah Dibuka"}
          </h1>
          {hero?.body && <p className="mx-auto mt-3 max-w-2xl text-base text-white/80 sm:text-lg">{hero.body}</p>}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink href="#pendaftaran" variant="gold" size="lg">
              DAFTAR SEKARANG
            </ButtonLink>
            {ppdb.brochureUrl ? (
              <a
                href={ppdb.brochureUrl}
                className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 font-display text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <Download className="h-4 w-4" aria-hidden /> DOWNLOAD BROSUR
              </a>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 font-display text-sm font-semibold text-white/60">
                <Download className="h-4 w-4" aria-hidden /> Brosur segera tersedia
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ===== FORMULIR — langsung setelah hero, sebelum informasi ===== */}
      <Section id="pendaftaran" compact className="pattern-islamic-dark bg-cream">
        <SectionHeading
          eyebrow="SPMB Online"
          title="Formulir Pendaftaran Online"
          description="Isi data calon peserta didik untuk unit PONPES, SMP, atau SMK. Setelah terkirim, Anda menerima kode registrasi dan panitia menghubungi via WhatsApp."
        />
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-5 shadow-lift ring-1 ring-brand-900/10 sm:p-8">
          <Suspense fallback={null}>
            <PpdbRegisterForm />
          </Suspense>
        </div>
      </Section>

      {/* Info penting: Syarat · Jadwal · Alur · Biaya — digabung satu grid agar ringkas */}
      {(requirements || timeline || process || fees) && (
        <Section compact className="bg-white">
          <div className="grid gap-x-8 gap-y-10 lg:grid-cols-2">
            {requirements && (
              <div>
                <SectionHeading
                  eyebrow="Syarat"
                  title={requirements.title ?? "Persyaratan"}
                  description={requirements.body ?? undefined}
                  align="left"
                />
                <SectionData data={requirements.data} />
              </div>
            )}
            {process && (
              <div>
                <SectionHeading
                  eyebrow="Cara Daftar"
                  title={process.title ?? "Alur Pendaftaran"}
                  description={process.body ?? undefined}
                  align="left"
                />
                <SectionData data={process.data} />
              </div>
            )}
            {timeline && (
              <div>
                <SectionHeading
                  eyebrow="Jadwal"
                  title={timeline.title ?? "Jadwal Penting"}
                  description={timeline.body ?? undefined}
                  align="left"
                />
                <ul className="space-y-2.5">
                  {(Array.isArray(timeline.data) ? timeline.data : []).map((t, i) => (
                    <li key={i} className="flex items-center gap-3 rounded-xl bg-cream p-3.5 ring-1 ring-brand-900/5">
                      <Clock className="h-5 w-5 shrink-0 text-brand-500" aria-hidden />
                      <div>
                        <p className="font-display text-sm font-bold text-ink">{(t as { label?: string }).label}</p>
                        <p className="text-xs text-ink-soft">{(t as { text?: string }).text}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {fees && (
              <div>
                <SectionHeading
                  eyebrow="Investasi Pendidikan"
                  title={fees.title ?? "Biaya Pendidikan"}
                  description={fees.body ?? undefined}
                  align="left"
                />
                <SectionData data={fees.data} />
                <p className="mt-3 text-xs text-ink-soft">[Informasi SPMB] — Rincian biaya resmi diumumkan oleh panitia.</p>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* FAQ + kontak panitia — satu section ringkas berdampingan */}
      {(ppdb.faqs.length > 0 || contact) && (
        <Section compact className="pattern-islamic-dark bg-cream">
          <div className={`grid gap-10 ${ppdb.faqs.length > 0 && contact ? "lg:grid-cols-[1.4fr_1fr]" : ""}`}>
            {ppdb.faqs.length > 0 && (
              <div>
                <SectionHeading eyebrow="Tanya Jawab" title="Pertanyaan yang Sering Diajukan" align="left" />
                <div className="space-y-2.5">
                  {ppdb.faqs.map((faq) => (
                    <details key={faq.id} className="group rounded-2xl bg-white p-4 shadow-card ring-1 ring-brand-900/5">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
                        {faq.question}
                        <ChevronDown className="h-4 w-4 shrink-0 text-brand-500 transition-transform group-open:rotate-180" aria-hidden />
                      </summary>
                      <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </div>
            )}
            {contact && (
              <div>
                <SectionHeading eyebrow="Kontak Panitia" title={contact.title ?? "Butuh Bantuan?"} description={contact.body ?? undefined} align="left" />
                <div className="space-y-2.5 text-sm">
                  {settings?.whatsapp && (
                    <p className="flex items-center gap-2 rounded-xl bg-white p-3.5 shadow-card ring-1 ring-brand-900/5 text-ink-soft">
                      <Phone className="h-4 w-4 shrink-0 text-brand-500" aria-hidden /> WhatsApp: {settings.whatsapp}
                    </p>
                  )}
                  {settings?.email && (
                    <p className="flex items-center gap-2 rounded-xl bg-white p-3.5 shadow-card ring-1 ring-brand-900/5 text-ink-soft">
                      <FileText className="h-4 w-4 shrink-0 text-brand-500" aria-hidden /> Email: {settings.email}
                    </p>
                  )}
                </div>
                <div className="mt-5">
                  <CtaBand title="Mulai langkah pertama hari ini" />
                </div>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Unit pendidikan — penutup, kartu ringkas */}
      {why && (
        <Section compact className="bg-white">
          <SectionHeading eyebrow={ppdb.name} title={why.title ?? "Mengapa Mardhotillah?"} description={why.body ?? undefined} />
          <div className="grid gap-5 md:grid-cols-3">
            {units.map((u) => (
              <EducationUnitCard key={u.name} {...u} />
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
