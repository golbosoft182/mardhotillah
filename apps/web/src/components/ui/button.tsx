import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "gold" | "outline" | "ghost" | "white";
type Size = "sm" | "md" | "lg";

const styles: Record<Variant, string> = {
  primary:
    "bg-brand-500 text-white hover:bg-brand-700 shadow-sm hover:shadow-card active:translate-y-px",
  gold: "bg-gold-400 text-brand-800 hover:bg-sun-400 shadow-sm hover:shadow-card active:translate-y-px",
  outline:
    "border border-brand-500/30 text-brand-700 bg-white/70 hover:bg-brand-50 hover:border-brand-500/60",
  ghost: "text-brand-700 hover:bg-brand-50",
  white: "bg-white text-brand-700 hover:bg-brand-50 shadow-sm",
};

const sizes: Record<Size, string> = {
  sm: "px-3.5 py-2 text-sm gap-1.5",
  md: "px-5 py-2.5 text-sm gap-2",
  lg: "px-7 py-3.5 text-base gap-2",
};

const base =
  "inline-flex items-center justify-center rounded-full font-display font-semibold tracking-wide transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none";

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: CommonProps & ComponentProps<"button">) {
  return (
    <button className={`${base} ${styles[variant]} ${sizes[size]} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className = "",
  children,
  href,
  ...rest
}: CommonProps & ComponentProps<typeof Link>) {
  return (
    <Link href={href} className={`${base} ${styles[variant]} ${sizes[size]} ${className}`} {...rest}>
      {children}
    </Link>
  );
}
