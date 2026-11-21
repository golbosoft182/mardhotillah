import { CtaBand, EmptyState, PageHero, Section } from "@/components/ui/section";
import { apiServer, resolveImageUrl, type ListResponse, type Page, type Teacher } from "@/lib/api";

export const revalidate = 60;

const PAGE_SLUG = "wali-kelas-guru";
const DEFAULT_TITLE = "Daftar Wali Kelas & Guru";

async function getPage() {
  const page = await apiServer<Page>(`/pages/slug/${PAGE_SLUG}`);
  return page?.status === "PUBLISHED" ? page : null;
}

async function getTeachers() {
  const data = await apiServer<ListResponse<Teacher>>("/teachers", { limit: 100 });
  return data?.items ?? [];
}

export async function generateMetadata() {
  const page = await getPage();
  return {
    title: page?.seoTitle ?? page?.title ?? DEFAULT_TITLE,
    description: page?.seoDescription ?? "Mengenal para wali kelas dan guru yang mendampingi pembelajaran.",
  };
}

/** Foto guru disimpan sebagai path statis (/images/...) atau URL media; keduanya didukung. */
function teacherPhoto(photo?: string): string | undefined {
  if (!photo) return undefined;
  return photo.startsWith("/") ? photo : resolveImageUrl(photo);
}

function TeacherGrid({ teachers }: { teachers: Teacher[] }) {
  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
      {teachers.map((t) => {
        const photo = teacherPhoto(t.photo);
        return (
          <article
            key={t.id}
            className="group overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-brand-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-brand-500">
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photo}
                  alt={`Foto ${t.name}`}
                  className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="pattern-islamic flex h-full items-center justify-center">
                  <span className="font-display text-3xl font-bold text-white/70" aria-hidden>
                    {t.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <div className="p-4 text-center">
              <h3 className="font-display text-base font-bold leading-snug text-ink group-hover:text-brand-600">
                {t.name}
              </h3>
              {t.position && <p className="mt-1 text-sm font-medium text-brand-600">{t.position}</p>}
              {t.subject && <p className="mt-0.5 text-xs text-ink-soft">{t.subject}</p>}
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default async function WaliKelasGuruPage() {
  const [page, teachers] = await Promise.all([getPage(), getTeachers()]);
  const title = page?.title ?? DEFAULT_TITLE;

  // Pimpinan (ditandai lewat checkbox di CMS) tampil pada kelompok tersendiri di atas.
  const pimpinan = teachers.filter((t) => t.isPimpinan);
  const others = teachers.filter((t) => !t.isPimpinan);

  return (
    <>
      <PageHero
        title={title}
        description={page?.seoDescription ?? "Mengenal para wali kelas dan guru yang mendampingi pembelajaran."}
        breadcrumbs={[
          { label: "Beranda", href: "/" },
          { label: "Kurikulum", href: "/kurikulum" },
          { label: title },
        ]}
      />

      <Section>
        {teachers.length ? (
          <>
            {pimpinan.length > 0 && (
              <>
                <h2 className="mb-6 font-display text-2xl font-bold text-ink">Pimpinan</h2>
                <TeacherGrid teachers={pimpinan} />
              </>
            )}
            {others.length > 0 && (
              <>
                <h2 className={`mb-6 font-display text-2xl font-bold text-ink ${pimpinan.length ? "mt-14" : ""}`}>
                  Wali Kelas &amp; Guru
                </h2>
                <TeacherGrid teachers={others} />
              </>
            )}
          </>
        ) : (
          <EmptyState title="Data guru belum tersedia" hint="Tambahkan data melalui menu Guru & Pimpinan di CMS." />
        )}
      </Section>

      <Section className="bg-cream">
        <CtaBand />
      </Section>
    </>
  );
}
