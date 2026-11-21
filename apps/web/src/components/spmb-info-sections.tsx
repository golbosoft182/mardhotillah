import { CheckCircle2, ChevronDown, Clock, FileText, Phone } from "lucide-react";
import { SectionHeading } from "@/components/ui/container";
import { CtaBand, Section } from "@/components/ui/section";
import { EducationUnitCard } from "@/components/ui/cards";
import type { PpdbData, Settings } from "@/lib/api";

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

const UNITS = [
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

/**
 * Bagian informasi SPMB (di bawah form) — dipakai bersama oleh /ppdb dan /info-spmb
 * agar keduanya selalu identik.
 */
export function SpmbInfoSections({ ppdb, settings }: { ppdb: PpdbData; settings: Settings | null }) {
  const section = (key: string) => ppdb.content.find((c) => c.section === key);
  const why = section("why");
  const requirements = section("requirements");
  const timeline = section("timeline");
  const process = section("process");
  const fees = section("fees");
  const contact = section("contact");

  return (
    <>
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
            {UNITS.map((u) => (
              <EducationUnitCard key={u.name} {...u} />
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
