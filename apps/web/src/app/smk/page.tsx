import { Palette, Briefcase, Trophy } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/container";
import { NewsCard } from "@/components/ui/cards";
import { CtaBand, EmptyState, PageHero, Section, UnitLogo } from "@/components/ui/section";
import { apiServer, type Post, type Page } from "@/lib/api";

export const revalidate = 60;

export async function generateMetadata() {
  const seo = await apiServer<{ title?: string; description?: string }>("/seo/smk");
  return { title: seo?.title ?? "SMK Mardhotillah Plus", description: seo?.description };
}

export default async function SmkPage() {
  const [news, cmsPage] = await Promise.all([
    apiServer<{ items: Post[] }>("/posts", { limit: 3, unit: "SMK" }),
    apiServer<Page>("/pages/slug/tentang-smk"),
  ]);
  const heroDesc =
    cmsPage?.status === "PUBLISHED"
      ? cmsPage.content?.replace(/<[^>]+>/g, " ").trim().slice(0, 220)
      : undefined;

  return (
    <>
      <UnitLogo unit="smk" />
      <PageHero
        title={cmsPage?.status === "PUBLISHED" ? cmsPage.title : "SMK Mardhotillah Plus"}
        description={heroDesc || '"Sekolah Plus Nyantren Makin Keren" — SMK dengan program keahlian Desain Komunikasi Visual (DKV) dalam lingkungan pesantren: kuat dalam iman, kreatif dalam karya.'}
        breadcrumbs={[{ label: "Beranda", href: "/" }, { label: "SMK Mardhotillah Plus" }]}
        image="https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=1600&q=75"
      />

      <Section className="bg-white">
        <SectionHeading eyebrow="Keunggulan SMK Plus" title="Belajar Kreativitas, Hidup dalam Pesantren" />
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Palette, title: "Desain Komunikasi Visual", desc: "Kurikulum DKV: desain grafis, ilustrasi, fotografi, branding, dan 3D." },
            { icon: Briefcase, title: "Link and Match Industri", desc: "Kesiapan memasuki industri kreatif melalui proyek nyata dan magang." },
            { icon: Trophy, title: "Portofolio & Prestasi", desc: "Karya siswa dibina untuk kompetisi dan portofolio profesional." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl bg-cream p-6 ring-1 ring-brand-900/5">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500 text-white">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="font-display font-bold text-ink">{title}</h3>
              <p className="mt-1.5 text-sm text-ink-soft">{desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* DKV Showcase preview */}
      <Section className="pattern-islamic-dark bg-cream">
        <SectionHeading
          eyebrow="Portofolio DKV"
          title="Karya Siswa Kami"
          description="Hasil karya siswa Desain Komunikasi Visual SMK Mardhotillah Plus."
        />
        <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 [&>*]:mb-4">
          {[
            { title: "Desain Poster", cat: "Poster" },
            { title: "Ilustrasi Karakter", cat: "Ilustrasi" },
            { title: "Brand Identity", cat: "Branding" },
            { title: "Fotografi Produk", cat: "Fotografi" },
            { title: "Karya 3D", cat: "3D" },
            { title: "Art Digital", cat: "Digital Art" },
            { title: "Desain Logo", cat: "Graphic Design" },
            { title: "Proyek Siswa", cat: "Student Projects" },
          ].map((w, i) => (
            <div
              key={w.title}
              className={`group relative break-inside-avoid overflow-hidden rounded-2xl shadow-card ${i % 3 === 0 ? "aspect-[3/4]" : i % 3 === 1 ? "aspect-square" : "aspect-[4/3]"}`}
            >
              <div className="pattern-islamic absolute inset-0 bg-brand-500" aria-hidden />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-gradient-to-t from-brand-900/60 to-transparent p-4 text-center">
                <Palette className="h-8 w-8 text-gold-400" aria-hidden />
                <span className="font-display text-sm font-bold text-white">{w.title}</span>
                <span className="text-xs text-white/70">{w.cat}</span>
                <span className="text-[10px] text-white/50">[Karya Siswa]</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section className="bg-white">
        <SectionHeading eyebrow="Kabar SMK" title="Berita & Kegiatan Terbaru" />
        {news?.items?.length ? (
          <div className="grid gap-6 md:grid-cols-3">
            {news.items.map((p) => (
              <NewsCard key={p.id} post={p} />
            ))}
          </div>
        ) : (
          <EmptyState title="Belum ada berita SMK" hint="Berita akan tampil setelah dipublikasikan oleh admin SMK." />
        )}
      </Section>

      <Section className="bg-cream">
        <CtaBand title='"Sekolah Plus Nyantren Makin Keren" — mulai karier kreatif Anda di sini' />
      </Section>
    </>
  );
}
