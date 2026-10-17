import Image from "next/image";
import { SectionHeading } from "@/components/ui/container";
import { EmptyState, PageHero, Section } from "@/components/ui/section";
import { apiServer, resolveImageUrl, type Facility } from "@/lib/api";

export const revalidate = 60;
export const metadata = { title: "Fasilitas", description: "Fasilitas pendidikan Yayasan Mardhotillah." };

export default async function FasilitasPage() {
  const data = await apiServer<{ items: Facility[] }>("/facilities", { limit: 24 });

  return (
    <>
      <PageHero
        title="Fasilitas"
        description="Sarana dan prasarana penunjang pendidikan di lingkungan Mardhotillah."
        breadcrumbs={[{ label: "Beranda", href: "/" }, { label: "Fasilitas" }]}
      />
      <Section>
        <SectionHeading eyebrow="Sarana Prasarana" title="Fasilitas Kami" />
        {data?.items?.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((f) => (
              <div key={f.id} className="group overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-brand-900/5 transition hover:-translate-y-1 hover:shadow-lift">
                <div className="relative aspect-[4/3] overflow-hidden bg-brand-100">
                  {f.image ? (
                    <Image src={resolveImageUrl(f.image)!} alt={`Fasilitas ${f.name}`} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="pattern-islamic flex h-full items-center justify-center bg-brand-500">
                      <span className="sr-only">[Foto Fasilitas]</span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-display font-bold text-ink">{f.name}</h3>
                  {f.description && <p className="mt-1.5 text-sm text-ink-soft">{f.description}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="Belum ada data fasilitas" hint="[Konten Yayasan] — fasilitas akan diperbarui oleh admin." />
        )}
      </Section>
    </>
  );
}
