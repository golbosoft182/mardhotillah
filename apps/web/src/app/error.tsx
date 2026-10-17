"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="pattern-islamic-dark flex min-h-[70vh] flex-col items-center justify-center px-4 py-20 text-center">
      <p className="font-display text-6xl font-bold text-gold-400">Ups!</p>
      <h1 className="mt-4 font-display text-2xl font-bold text-brand-700">Terjadi kesalahan</h1>
      <p className="mt-3 max-w-md text-ink-soft">
        Mohon maaf, terjadi kendala saat memuat halaman ini. Silakan coba lagi.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 rounded-full bg-brand-500 px-6 py-3 font-display font-semibold text-white transition hover:bg-brand-700"
      >
        Coba Lagi
      </button>
    </div>
  );
}
