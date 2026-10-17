import { BookOpen, Globe, Medal, Users } from "lucide-react";
import { SectionHeading } from "@/components/ui/container";
import { NewsCard, ProgramCard } from "@/components/ui/cards";
import { CtaBand, EmptyState, PageHero, Section, UnitLogo } from "@/components/ui/section";
import { apiServer, type Post, type Program, type Page } from "@/lib/api";

export const revalidate = 60;

export async function generateMetadata() {
  const seo = await apiServer<{ title?: string; description?: string }>("/seo/smp");
  return { title: seo?.title ?? "SMP Unggulan Mardhotillah", description: seo?.description };
}

export default async function SmpPage() {
  const [news, programs, cmsPage] = await Promise.all([
    apiServer<{ items: Post[] }>("/posts", { limit: 3, unit: "SMP" }),
    apiServer<{ items: Program[] }>("/programs", { limit: 6 }),
    apiServer<Page>("/pages/slug/tentang-smp"),
  ]);
  const heroDesc =
    cmsPage?.status === "PUBLISHED"
      ? cmsPage.content?.replace(/<[^>]+>/g, " ").trim().slice(0, 220)
      : undefined;

  return (
    <>
      <UnitLogo unit="smp" />
      <PageHero
        title={cmsPage?.status === "PUBLISHED" ? cmsPage.title : "SMP Unggulan Mardhotillah"}
        description={heroDesc || "SMP dengan program unggulan Tahfidzul Qur'an, Bilingual Excellence, Leadership, dan Mentorship untuk capaian akademik dan karakter yang maksimal."}
        breadcrumbs={[{ label: "Beranda", href: "/" }, { label: "SMP Unggulan" }]}
        image="https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=1600&q=75"
      />

      <Section className="bg-white">
        <SectionHeading eyebrow="Program Unggulan" title="Empat Pilar Keunggulan SMP" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: BookOpen, title: "Tahfidzul Qur'an", desc: "Setoran hafalan terjadwal dan mentoring tahfidz intensif." },
            { icon: Globe, title: "Bilingual Excellence", desc: "Pembelajaran dan komunikasi aktif dalam bahasa Arab & Inggris." },
            { icon: Medal, title: "Leadership", desc: "Pembinaan kepemimpinan siswa melalui organisasi OSIS dan Kaluwira." },
            { icon: Users, title: "Mentorship", desc: "Pendampingan akademik dan karakter oleh mentor yang dekat dengan siswa." },
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

      <Section className="bg-cream">
        <SectionHeading eyebrow="Program" title="Program Pembelajaran" />
        {programs?.items?.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {programs.items.map((p) => (
              <ProgramCard key={p.id} program={p} />
            ))}
          </div>
        ) : (
          <EmptyState title="Program belum tersedia" />
        )}
      </Section>

      <Section className="bg-white">
        <SectionHeading eyebrow="Kabar SMP" title="Berita & Kegiatan Terbaru" />
        {news?.items?.length ? (
          <div className="grid gap-6 md:grid-cols-3">
            {news.items.map((p) => (
              <NewsCard key={p.id} post={p} />
            ))}
          </div>
        ) : (
          <EmptyState title="Belum ada berita SMP" hint="Berita akan tampil setelah dipublikasikan oleh admin SMP." />
        )}
      </Section>

      <Section className="bg-cream">
        <CtaBand title="Bergabunglah dengan keluarga besar SMP Unggulan Mardhotillah" />
      </Section>
    </>
  );
}
