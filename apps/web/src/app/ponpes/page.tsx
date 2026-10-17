import { GraduationCap, MoonStar, Users } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/container";
import { NewsCard, ProgramCard } from "@/components/ui/cards";
import { CtaBand, EmptyState, PageHero, Section, UnitLogo } from "@/components/ui/section";
import { apiServer, type EventItem, type Post, type Program, type Page } from "@/lib/api";

export const revalidate = 60;

export async function generateMetadata() {
  const seo = await apiServer<{ title?: string; description?: string }>("/seo/ponpes");
  return { title: seo?.title ?? "Pondok Pesantren Mardhotillah", description: seo?.description };
}

export default async function PonpesPage() {
  const [news, programs, events, cmsPage] = await Promise.all([
    apiServer<{ items: Post[] }>("/posts", { limit: 3, unit: "PONPES" }),
    apiServer<{ items: Program[] }>("/programs", { limit: 6 }),
    apiServer<{ items: EventItem[] }>("/events", { limit: 3, unit: "PONPES" }),
    apiServer<Page>("/pages/slug/tentang-ponpes"),
  ]);
  const heroDesc =
    cmsPage?.status === "PUBLISHED"
      ? cmsPage.content?.replace(/<[^>]+>/g, " ").trim().slice(0, 220)
      : undefined;

  return (
    <>
      <UnitLogo unit="ponpes" />
      <PageHero
        title={cmsPage?.status === "PUBLISHED" ? cmsPage.title : "Pondok Pesantren Mardhotillah"}
        description={heroDesc || "Pendidikan berbasis pesantren yang mengintegrasikan tahfidzul Qur'an, ilmu agama, bahasa, dan pembentukan karakter santri dalam lingkungan asrama."}
        breadcrumbs={[{ label: "Beranda", href: "/" }, { label: "Pondok Pesantren" }]}
        image="https://images.unsplash.com/photo-1588072432836-e10032774350?w=1600&q=75"
      />

      <Section className="bg-white">
        <SectionHeading
          eyebrow="Fokus Pendidikan"
          title="Membina Santri Qur'ani, Beradab, dan Mandiri"
          description="Lingkungan pesantren yang mendukung pembiasaan ibadah, kemandirian, serta pertumbuhan ilmu dan karakter."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: MoonStar, title: "Tahfidzul Qur'an", desc: "Program hafalan Al-Qur'an terstruktur dengan mentoring santri." },
            { icon: GraduationCap, title: "Bahasa Arab & Inggris", desc: "Pembiasaan dua bahasa untuk membuka wawasan global santri." },
            { icon: Users, title: "Kehidupan Asrama", desc: "Pembinaan kemandirian, adab, dan ukhuwah dalam keseharian santri." },
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
        <SectionHeading eyebrow="Program" title="Program Pesantren" />
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
        <SectionHeading eyebrow="Kabar Ponpes" title="Berita & Kegiatan Terbaru" />
        {news?.items?.length ? (
          <div className="grid gap-6 md:grid-cols-3">
            {news.items.map((p) => (
              <NewsCard key={p.id} post={p} />
            ))}
          </div>
        ) : (
          <EmptyState title="Belum ada berita Ponpes" hint="Berita akan tampil setelah dipublikasikan oleh admin Ponpes." />
        )}
      </Section>

      <Section className="bg-cream">
        <CtaBand title="Ingin putra Anda menjadi bagian dari Ponpes Mardhotillah?" />
      </Section>
    </>
  );
}
