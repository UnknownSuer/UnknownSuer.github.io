import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

type Variant = "primary" | "outline" | "dark" | "light" | "ghost";
type Size = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap transition duration-150 disabled:pointer-events-none disabled:opacity-50";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-ember text-white hover:bg-ember-deep",
  outline: "border border-ink/15 bg-transparent text-ink hover:border-ink/45 hover:bg-warm",
  dark: "bg-ink text-white hover:bg-black",
  light: "bg-white text-ink hover:bg-warm",
  ghost: "text-ink hover:bg-warm",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-[15px]",
  lg: "h-12 px-8 text-base",
};

type StyleProps = { variant?: Variant; size?: Size };

export function buttonClasses({ variant = "primary", size = "md" }: StyleProps, className?: string) {
  return cn(BASE, VARIANTS[variant], SIZES[size], className);
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & StyleProps) {
  return <button type={type} className={buttonClasses({ variant, size }, className)} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<typeof Link> & StyleProps) {
  return <Link className={buttonClasses({ variant, size }, className)} {...props} />;
}
