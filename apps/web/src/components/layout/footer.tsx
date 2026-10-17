import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Youtube, MapPin, Phone, Mail } from "lucide-react";
import { apiServer, type Settings } from "@/lib/api";

export async function Footer() {
  const settings = await apiServer<Settings>("/settings");
  const name = settings?.site_name ?? "Yayasan Mardhotillah";

  return (
    <footer className="pattern-islamic bg-brand-800 text-white/80">
      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Identitas */}
          <div>
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
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-gold-400 hover:text-brand-800"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Satuan Pendidikan */}
          <nav aria-label="Satuan pendidikan">
            <h3 className="mb-4 font-display text-sm font-bold uppercase tracking-wider text-gold-400">Satuan Pendidikan</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/ponpes" className="transition hover:text-gold-400">Pondok Pesantren Mardhotillah</Link></li>
              <li><Link href="/smp" className="transition hover:text-gold-400">SMP Unggulan Mardhotillah</Link></li>
              <li><Link href="/smk" className="transition hover:text-gold-400">SMK Mardhotillah Plus</Link></li>
            </ul>
          </nav>

          {/* Tautan */}
          <nav aria-label="Tautan cepat">
            <h3 className="mb-4 font-display text-sm font-bold uppercase tracking-wider text-gold-400">Tautan</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/tentang/profil" className="transition hover:text-gold-400">Profil Yayasan</Link></li>
              <li><Link href="/berita" className="transition hover:text-gold-400">Berita</Link></li>
              <li><Link href="/agenda" className="transition hover:text-gold-400">Agenda</Link></li>
              <li><Link href="/prestasi" className="transition hover:text-gold-400">Prestasi</Link></li>
              <li><Link href="/fasilitas" className="transition hover:text-gold-400">Fasilitas</Link></li>
              <li><Link href="/ppdb" className="transition hover:text-gold-400">PPDB</Link></li>
            </ul>
          </nav>

          {/* Kontak */}
          <div>
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
