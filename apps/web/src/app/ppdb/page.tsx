import Image from "next/image";
import { Suspense } from "react";
import { Download } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/container";
import { EmptyState, Section } from "@/components/ui/section";
import { apiServer, type PpdbData, type Settings } from "@/lib/api";
import { PpdbRegisterForm } from "@/components/ppdb-register-form";
import { SpmbInfoSections } from "@/components/spmb-info-sections";

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

      {/* Syarat · Jadwal · Alur · Biaya · FAQ · Kontak · Unit — komponen bersama */}
      <SpmbInfoSections ppdb={ppdb} settings={settings} />
    </>
  );
}
