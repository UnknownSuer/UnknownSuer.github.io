import Link from "next/link";
import { LEGAL_LINKS, META_DISCLAIMER, NAV, SITE } from "@/shared/config/site";

export function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-warm">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-14 md:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1.2fr_1.2fr]">
          <div>
            <p className="font-display text-2xl font-bold tracking-tight text-ink">
              АНГАР
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
              Продакшн Amigo Kiz: VFX-визуализация, CGI, UGC-контент и обучение.
            </p>
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
              {SITE.geo}
            </p>
          </div>

          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
              Разделы
            </p>
            <ul className="mt-4 space-y-2.5">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-ink transition duration-150 hover:text-ember-deep"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/cabinet"
                  className="text-sm text-ink transition duration-150 hover:text-ember-deep"
                >
                  Личный кабинет
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
              Документы
            </p>
            <ul className="mt-4 space-y-2.5">
              {LEGAL_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-ink transition duration-150 hover:text-ember-deep"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
              Контакты
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a
                  href={`mailto:${SITE.email}`}
                  className="text-ink transition duration-150 hover:text-ember-deep"
                >
                  {SITE.email}
                </a>
              </li>
              <li>
                <a
                  href={SITE.telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink transition duration-150 hover:text-ember-deep"
                >
                  Telegram {SITE.telegramHandle}
                </a>
              </li>
              <li>
                <a
                  href={SITE.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink transition duration-150 hover:text-ember-deep"
                >
                  Instagram* {SITE.instagramHandle} ↗
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col justify-between gap-3 border-t border-ink/10 pt-6 text-xs text-muted md:flex-row">
          <p>
            © 2026 АНГАР · {SITE.fullName}. {SITE.owner}, самозанятый (НПД).{" "}
            <Link href="/legal/requisites" className="underline underline-offset-2 hover:text-ink">
              Реквизиты
            </Link>
          </p>
          <p className="font-mono uppercase tracking-[0.2em]">vfx · cgi · ugc</p>
        </div>
        <p className="mt-4 max-w-2xl text-[11px] leading-snug text-muted/80">
          {META_DISCLAIMER}
        </p>
      </div>
    </footer>
  );
}
