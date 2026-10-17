"use client";

import { useEffect, useState } from "react";

/**
 * Widget topbar header:
 * 1. Jam sistem — hari, tanggal, dan jam (zona Asia/Jakarta)
 * 2. Pemilih bahasa — Indonesia (default), English, Arabic
 *    via Google Translate Element (penerjemahan otomatis di sisi browser).
 */

const LANGS = [
  { code: "id", label: "Bahasa Indonesia", short: "ID" },
  { code: "en", label: "English", short: "EN" },
  { code: "ar", label: "العربية (Arab)", short: "AR" },
] as const;

function Flag({ code }: { code: string }) {
  const common = "h-3.5 w-5 rounded-[3px] ring-1 ring-black/15";
  if (code === "id") {
    return (
      <svg viewBox="0 0 24 16" className={common} aria-hidden>
        <rect width="24" height="8" fill="#CE1126" />
        <rect y="8" width="24" height="8" fill="#fff" />
      </svg>
    );
  }
  if (code === "en") {
    return (
      <svg viewBox="0 0 24 16" className={common} aria-hidden>
        <rect width="24" height="16" fill="#012169" />
        <path d="M0 0L24 16M24 0L0 16" stroke="#fff" strokeWidth="3.2" />
        <path d="M0 0L24 16M24 0L0 16" stroke="#C8102E" strokeWidth="1.6" />
        <rect x="9.2" width="5.6" height="16" fill="#fff" />
        <rect y="5.2" width="24" height="5.6" fill="#fff" />
        <rect x="10.6" width="2.8" height="16" fill="#C8102E" />
        <rect y="6.6" width="24" height="2.8" fill="#C8102E" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 16" className={common} aria-hidden>
      <rect width="24" height="16" fill="#006C35" />
      <rect x="4" y="6.4" width="16" height="1.4" rx="0.7" fill="#fff" />
      <rect x="7" y="9.6" width="10" height="1.1" rx="0.55" fill="#fff" />
    </svg>
  );
}

type GoogleNS = {
  translate?: {
    TranslateElement?: new (
      options: Record<string, unknown>,
      elementId: string,
    ) => unknown;
  };
};

declare global {
  interface Window {
    google?: GoogleNS;
    googleTranslateElementInit?: () => void;
  }
}

function setGoogTransCookie(lang: string) {
  const value = `/id/${lang}`;
  document.cookie = `googtrans=${value};path=/`;
  document.cookie = `googtrans=${value};path=/;domain=${window.location.hostname}`;
}

export function TopbarWidgets() {
  const [now, setNow] = useState<Date | null>(null);
  const [active, setActive] = useState("id");

  // Jam sistem — render hanya di client agar tidak konflik hydration
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Muat Google Translate Element sekali
  useEffect(() => {
    if (document.getElementById("google-translate-script")) return;
    window.googleTranslateElementInit = () => {
      try {
        const translateNS = window.google?.translate?.TranslateElement;
        if (!translateNS) return;
        new translateNS(
          { pageLanguage: "id", includedLanguages: "id,en,ar", autoDisplay: false, layout: 0 },
          "google-translate-holder",
        );
        // sinkronkan status aktif dari cookie (penerjemahan persist antar halaman)
        const m = document.cookie.match(/googtrans=\/id\/(en|ar)/);
        if (m) setActive(m[1]);
      } catch {
        /* jaringan pihak ketiga tidak tersedia — abaikan */
      }
    };
    const s = document.createElement("script");
    s.id = "google-translate-script";
    s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    s.async = true;
    document.body.appendChild(s);
  }, []);

  function changeLang(lang: string) {
    setActive(lang);
    setGoogTransCookie(lang);
    const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
    if (combo) {
      combo.value = lang;
      combo.dispatchEvent(new Event("change"));
    } else {
      // Widget belum siap — cookie sudah diset; muat ulang agar diterapkan.
      window.location.reload();
    }
  }

  const tanggal = now
    ? new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Jakarta",
      }).format(now)
    : "";
  const jam = now
    ? new Intl.DateTimeFormat("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: "Asia/Jakarta",
      }).format(now)
    : "--:--:--";

  return (
    <div className="flex shrink-0 items-center gap-2 sm:gap-4">
      {/* Jam sistem */}
      <time
        suppressHydrationWarning
        dateTime={now?.toISOString()}
        className="flex items-center gap-1.5 text-[11px] leading-tight text-white/85 sm:text-xs"
        aria-label="Tanggal dan jam saat ini"
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 text-gold-400" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" strokeLinecap="round" />
        </svg>
        <span suppressHydrationWarning className="hidden md:inline">{tanggal}</span>
        <span suppressHydrationWarning className="hidden md:inline text-white/40">·</span>
        <span suppressHydrationWarning className="font-semibold tabular-nums">{jam} WIB</span>
      </time>

      {/* Pemilih bahasa */}
      <div className="flex items-center gap-1 rounded-full bg-white/10 p-0.5" role="group" aria-label="Pilihan bahasa">
        {LANGS.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => changeLang(l.code)}
            aria-label={`Ganti bahasa: ${l.label}`}
            aria-pressed={active === l.code}
            title={l.label}
            className={`flex items-center gap-1 rounded-full px-1.5 py-1 transition ${
              active === l.code ? "bg-gold-400 shadow-sm" : "hover:bg-white/15"
            }`}
          >
            <Flag code={l.code} />
            <span className={`text-[10px] font-bold ${active === l.code ? "text-brand-800" : "text-white/80"}`}>
              {l.short}
            </span>
          </button>
        ))}
      </div>

      {/* Mount point widget Google Translate (disembunyikan — UI asli kami sendiri) */}
      <div id="google-translate-holder" className="hidden" aria-hidden />
    </div>
  );
}
