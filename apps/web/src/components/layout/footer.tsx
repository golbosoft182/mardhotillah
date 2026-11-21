import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Youtube, MapPin, Phone, Mail } from "lucide-react";
import { apiServer, type MenuResponse, type Settings } from "@/lib/api";

/** Fallback kolom "Tautan" bila menu FOOTER belum diatur di CMS. */
const FALLBACK_FOOTER_LINKS: { label: string; url: string }[] = [
  { label: "Profil Yayasan", url: "/tentang/profil" },
  { label: "Berita", url: "/berita" },
  { label: "Agenda", url: "/agenda" },
  { label: "Prestasi", url: "/prestasi" },
  { label: "Fasilitas", url: "/fasilitas" },
  { label: "Bursa Kerja Khusus", url: "/bkk" },
  { label: "Mitra Industri", url: "/mitra-industri" },
  { label: "SPMB", url: "/ppdb" },
  { label: "Kontak", url: "/kontak" },
];

export async function Footer() {
  const [settings, footerMenu] = await Promise.all([
    apiServer<Settings>("/settings"),
    apiServer<MenuResponse>("/menus", { location: "FOOTER" }),
  ]);
  const name = settings?.site_name ?? "Yayasan Mardhotillah";
  const footerLinks = footerMenu?.items?.length
    ? footerMenu.items.map((i) => ({ label: i.label, url: i.url }))
    : FALLBACK_FOOTER_LINKS;

  return (
    <footer className="pattern-islamic bg-brand-800 text-white/80">
      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-2 md:gap-10 lg:grid-cols-3">
          {/* Identitas */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4 flex items-center gap-2.5">
              <Image
                src="/images/logos/yayasan.webp"
                alt="Logo Yayasan Mardhotillah"
                width={40}
                height={40}
                className="h-10 w-10 rounded-xl bg-white/95 object-contain p-1"
              />
              <span className="font-display text-base font-bold text-white">{name}</span>
            </div>
            <p className="text-sm leading-relaxed text-white/60">
              Membangun generasi Qur'ani, berilmu dan berkarakter melalui ekosistem pendidikan terpadu.
            </p>
            <div className="mt-4 flex gap-2">
              {[
                { icon: Facebook, label: "Facebook", href: settings?.facebook ?? "#" },
                { icon: Instagram, label: "Instagram", href: settings?.instagram ?? "#" },
                { icon: Youtube, label: "YouTube", href: settings?.youtube ?? "#" },
              ].map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition hover:bg-gold-400 hover:text-brand-800 sm:h-9 sm:w-9"
                >
                  <Icon className="h-5 w-5 sm:h-4 sm:w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Tautan */}
          <nav aria-label="Tautan cepat">
            <h3 className="mb-4 font-display text-sm font-bold uppercase tracking-wider text-gold-400">Tautan</h3>
            <ul className="space-y-2.5 text-sm">
              {footerLinks.map((l) => (
                <li key={`${l.url}-${l.label}`}>
                  <Link href={l.url} className="transition hover:text-gold-400">{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Kontak */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="mb-4 font-display text-sm font-bold uppercase tracking-wider text-gold-400">Kontak</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" aria-hidden />
                <span>{settings?.address ?? "[Alamat Lengkap Yayasan]"}</span>
              </li>
              <li className="flex gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" aria-hidden />
                <span>{settings?.phone ?? "[Nomor Telepon]"}</span>
              </li>
              <li className="flex gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" aria-hidden />
                <span>{settings?.email ?? "[Email Resmi]"}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row">
          <p>© {new Date().getFullYear()} {name}. Seluruh hak cipta dilindungi.</p>
          <p>
            Dikelola melalui{" "}
            <a href={process.env.NEXT_PUBLIC_API_URL ?? "#"} className="underline transition hover:text-gold-400">
              CMS Mardhotillah
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
