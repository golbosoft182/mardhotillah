import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin } from "lucide-react";
import { PageHero, Section } from "@/components/ui/section";
import { apiServer, type EventItem } from "@/lib/api";
import { resolveImageUrl } from "@/lib/api";
import { formatEventDate } from "@/lib/site";

export const revalidate = 60;

async function getEvent(slug: string): Promise<EventItem | null> {
  return apiServer<EventItem>(`/events/slug/${slug}`);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEvent(slug);
  return {
    title: event?.title ?? "Agenda",
    description: event?.description,
  };
}

export default async function AgendaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) notFound();

  const img = resolveImageUrl(event.featuredImage);

  return (
    <>
      <PageHero
        title={event.title}
        description={event.description}
        breadcrumbs={[
          { label: "Beranda", href: "/" },
          { label: "Agenda", href: "/agenda" },
          { label: event.title },
        ]}
        image={img ?? undefined}
      />
      <Section className="bg-cream">
        <div className="mx-auto max-w-3xl">
          <article className="overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-brand-900/5">
            {img && (
              <div className="relative aspect-[16/7] w-full bg-brand-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt={`Foto agenda ${event.title}`} className="h-full w-full object-cover" />
              </div>
            )}
            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-soft">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-brand-500" aria-hidden />
                  {formatEventDate(event.startDate, event.endDate, event.allDay)}
                </span>
                {event.location && (
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-brand-500" aria-hidden />
                    {event.location}
                  </span>
                )}
              </div>
              {event.description && (
                <p className="mt-5 leading-relaxed text-ink-soft">{event.description}</p>
              )}
              <p className="mt-6 rounded-xl bg-brand-50 p-4 text-sm text-ink-soft">
                Informasi lengkap agenda ini dapat berubah. Silakan hubungi kami melalui halaman{" "}
                <Link href="/kontak" className="font-semibold text-brand-600 underline underline-offset-2">
                  Kontak
                </Link>{" "}
                untuk konfirmasi.
              </p>
            </div>
          </article>
          <div className="mt-6 text-center">
            <Link href="/agenda" className="text-sm font-semibold text-brand-600 underline-offset-4 hover:underline">
              ← Kembali ke daftar agenda
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
