"use client";

import { useRouter } from "next/navigation";
import { RotateCcw, SlidersHorizontal } from "lucide-react";

export interface BkkFilterValue {
  company: string;
  position: string;
  from: string;
  to: string;
  sort: string;
}

const REQUIRED_MSG = "Pilih tanggal mulai dan tanggal selesai";

/** Panel filter lowongan kerja: perusahaan, posisi, rentang tanggal, dan urutan. */
export function BkkFilter({
  companies,
  positions,
  value,
}: {
  companies: string[];
  positions: string[];
  value: BkkFilterValue;
}) {
  const router = useRouter();

  const active = Boolean(value.company || value.position || value.from || value.to || (value.sort && value.sort !== "newest"));

  function update(patch: Partial<BkkFilterValue>) {
    const next = { ...value, ...patch };
    const p = new URLSearchParams();
    if (next.company) p.set("company", next.company);
    if (next.position) p.set("position", next.position);
    if (next.from) p.set("from", next.from);
    if (next.to) p.set("to", next.to);
    if (next.sort && next.sort !== "newest") p.set("sort", next.sort);
    const qs = p.toString();
    router.push(qs ? `/bkk?${qs}` : "/bkk");
  }

  const selectCls =
    "w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm font-medium text-ink outline-none transition focus:border-brand-500";

  return (
    <div className="mb-8 rounded-2xl border border-brand-100 bg-white p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="inline-flex items-center gap-2 font-display text-sm font-bold text-brand-700">
          <SlidersHorizontal className="h-4 w-4" aria-hidden />
          Filter Lowongan
        </p>
        {active && (
          <button
            type="button"
            onClick={() => router.push("/bkk")}
            className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 px-3 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            Reset
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Perusahaan</span>
          <select className={selectCls} value={value.company} onChange={(e) => update({ company: e.target.value })}>
            <option value="">Semua Perusahaan</option>
            {companies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Posisi</span>
          <select className={selectCls} value={value.position} onChange={(e) => update({ position: e.target.value })}>
            <option value="">Semua Posisi</option>
            {positions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Dari Tanggal</span>
          <input
            type="date"
            className={selectCls}
            value={value.from}
            max={value.to || undefined}
            onChange={(e) => update({ from: e.target.value })}
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Sampai Tanggal</span>
          <input
            type="date"
            className={selectCls}
            value={value.to}
            min={value.from || undefined}
            onChange={(e) => update({ to: e.target.value })}
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Urutkan</span>
          <select className={selectCls} value={value.sort || "newest"} onChange={(e) => update({ sort: e.target.value })}>
            <option value="newest">Terbaru</option>
            <option value="oldest">Terlama</option>
          </select>
        </label>
      </div>

      {value.from && value.to && value.from > value.to && (
        <p className="mt-3 text-xs font-medium text-red-600">{REQUIRED_MSG} dengan benar (tanggal mulai melebihi tanggal selesai).</p>
      )}
    </div>
  );
}
