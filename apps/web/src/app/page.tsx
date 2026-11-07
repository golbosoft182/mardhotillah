import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  HeartHandshake,
  Languages,
  Medal,
  Sparkles,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Badge, SectionHeading } from "@/components/ui/container";
import {
  AchievementCard,
  EducationUnitCard,
  EventCard,
  NewsCard,
  ProgramCard,
} from "@/components/ui/cards";
import { CtaBand, EmptyState, Section } from "@/components/ui/section";
import { HeroSlider, type HeroSlide } from "@/components/hero-slider";
import { apiServer } from "@/lib/api";
import type {
  Achievement,
  EventItem,
  Gallery,
  HomeSection,
  ListResponse,
  Post,
  Program,
  Settings,
} from "@/lib/api";
import { resolveImageUrl } from "@/lib/api";

export const revalidate = 60;

/* ---------- Dummy fallback (dipakai bila section belum diatur di CMS) ---------- */

const DUMMY_ECOSYSTEM = {
  eyebrow: "Ekosistem Pendidikan",
  heading: "Tiga Jenjang, Satu Tujuan",
  description: "Satu ekosistem pendidikan terpadu dari pendidikan dasar hingga kejuruan dalam lingkungan pesantren.",
  items: [
    { name: "Pondok Pesantren Mardhotillah", tagline: "Pendidikan Pesantren", description: "Pendidikan berbasis pesantren dengan program tahfidzul Qur'an, bahasa Arab–Inggris, dan pembentukan karakter santri.", href: "/ponpes", image: "https://images.unsplash.com/photo-1588072432836-e10032774350?w=800&q=75" },
    { name: "SMP Unggulan Mardhotillah", tagline: "Tahfidz · Bilingual · Leadership", description: "SMP dengan program unggulan Tahfidzul Qur'an, Bilingual Excellence, Leadership, dan Mentorship akademik.", href: "/smp", image: "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&q=75" },
    { name: "SMK Mardhotillah Plus", tagline: "Sekolah Plus Nyantren Makin Keren", description: "SMK program keahlian DKV dengan kesiapan industri kreatif, portofolio karya, dan link and match dunia kerja.", href: "/smk", image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&q=75" },
  ],
};

const DUMMY_BENEFITS = {
  eyebrow: "Keunggulan Kami",
  heading: "Mengapa Mardhotillah?",
  description: "Enam alasan orang tua mempercayakan pendidikan putra-putrinya kepada kami.",
  items: [
    { icon: "book", title: "Pendidikan Berbasis Pesantren", description: "Lingkungan asrama yang membangun adab, kemandirian, dan kebiasaan ibadah harian." },
    { icon: "book", title: "Tahfidzul Qur'an", description: "Program hafalan Al-Qur'an terstruktur dengan target jelas dan mentoring intensif." },
    { icon: "heart", title: "Pendidikan Karakter", description: "Pembiasaan akhlak mulia sebagai fondasi utama seluruh aktivitas pendidikan." },
    { icon: "medal", title: "Leadership", description: "Wadah kepemimpinan santri/siswa melalui organisasi dan kegiatan kepemimpinan." },
    { icon: "language", title: "Bahasa & Kompetensi Global", description: "Penguasaan bahasa Arab dan Inggris untuk komunikasi aktif sehari-hari." },
    { icon: "sparkles", title: "Bakat & Prestasi", description: "Pengembangan minat bakat hingga berprestasi di tingkat yang lebih tinggi." },
  ],
};



const DUMMY_HERO_SLIDES: HeroSlide[] = [
  {
    eyebrow: "Yayasan Mardhotillah · Ponpes · SMP · SMK",
    title: "Membangun Generasi Qur'ani, Berilmu dan Berkarakter",
    description:
      "Pendidikan terpadu Mardhotillah menghadirkan lingkungan pendidikan yang mengintegrasikan nilai keislaman, ilmu pengetahuan, karakter, keterampilan dan pengembangan potensi peserta didik.",
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1920&q=80",
    secondaryButton: "DAFTAR SPMB",
    secondaryLink: "/ppdb",
  },
  {
    eyebrow: "SPMB 2027/2028 Telah Dibuka",
    title: "Wujudkan Masa Depan Cerah Putra-Putri Anda",
    description: "Pendaftaran peserta didik baru Ponpes, SMP, dan SMK Mardhotillah gelombang 1 telah resmi dibuka. Kuota terbatas.",
    image: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1920&q=80",
    primaryButton: "DAFTAR SEKARANG",
    primaryLink: "/ppdb",
    secondaryButton: "INFO SPMB",
    secondaryLink: "/ppdb",
  },
  {
    eyebrow: "Tahfidzul Qur'an · Bilingual · Leadership",
    title: "Sekolah Plus Nyantren Makin Keren",
    description: "Ekosistem asrama yang membina adab, kemandirian, dan prestasi akademik serta bakat siswa.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&q=80",
    primaryButton: "JELAJAHI PENDIDIKAN",
    primaryLink: "#pendidikan",
    secondaryButton: "LIHAT PRESTASI",
    secondaryLink: "/prestasi",
  },
];

const DUMMY_CTA = {
  heading: "Siap menjadi bagian dari keluarga Mardhotillah?",
  description: "Daftarkan putra-putri Anda melalui SPMB online atau hubungi kami untuk informasi lebih lanjut.",
  primaryButton: "DAFTAR SPMB",
  primaryLink: "/ppdb",
  secondaryButton: "HUBUNGI KAMI",
  secondaryLink: "/kontak",
};

/* ---------- Ikon untuk section benefits ---------- */

const BENEFIT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  book: BookOpen,
  heart: HeartHandshake,
  medal: Medal,
  language: Languages,
  sparkles: Sparkles,
};

function BenefitIcon({ icon }: { icon?: string }) {
  const Icon = BENEFIT_ICONS[icon ?? ""] ?? Sparkles;
  return <Icon className="h-5 w-5" aria-hidden />;
}

/* ---------- Helpers ---------- */

function sectionData(sections: HomeSection[] | null, key: string): Record<string, unknown> | null {
  const row = sections?.find((s) => s.key === key);
  return (row?.data as Record<string, unknown>) ?? null;
}

function str(v: unknown, fallback: string): string {
  return typeof v === "string" && v ? v : fallback;
}

interface ActivityItem {
  id: string;
  title: string;
  image?: string | null;
  category?: string | null;
}

interface EcosystemItem {
  name?: string;
  tagline?: string;
  description?: string;
  href?: string;
  image?: string;
}

export default async function HomePage() {
  const [news, events, achievements, activities, programs, galleries, settings, sections] = await Promise.all([
    apiServer<ListResponse<Post>>("/posts", { limit: 3 }),
    apiServer<ListResponse<EventItem>>("/events", { limit: 4 }),
    apiServer<ListResponse<Achievement>>("/achievements", { limit: 8 }),
    apiServer<ListResponse<ActivityItem>>("/activities", { limit: 4 }),
    apiServer<ListResponse<Program>>("/programs", { limit: 8 }),
    apiServer<ListResponse<Gallery>>("/galleries", { limit: 1 }),
    apiServer<Settings>("/settings"),
    apiServer<HomeSection[]>("/home-sections"),
  ]);

  const gallery = galleries?.items?.[0] ?? null;

  // Hero dari CMS (Pengaturan) dengan fallback ke teks default
  const heroTitle = settings?.hero_title || "Membangun Generasi Qur'ani, Berilmu dan Berkarakter";
  const heroSubtitle =
    settings?.hero_subtitle ||
    "Pendidikan terpadu Mardhotillah menghadirkan lingkungan pendidikan yang mengintegrasikan nilai keislaman, ilmu pengetahuan, karakter, keterampilan dan pengembangan potensi peserta didik.";

  // Semua section dari CMS — fallback dummy bila belum diatur
  const ecosystem = (sectionData(sections, "ecosystem") ?? DUMMY_ECOSYSTEM) as typeof DUMMY_ECOSYSTEM & { items: EcosystemItem[] };
  const benefits = (sectionData(sections, "benefits") ?? DUMMY_BENEFITS) as typeof DUMMY_BENEFITS;
  const cta = (sectionData(sections, "spmb_cta") ?? DUMMY_CTA) as typeof DUMMY_CTA;

  // Hero slider — dari CMS section "hero_slides"; fallback: dummy + hero teks dari Pengaturan
  const cmsSlides = sectionData(sections, "hero_slides");
  const slides: HeroSlide[] =
    cmsSlides && Array.isArray(cmsSlides.slides) && cmsSlides.slides.length > 0
      ? (cmsSlides.slides as HeroSlide[])
      : [
          {
            ...DUMMY_HERO_SLIDES[0],
            title: heroTitle,
            description: heroSubtitle,
          },
          ...DUMMY_HERO_SLIDES.slice(1),
        ];

  return (
    <>
      {/* 3. Hero slider — slide dari CMS (Konten Beranda → Hero Slider) */}
      <section className="relative min-h-[520px] overflow-hidden bg-brand-800 sm:min-h-[600px]">
        <HeroSlider
          slides={slides}
          fallbackPrimary={{ label: "JELAJAHI PENDIDIKAN", href: "#pendidikan" }}
          fallbackSecondary={{ label: "DAFTAR SPMB", href: "/ppdb" }}
        />
      </section>

      {/* 4. Education Ecosystem — dari CMS */}
      <Section id="pendidikan" className="bg-cream">
        <SectionHeading
          eyebrow={str(ecosystem.eyebrow, "Ekosistem Pendidikan")}
          title={str(ecosystem.heading, "Tiga Jenjang, Satu Tujuan")}
          description={str(ecosystem.description, "")}
        />
        <div className="grid gap-6 md:grid-cols-3">
          {(ecosystem.items as EcosystemItem[]).map((u) => (
            <EducationUnitCard
              key={u.name}
              name={u.name ?? "Unit"}
              tagline={u.tagline ?? ""}
              description={u.description ?? ""}
              href={u.href ?? "#"}
              image={u.image}
            />
          ))}
        </div>
      </Section>

      {/* 5. Mengapa Mardhotillah — dari CMS */}
      <Section className="pattern-islamic-dark bg-white">
        <SectionHeading
          eyebrow={str(benefits.eyebrow, "Keunggulan Kami")}
          title={str(benefits.heading, "Mengapa Mardhotillah?")}
          description={str(benefits.description, "")}
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.items.map(
            (b: { icon?: string; title?: string; description?: string }) => (
              <div
                key={b.title}
                className="rounded-2xl border border-brand-100 bg-cream p-6 transition-all duration-300 hover:-translate-y-1 hover:border-gold-400/50 hover:shadow-card"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500 text-white">
                  <BenefitIcon icon={b.icon} />
                </div>
                <h3 className="font-display font-bold text-ink">{b.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{b.description}</p>
              </div>
            ),
          )}
        </div>
      </Section>

      {/* 6. Program Unggulan — dari koleksi Programs */}
      <Section className="bg-cream">
        <SectionHeading
          eyebrow="Program Kami"
          title="Program Unggulan"
          description="Program pendidikan unggulan yang terintegrasi di seluruh satuan pendidikan Mardhotillah."
        />
        {programs?.items?.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {programs.items.map((p) => (
              <ProgramCard key={p.id} program={p} />
            ))}
          </div>
        ) : (
          <EmptyState title="Program belum tersedia" hint="Konten program akan segera diperbarui." />
        )}
      </Section>

      {/* 7. Wall of Fame — dari koleksi Achievements */}
      <Section className="bg-white">
        <SectionHeading
          eyebrow="Wall of Fame"
          title="Prestasi Siswa & Santri"
          description="Kebanggaan atas capaian siswa, santri, guru, dan lembaga di berbagai bidang."
        />
        {achievements?.items?.length ? (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {achievements.items.slice(0, 4).map((a) => (
                <AchievementCard key={a.id} item={a} />
              ))}
            </div>
            <div className="mt-8 text-center">
              <ButtonLink href="/prestasi" variant="outline">
                Lihat Semua Prestasi Siswa &amp; Santri
              </ButtonLink>
            </div>
          </>
        ) : (
          <EmptyState title="Belum ada data prestasi" hint="[Data Prestasi] — akan diperbarui oleh admin." />
        )}
      </Section>

      {/* 8. Latest News — dari koleksi Posts */}
      <Section className="bg-cream">
        <SectionHeading eyebrow="Publikasi" title="Berita Terbaru" align="center" />
        {news?.items?.length ? (
          <>
            <div className="grid gap-6 md:grid-cols-3">
              {news.items.map((p) => (
                <NewsCard key={p.id} post={p} />
              ))}
            </div>
            <div className="mt-8 text-center">
              <ButtonLink href="/berita" variant="outline">
                Lihat Semua Berita
              </ButtonLink>
            </div>
          </>
        ) : (
          <EmptyState title="Belum ada berita" hint="Berita akan tampil di sini setelah dipublikasikan lewat CMS." />
        )}
      </Section>

      {/* 9. Agenda — dari koleksi Events */}
      <Section className="bg-white">
        <SectionHeading eyebrow="Kalender Kegiatan" title="Agenda Terdekat" />
        {events?.items?.length ? (
          <>
            <div className="mx-auto grid max-w-4xl gap-4">
              {events.items.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
            <div className="mt-8 text-center">
              <ButtonLink href="/agenda" variant="outline">
                Lihat Semua Agenda
              </ButtonLink>
            </div>
          </>
        ) : (
          <EmptyState title="Belum ada agenda mendatang" hint="Agenda kegiatan akan segera diumumkan." />
        )}
      </Section>

      {/* 10. Gallery — dari koleksi Galleries */}
      {gallery && (
        <Section className="bg-cream">
          <SectionHeading eyebrow="Galeri" title="Momen Kegiatan" />
          <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 [&>*]:mb-4">
            {gallery.items?.slice(0, 8).map((item, i) => (
              <Link
                key={item.id}
                href="/galeri"
                aria-label={`Lihat momen kegiatan: ${item.caption ?? "foto"}`}
                className={`group block break-inside-avoid overflow-hidden rounded-2xl shadow-card ${i % 3 === 0 ? "aspect-[3/4]" : i % 3 === 1 ? "aspect-square" : "aspect-[4/3]"}`}
              >
                <Image
                  src={resolveImageUrl(item.url)!}
                  alt={item.alt ?? item.caption ?? "Foto kegiatan"}
                  width={600}
                  height={i % 3 === 0 ? 800 : 500}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <ButtonLink href="/galeri" variant="outline">
              Lihat Galeri Lengkap
            </ButtonLink>
          </div>
        </Section>
      )}

      {/* 11. Aktivitas Siswa & Santri — dari koleksi Activities */}
      {activities?.items?.length ? (
        <Section className="bg-white">
          <SectionHeading eyebrow="Kehidupan di Mardhotillah" title="Aktivitas Siswa & Santri" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {activities.items.slice(0, 4).map((a) => (
              <Link
                key={a.id}
                href="/aktivitas"
                aria-label={`Lihat aktivitas: ${a.title}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-2xl shadow-card"
              >
                <Image
                  src={a.image ?? "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=75"}
                  alt={a.title}
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-900/85 to-transparent p-4 text-sm font-display font-semibold text-white">
                  {a.title}
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <ButtonLink href="/aktivitas" variant="outline">
              Lihat Semua Aktivitas
            </ButtonLink>
          </div>
        </Section>
      ) : null}

      {/* 12. SPMB CTA — dari CMS section "spmb_cta" */}
      <Section className="bg-cream">
        <div className="pattern-islamic relative overflow-hidden rounded-3xl bg-brand-700 px-6 py-12 text-center shadow-lift sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-gold-400/15 blur-2xl" aria-hidden />
          <div className="pointer-events-none absolute -bottom-20 -right-10 h-56 w-56 rounded-full bg-brand-500/40 blur-2xl" aria-hidden />
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">{cta.heading}</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">{cta.description}</p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={str(cta.primaryLink, "/ppdb")}
              className="inline-flex items-center justify-center rounded-full bg-gold-400 px-7 py-3.5 font-display font-semibold text-brand-800 shadow-card transition hover:bg-sun-400 hover:shadow-lift"
            >
              {str(cta.primaryButton, "DAFTAR SPMB")}
            </Link>
            <Link
              href={str(cta.secondaryLink, "/kontak")}
              className="inline-flex items-center justify-center rounded-full border border-white/30 px-7 py-3.5 font-display font-semibold text-white transition hover:bg-white/10"
            >
              {str(cta.secondaryButton, "HUBUNGI KAMI")}
            </Link>
          </div>
        </div>
      </Section>

      {/* 13. Contact — dari Pengaturan CMS */}
      <Section className="bg-white">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Hubungi Kami"
              title="Kunjungi Yayasan Mardhotillah"
              align="left"
              description="Kami terbuka untuk kunjungan orang tua dan calon peserta didik. Silakan hubungi kami terlebih dahulu."
            />
            <dl className="space-y-4 text-sm">
              <div className="flex gap-3">
                <dt className="sr-only">Alamat</dt>
                <dd className="text-ink-soft">📍 {settings?.address ?? "[Alamat Lengkap Yayasan]"}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="sr-only">Telepon</dt>
                <dd className="text-ink-soft">📞 {settings?.phone ?? "[Nomor Telepon]"}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="sr-only">WhatsApp</dt>
                <dd className="text-ink-soft">💬 {settings?.whatsapp ?? "[Nomor WhatsApp]"}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="sr-only">Email</dt>
                <dd className="text-ink-soft">✉️ {settings?.email ?? "[Email Resmi]"}</dd>
              </div>
            </dl>
          </div>
          <div className="min-h-[300px] overflow-hidden rounded-2xl shadow-card">
            {settings?.maps_embed ? (
              <iframe
                src={settings.maps_embed}
                title="Peta lokasi Yayasan Mardhotillah"
                className="h-full min-h-[300px] w-full border-0"
                loading="lazy"
              />
            ) : (
              <div className="pattern-islamic flex h-full min-h-[300px] flex-col items-center justify-center gap-2 bg-brand-50 text-center">
                <p className="text-sm text-ink-soft">[Peta Lokasi — Google Maps]</p>
                <p className="text-xs text-ink-soft/70">Embed maps dapat diatur dari CMS</p>
              </div>
            )}
          </div>
        </div>
      </Section>
    </>
  );
}
