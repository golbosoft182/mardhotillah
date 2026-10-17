"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";import { LogIn, Loader2, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3102"}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Login gagal");
      localStorage.setItem("ym_session", JSON.stringify(data));
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login gagal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Panel kiri: branding */}
      <div className="hidden flex-1 flex-col justify-between bg-brand-700 p-12 lg:flex">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-400 font-display text-xl font-bold text-brand-800">M</span>
            <span className="font-display text-xl font-bold text-white">Yayasan Mardhotillah</span>
          </div>
          <h1 className="mt-16 max-w-md font-display text-4xl font-bold leading-tight text-white">
            Kelola konten website dengan mudah
          </h1>
          <p className="mt-4 max-w-md text-white/70">
            Satu CMS untuk berita, halaman, agenda, prestasi, galeri, PPDB, dan pengaturan SEO seluruh satuan pendidikan.
          </p>
        </div>
        <p className="text-sm text-white/50">© {new Date().getFullYear()} Yayasan Mardhotillah</p>
      </div>

      {/* Panel kanan: form */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500 font-display text-xl font-bold text-white">M</span>
            <h1 className="mt-3 font-display text-xl font-bold text-brand-700">CMS Mardhotillah</h1>
          </div>
          <h2 className="font-display text-2xl font-bold text-ink">Masuk ke CMS</h2>
          <p className="mt-1 text-sm text-ink-soft">Gunakan akun yang diberikan administrator.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft/50" aria-hidden />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@yayasanmardhotillah.com"
                  className="w-full rounded-xl border border-brand-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-brand-500"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft/50" aria-hidden />
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-brand-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-brand-500"
                />
              </div>
            </div>

            {error && (
              <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3.5 font-display font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <LogIn className="h-4 w-4" aria-hidden />}
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-ink-soft">
            <Link href="/" className="underline hover:text-brand-600">← Kembali ke website</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
