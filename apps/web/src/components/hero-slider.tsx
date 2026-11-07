"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Hero slider beranda — menampilkan beberapa foto + caption secara bergantian.
 * Data slide berasal dari CMS (Konten Beranda → Hero Slider) dengan fallback dummy.
 * Auto-play 6 detik, pause saat hover, navigasi panah + dots, aksesibel.
 */

export interface HeroSlide {
  image?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  primaryButton?: string;
  primaryLink?: string;
  secondaryButton?: string;
  secondaryLink?: string;
}

interface Props {
  slides: HeroSlide[];
  /** Ditampilkan bila slide tidak punya tombol sendiri */
  fallbackPrimary?: { label: string; href: string };
  fallbackSecondary?: { label: string; href: string };
}

const AUTOPLAY_MS = 6000;

export function HeroSlider({ slides, fallbackPrimary, fallbackSecondary }: Props) {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(true);
  const [paused, setPaused] = useState(false);
  const activeRef = useRef(0);
  activeRef.current = active;
  const pendingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reducedMotion = useRef(false);

  // Ganti slide: caption fade-out (300ms) → ganti konten → fade-in; gambar crossfade terpisah
  const goTo = useCallback(
    (i: number) => {
      const target = ((i % slides.length) + slides.length) % slides.length;
      if (target === activeRef.current) return;
      if (pendingTimer.current) clearTimeout(pendingTimer.current);
      setVisible(false);
      pendingTimer.current = setTimeout(() => {
        setActive(target);
        setVisible(true);
        pendingTimer.current = null;
      }, 300);
    },
    [slides.length],
  );

  const go = useCallback((dir: 1 | -1) => goTo(activeRef.current + dir), [goTo]);

  useEffect(() => {
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    if (paused || slides.length < 2 || reducedMotion.current) return;
    const t = setInterval(() => goTo(activeRef.current + 1), AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [paused, slides.length, goTo]);

  if (slides.length === 0) return null;

  return (
    <div
      className="absolute inset-0 w-full"
      role="region"
      aria-roledescription="carousel"
      aria-label="Foto dan pengumuman utama"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") go(-1);
        if (e.key === "ArrowRight") go(1);
      }}
      tabIndex={slides.length > 1 ? 0 : -1}
    >      {/* Gambar — crossfade antar slide */}
      {slides.map((slide, i) => (
        <div
          key={`img-${i}`}
          aria-hidden
          className={`absolute inset-0 transition-opacity duration-1000 ease-out ${
            i === active ? "z-0 opacity-100" : "z-0 opacity-0"
          }`}
        >
          <Image
            src={slide.image || "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1920&q=80"}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover object-center opacity-70"
          />
        </div>
      ))}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-brand-900/85 via-brand-800/55 to-brand-800/25" aria-hidden />

      {/* Caption — satu blok berganti fade (tidak pernah bertumpuk) */}
      {(() => {
        const slide = slides[active] ?? slides[0];
        const primary = {
          label: slide.primaryButton ?? fallbackPrimary?.label ?? "DAFTAR SPMB",
          href: slide.primaryLink ?? fallbackPrimary?.href ?? "/ppdb",
        };
        const secondary = {
          label: slide.secondaryButton ?? fallbackSecondary?.label ?? "HUBUNGI KAMI",
          href: slide.secondaryLink ?? fallbackSecondary?.href ?? "/kontak",
        };
        return (
          <div
            key={active}
            role="group"
            aria-roledescription="slide"
            aria-label={`Slide ${active + 1} dari ${slides.length}`}
            className={`absolute inset-0 z-10 transition-opacity duration-300 ${
              visible ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <div className="mx-auto flex h-full w-full max-w-6xl items-center px-4 pb-24 pt-16 sm:px-6 sm:pb-28 sm:pt-28 lg:px-8">
              <div className="max-w-3xl">
                {slide.eyebrow && (
                  <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 font-display text-xs font-semibold uppercase tracking-wider text-gold-300 backdrop-blur-sm">
                    {slide.eyebrow}
                  </p>
                )}
                <h1 className="mt-5 font-display text-4xl font-bold leading-[1.1] text-white sm:text-5xl lg:text-6xl">
                  {slide.title}
                </h1>
                {slide.description && (
                  <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
                    {slide.description}
                  </p>
                )}
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href={primary.href}
                    tabIndex={visible ? 0 : -1}
                    className="inline-flex items-center justify-center rounded-full bg-gold-400 px-7 py-3.5 font-display font-semibold text-brand-800 shadow-card transition hover:bg-sun-400 hover:shadow-lift"
                  >
                    {primary.label}
                  </Link>
                  <Link
                    href={secondary.href}
                    tabIndex={visible ? 0 : -1}
                    className="inline-flex items-center justify-center rounded-full border border-white/40 px-7 py-3.5 font-display font-semibold text-white transition hover:bg-white/10"
                  >
                    {secondary.label}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Panah */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Slide sebelumnya"
            className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white/85 backdrop-blur-sm transition hover:bg-white/25 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 sm:left-5"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Slide berikutnya"
            className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white/85 backdrop-blur-sm transition hover:bg-white/25 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 sm:right-5"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>

          {/* Dots */}
          <div className="absolute bottom-3.5 left-1/2 z-20 flex -translate-x-1/2 gap-2 sm:bottom-5">
            {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Ke slide ${i + 1}`}
                aria-current={i === active}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  i === active ? "w-8 bg-gold-400" : "w-2.5 bg-white/45 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
