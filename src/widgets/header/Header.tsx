"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV } from "@/shared/config/site";
import { ButtonLink } from "@/shared/ui/Button";
import { cn } from "@/shared/lib/cn";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-ink/10 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between px-4 md:px-8">
          <Link href="/" className="flex items-baseline gap-3" aria-label="АНГАР — на главную">
            <span className="font-display text-lg font-bold tracking-tight text-ink">
              АНГАР
            </span>
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.28em] text-muted lg:inline">
              amigokiz production
            </span>
          </Link>

          <nav className="hidden items-center gap-5 md:flex" aria-label="Основная навигация">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition duration-150 hover:text-ember-deep",
                  isActive(item.href) ? "text-ember-deep" : "text-ink",
                )}
              >
                {item.label}
              </Link>
            ))}
            <ButtonLink href="/contacts#brief" size="sm">
              Заказать услуги
            </ButtonLink>
          </nav>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
            className="flex size-10 flex-col items-center justify-center gap-1.5 rounded-md md:hidden"
          >
            <span
              className={cn(
                "h-0.5 w-5 bg-ink transition duration-150",
                open && "translate-y-1 rotate-45",
              )}
            />
            <span className={cn("h-0.5 w-5 bg-ink transition duration-150", open && "opacity-0")} />
            <span
              className={cn(
                "h-0.5 w-5 bg-ink transition duration-150",
                open && "-translate-y-1 -rotate-45",
              )}
            />
          </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto bg-white md:hidden">
          <nav className="flex flex-col px-4 py-6" aria-label="Мобильная навигация">
            {NAV.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-baseline justify-between border-b border-ink/10 py-5"
              >
                <span className="font-display text-2xl font-semibold uppercase tracking-tight text-ink">
                  {item.label}
                </span>
                <span className="font-mono text-xs text-muted">0{i + 1}</span>
              </Link>
            ))}
            <ButtonLink href="/contacts#brief" size="lg" className="mt-6 w-full">
              Заказать услуги
            </ButtonLink>
            <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
              amigokiz production · кизилюрт · дагестан
            </p>
          </nav>
        </div>
      )}
    </>
  );
}
