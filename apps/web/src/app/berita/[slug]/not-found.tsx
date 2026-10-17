import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-20 text-center">
      <p className="font-display text-7xl font-bold text-brand-200">404</p>
      <h1 className="mt-4 font-display text-2xl font-bold text-brand-700">Halaman tidak ditemukan</h1>
      <p className="mt-2 text-ink-soft">Halaman yang Anda cari mungkin telah dipindahkan atau dihapus.</p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-brand-500 px-6 py-3 font-display font-semibold text-white transition hover:bg-brand-700"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
