import type { ReactNode } from "react";

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  light = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  light?: boolean;
}) {
  return (
    <div className={`${align === "center" ? "text-center mx-auto" : "text-left"} max-w-2xl mb-10`}>
      {eyebrow && (
        <p
          className={`mb-2 text-xs font-display font-bold uppercase tracking-[0.2em] ${
            light ? "text-gold-400" : "text-gold-500"
          }`}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={`font-display text-3xl sm:text-4xl font-bold leading-tight ${
          light ? "text-white" : "text-brand-700"
        }`}
      >
        {title}
      </h2>
      {description && (
        <p className={`mt-3 text-base leading-relaxed ${light ? "text-white/75" : "text-ink-soft"}`}>
          {description}
        </p>
      )}
      <div
        className={`mt-5 h-1 w-16 rounded-full bg-gold-400 ${align === "center" ? "mx-auto" : ""}`}
        aria-hidden="true"
      />
    </div>
  );
}

export function Badge({
  children,
  tone = "brand",
}: {
  children: ReactNode;
  tone?: "brand" | "gold" | "dark" | "light";
}) {
  const tones: Record<string, string> = {
    brand: "bg-brand-50 text-brand-700 border-brand-200",
    gold: "bg-gold-100 text-gold-500 border-gold-400/40",
    dark: "bg-brand-700 text-white border-brand-700",
    light: "bg-white/15 text-white border-white/25 backdrop-blur-sm",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-display font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
