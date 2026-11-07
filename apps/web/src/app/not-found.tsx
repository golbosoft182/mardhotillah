import Link from "next/link";

export default function NotFound() {
  return (
    <div className="pattern-islamic-dark flex min-h-[70vh] flex-col items-center justify-center px-4 py-20 text-center">
      <p className="font-display text-8xl font-bold text-brand-200">404</p>
      <h1 className="mt-4 font-display text-2xl font-bold text-brand-700 sm:text-3xl">Halaman tidak ditemukan</h1>
      <p className="mt-3 max-w-md text-ink-soft">
        Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-brand-500 px-6 py-3 font-display font-semibold text-white transition hover:bg-brand-700"
        >
          Kembali ke Beranda
        </Link>
        <Link
          href="/ppdb"
          className="rounded-full bg-gold-400 px-6 py-3 font-display font-semibold text-brand-800 transition hover:bg-sun-400"
        >
          Info SPMB
        </Link>
      </div>
    </div>
  );
}
