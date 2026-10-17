import { SectionHeading } from "@/components/ui/container";
import { ProgramCard } from "@/components/ui/cards";
import { CtaBand, EmptyState, PageHero, Section } from "@/components/ui/section";
import { apiServer, type Program } from "@/lib/api";

export const revalidate = 60;
export const metadata = { title: "Program", description: "Program unggulan pendidikan Mardhotillah." };

export default async function ProgramPage() {
  const data = await apiServer<{ items: Program[] }>("/programs", { limit: 24 });

  return (
    <>
      <PageHero
        title="Program Pendidikan"
        description="Program unggulan yang terintegrasi di seluruh satuan pendidikan Mardhotillah."
        breadcrumbs={[{ label: "Beranda", href: "/" }, { label: "Program" }]}
      />
      <Section>
        <SectionHeading eyebrow="Program" title="Program Unggulan Mardhotillah" />
        {data?.items?.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {data.items.map((p) => (
              <ProgramCard key={p.id} program={p} />
            ))}
          </div>
        ) : (
          <EmptyState title="Program belum tersedia" />
        )}
      </Section>
      <Section className="bg-cream">
        <CtaBand />
      </Section>
    </>
  );
}
