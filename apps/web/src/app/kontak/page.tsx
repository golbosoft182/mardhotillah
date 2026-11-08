import { MapPin, Phone, Mail, MessageCircle } from "lucide-react";
import { PageHero, Section, CtaBand } from "@/components/ui/section";
import { apiServer, type Settings } from "@/lib/api";
import { mapEmbedSrc } from "@/lib/maps";

export const revalidate = 300;
export const metadata = { title: "Kontak", description: "Hubungi Yayasan Mardhotillah." };

export default async function KontakPage() {
  const settings = await apiServer<Settings>("/settings");
  const mapSrc = mapEmbedSrc(settings?.maps_embed);

  const rows = [
    { icon: MapPin, label: "Alamat", value: settings?.address ?? "[Alamat Lengkap Yayasan]" },
    { icon: Phone, label: "Telepon", value: settings?.phone ?? "[Nomor Telepon]" },
    { icon: MessageCircle, label: "WhatsApp", value: settings?.whatsapp ?? "[Nomor WhatsApp]" },
    { icon: Mail, label: "Email", value: settings?.email ?? "[Email Resmi]" },
  ];

  return (
    <>
      <PageHero
        title="Kontak Kami"
        description="Kami senang mendengar dari Anda — silakan hubungi kami untuk informasi pendidikan, kunjungan, atau kerja sama."
        breadcrumbs={[{ label: "Beranda", href: "/" }, { label: "Kontak" }]}
      />
      <Section>
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-4">
            {rows.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex gap-4 rounded-2xl bg-white p-5 shadow-card ring-1 ring-brand-900/5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <p className="font-display font-semibold text-ink">{label}</p>
                  <p className="text-sm text-ink-soft">{value}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="min-h-[320px] overflow-hidden rounded-2xl shadow-card">
            {mapSrc ? (
              <iframe
                src={mapSrc}
                title="Peta lokasi"
                className="h-full min-h-[320px] w-full border-0"
                loading="lazy"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            ) : (
              <div className="pattern-islamic flex h-full min-h-[320px] flex-col items-center justify-center gap-2 bg-brand-50 text-center">
                <MapPin className="h-8 w-8 text-brand-300" aria-hidden />
                <p className="text-sm text-ink-soft">[Peta Lokasi — Google Maps]</p>
                <p className="text-xs text-ink-soft/70">Embed maps dapat diatur melalui CMS</p>
              </div>
            )}
          </div>
        </div>
      </Section>
      <Section className="bg-cream">
        <CtaBand />
      </Section>
    </>
  );
}
