"use client";

import { useRouter } from "next/navigation";

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

/** Dropdown filter bulan (Jan–Des) + tahun. Nilai `YYYY-MM`; kosong = semua bulan. */
export function AgendaMonthFilter({ value, basePath = "/agenda" }: { value: string; basePath?: string }) {
  const router = useRouter();
  const now = new Date();
  const options: { value: string; label: string }[] = [{ value: "", label: "Semua Bulan" }];
  for (let year = now.getFullYear() - 1; year <= now.getFullYear() + 1; year++) {
    for (let m = 0; m < 12; m++) {
      options.push({ value: `${year}-${String(m + 1).padStart(2, "0")}`, label: `${MONTHS[m]} ${year}` });
    }
  }

  return (
    <div className="mb-10 flex justify-center">
      <label htmlFor="agenda-month" className="sr-only">
        Filter bulan agenda
      </label>
      <select
        id="agenda-month"
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          router.push(v ? `${basePath}?month=${v}` : basePath);
        }}
        className="rounded-full border border-brand-200 bg-white px-5 py-2.5 font-display text-sm font-semibold text-brand-700 shadow-card outline-none transition focus:border-brand-500"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
