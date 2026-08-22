import type { Metadata } from "next";
import { Container } from "@/shared/ui/Container";
import { SectionHeader } from "@/shared/ui/SectionHeader";
import { MapPanel } from "@/widgets/map/MapPanel";
import { BriefForm } from "@/features/brief/BriefForm";
import { META_DISCLAIMER, SITE } from "@/shared/config/site";
import Link from "next/link";
import { ButtonLink } from "@/shared/ui/Button";

export const metadata: Metadata = {
  title: "Контакты",
  description:
    "Контакты студии АНГАР: почта, Telegram, соцсети, карта. Бриф на VFX, CGI и UGC-проекты.",
};

const CONTACT_ROWS = [
  { label: "Email", value: SITE.email, href: `mailto:${SITE.email}` },
  { label: "Телефон", value: SITE.phone, href: `tel:${SITE.phone.replace(/[^+\d]/g, "")}` },
  { label: "Telegram", value: SITE.telegramHandle, href: SITE.telegramUrl, external: true },
  { label: "Instagram*", value: SITE.instagramHandle, href: SITE.instagramUrl, external: true },
];

export default function ContactsPage() {
  return (
    <>
      <Container className="py-12 md:py-16">
        <h1 className="font-display text-[clamp(1.75rem,8vw,3.75rem)] font-bold uppercase leading-none tracking-tight text-ink [overflow-wrap:anywhere]">
          Контакты
        </h1>

        <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <ul className="divide-y divide-ink/10 border-y border-ink/10">
              {CONTACT_ROWS.map((row) => (
                <li key={row.label} className="flex items-baseline justify-between gap-4 py-4">
                  <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
                    {row.label}
                  </span>
                  <a
                    href={row.href}
                    {...(row.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="text-right text-base font-medium text-ink transition duration-150 hover:text-ember-deep md:text-lg"
                  >
                    {row.value}
                    {row.external && " ↗"}
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
                Студия
              </p>
              <p className="mt-2 text-base font-medium text-ink">
                Дагестан, г. Кизилюрт, улица Цадаса, 39
              </p>
              <p className="mt-1 text-sm text-muted">
                Ориентир: Серый ангар у перекрестка.
              </p>
              <p className="mt-1 text-sm text-muted">
                Точка на карте: 43.199864, 46.863486. Работаем с проектами по всей
                России и зарубежом — удалённо.
              </p>
            </div>

            <p className="mt-8 text-sm text-muted">
              Реквизиты исполнителя —{" "}
              <Link
                href="/legal/requisites"
                className="underline underline-offset-2 hover:text-ink"
              >
                на странице реквизитов
              </Link>
              .
            </p>
            <p className="mt-4 max-w-md text-[11px] leading-snug text-muted/80">
              {META_DISCLAIMER}
            </p>
          </div>

          <MapPanel />
        </div>
      </Container>

      <section id="brief" className="scroll-mt-20 border-t border-ink/10 bg-warm">
        <Container className="py-16 md:py-20">
          <SectionHeader
            index="05"
            label="Бриф на проект"
            title="Расскажите, что нужно сделать"
          />
          <div className="grid gap-10 lg:grid-cols-[1fr_1.35fr] lg:gap-14">
            <div>
              <p className="max-w-md text-[15px] leading-relaxed text-ink/75">
                Опишите задачу свободно — формат, референсы, дедлайн. Мы
                вернёмся с уточняющими вопросами и вилкой по срокам и бюджету.
                Минимальная стоимость заказа — 100 000 рублей. NDA — не проблема.
              </p>
              <ol className="mt-8 space-y-4">
                {["Бриф", "Смета и сроки", "Продакшн"].map((step, i) => (
                  <li key={step} className="flex items-center gap-4">
                    <span className="flex size-9 items-center justify-center rounded-full border border-ink/15 font-mono text-xs text-ink">
                      0{i + 1}
                    </span>
                    <span className="text-sm font-medium text-ink">{step}</span>
                    {i < 2 && (
                      <span aria-hidden="true" className="font-mono text-muted">
                        →
                      </span>
                    )}
                  </li>
                ))}
              </ol>
              <p className="mt-8 font-mono text-[11px] uppercase leading-relaxed tracking-[0.16em] text-muted">
                Отвечаем в течение рабочего дня
              </p>

              <div className="mt-8 rounded-2xl border border-ink/10 bg-white p-5 md:p-6">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                  Или обратиться лично
                </p>
                <p className="mt-2 text-lg font-semibold text-ink">@amigokiz</p>
                <ButtonLink
                  href={SITE.telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="sm"
                  className="mt-4"
                >
                  Написать в Telegram ↗
                </ButtonLink>
              </div>
            </div>
            <BriefForm />
          </div>
        </Container>
      </section>
    </>
  );
}
