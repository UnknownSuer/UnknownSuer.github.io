import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

export function Chip({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-[0.12em]",
        className ?? "border-ink/20 text-ink/80",
      )}
    >
      {children}
    </span>
  );
}
