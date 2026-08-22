import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/shared/ui/Container";
import { ButtonLink } from "@/shared/ui/Button";
import { SITE } from "@/shared/config/site";
import { withBasePath } from "@/shared/lib/base-path";

export const metadata: Metadata = {
  title: "О нас",
  description:
    "АНГАР — продакшн Амира Абдурахманова (Amigo Kiz): VFX, CGI и UGC из Москвы и Кизилюрта. История, миссия и команда студии.",
};

const FACTS = [
  { value: "03", label: "направления: VFX, CGI, UGC" },
  { value: "02", label: "база: Кизилюрт, Дагестан" },
  { value: "2026", label: "год первых открытых потоков" },
  { value: "∞", label: "часов рендера позади" },
];

export default function AboutPage() {
  return (
    <Container className="py-12 md:py-16">
      <h1 className="font-display text-[clamp(1.75rem,8vw,3.75rem)] font-bold uppercase leading-none tracking-tight text-ink [overflow-wrap:anywhere]">
        О нас
      </h1>

      <p className="mt-8 max-w-3xl text-xl font-medium leading-relaxed text-ink md:text-2xl">
        Ангар — продакшн Амира Абдурахманова (Amigo Kiz): CGI-дизайнера и
        видеомейкера из Москвы с корнями в Кизилюрте. Делаем VFX и UGC для
        брендов — и учим этому на собственных интенсивах.
      </p>

      <div className="mt-12 grid grid-cols-2 border-y border-ink/10 md:grid-cols-4 md:divide-x md:divide-ink/10">
        {FACTS.map((fact) => (
          <div key={fact.label} className="p-6 md:p-8">
            <p className="font-display text-3xl font-bold tracking-tight text-ink md:text-4xl">
              {fact.value}
            </p>
            <p className="mt-2 font-mono text-[11px] uppercase leading-relaxed tracking-[0.14em] text-muted">
              {fact.label}
            </p>
          </div>
        ))}
      </div>

      <section className="mt-16 grid gap-10 md:grid-cols-2 md:gap-14">
        <h2 className="font-display text-2xl font-semibold uppercase tracking-tight text-ink md:text-3xl">
          История
        </h2>
        <div className="space-y-4 text-[15px] leading-relaxed text-ink/80">
          <p>
            Всё началось с одержимости картинкой: 3D-скульпты, симуляции и
            бесконечные ночные рендеры. Из личных проектов — вроде
            фотореалистичной модели Флойда Мейвезера, опубликованной на Behance —
            выросли коммерческие заказы: CGI для брендов, VFX для клипов,
            нативный контент для соцсетей.
          </p>
          <p>
            Под вывеской <strong>@kiz.bros</strong> («By @amigokiz Production»)
            собралась команда, которая закрывает продакшн целиком: от сценария и
            съёмки до симуляций и финального грейда.
          </p>
          <p>
            Ангар — это место сборки: здесь принимаются заказы на VFX и UGC, и
            здесь же мы учим тех, кто хочет в эту индустрию. Без «теории ради
            теории» — только пайплайн, который реально используется в
            коммерческих проектах.
          </p>
        </div>
      </section>

      <section className="mt-16 rounded-2xl bg-wood p-8 md:p-14">
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-ink/60">
          Миссия
        </p>
        <p className="mt-5 max-w-3xl font-display text-2xl font-semibold uppercase leading-snug tracking-tight text-ink md:text-4xl">
          Показать, что мировой уровень CGI можно делать откуда угодно — и
          научить этому других.
        </p>
      </section>

      <section className="mt-16">
        <h2 className="font-display text-2xl font-semibold uppercase tracking-tight text-ink md:text-3xl">
          Команда
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="flex gap-5 rounded-xl border border-ink/10 p-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={withBasePath("/media/posters/avatar-amir.svg")}
              alt="Амир Абдурахманов"
              width="96"
              height="96"
              className="size-20 shrink-0 rounded-xl object-cover md:size-24"
            />
            <div>
              <h3 className="font-display text-base font-semibold uppercase tracking-tight text-ink">
                Амир Абдурахманов
              </h3>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                Amigo Kiz · основатель · CGI / VFX
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink/70">
                Ведёт проекты студии и все интенсивы. Верит, что насмотренность
                + практика решают больше, чем софт.
              </p>
              <a
                href={SITE.behanceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-sm font-semibold text-ember-deep transition duration-150 hover:text-ember"
              >
                Behance ↗
              </a>
            </div>
          </div>

          <Link
            href="/contacts"
            className="group flex flex-col justify-center rounded-xl border border-dashed border-ink/25 p-6 transition duration-150 hover:border-ink/50 hover:bg-warm"
          >
            <h3 className="font-display text-base font-semibold uppercase tracking-tight text-ink">
              + Это можешь быть ты
            </h3>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink/70">
              Собираем команду под проекты: 3D-дженералисты, композеры,
              UGC-креаторы. Присылай портфолио.
            </p>
            <span className="mt-4 text-sm font-semibold text-ember-deep transition duration-150 group-hover:translate-x-1">
              Написать →
            </span>
          </Link>
        </div>
      </section>

      <div className="mt-16 flex flex-wrap gap-3">
        <ButtonLink href="/portfolio" variant="outline">
          Смотреть работы
        </ButtonLink>
        <ButtonLink href="/courses">Выбрать курс</ButtonLink>
      </div>
    </Container>
  );
}
