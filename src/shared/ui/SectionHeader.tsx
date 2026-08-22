import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

/**
 * Editorial-заголовок секции: [01] МЕТКА ────────── действие
 *                              Крупный заголовок
 */
export function SectionHeader({
  index,
  label,
  title,
  action,
  className,
}: {
  index: string;
  label: string;
  title?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-8 md:mb-10", className)}>
      <div className="flex items-center gap-4">
        <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
          [{index}] {label}
        </span>
        <span className="h-px flex-1 bg-ink/10" aria-hidden="true" />
        {action}
      </div>
      {title && (
        <h2 className="mt-5 font-display text-2xl font-semibold uppercase leading-tight tracking-tight text-ink md:text-4xl">
          {title}
        </h2>
      )}
    </div>
  );
}
