import Link from "next/link";
import { Hero } from "@/widgets/hero/Hero";
import { Ticker } from "@/widgets/ticker/Ticker";
import { Container } from "@/shared/ui/Container";
import { SectionHeader } from "@/shared/ui/SectionHeader";
import { ButtonLink } from "@/shared/ui/Button";
import { ProjectCard } from "@/entities/project/ProjectCard";
import { getProjects } from "@/entities/project/data";
import { getNearestCourse } from "@/entities/course/data";
import { COURSE_ACCENTS } from "@/entities/course/accents";
import { DIRECTION_LABELS } from "@/shared/config/directions";
import { formatDateFull, formatPrice, weeksLabel } from "@/shared/lib/format";
import { cn } from "@/shared/lib/cn";

const DIRECTIONS = [
  {
    index: "01",
    title: "VFX-визуализация",
    text: "Эффекты, симуляции и CGI-интеграция для клипов, рекламы и кино. От одного шота до полного пайплайна.",
    href: "/contacts#brief",
    cta: "Обсудить проект",
    highlight: false,
  },
  {
    index: "02",
    title: "UGC-контент",
    text: "Нативные ролики для брендов: сценарий, продакшн, монтаж. Контент, который не выглядит рекламой — и поэтому работает.",
    href: "/contacts#brief",
    cta: "Заказать контент",
    highlight: false,
  },
  {
    index: "03",
    title: "Обучение",
    text: "Интенсивы по VFX, CGI и UGC от практиков студии. Портфолио вместо сертификата — хотя сертификат тоже будет.",
    href: "/courses",
    cta: "Выбрать курс",
    highlight: true,
  },
];

export default function HomePage() {
  const featured = getProjects().slice(0, 4);
  const nearest = getNearestCourse();
  const accent = COURSE_ACCENTS[nearest.accent];

  return (
    <>
      <Hero />
      <Ticker />

      {/* 01 — Направления */}
      <section>
        <Container className="py-16 md:py-24">
          <SectionHeader index="01" label="Направления" title="Чем занимается Ангар" />
          <div className="grid gap-4 md:grid-cols-3">
            {DIRECTIONS.map((d) => (
              <Link
                key={d.index}
                href={d.href}
                className={cn(
                  "group flex min-h-[230px] flex-col rounded-xl border p-6 transition duration-150 hover:-translate-y-1 hover:shadow-lift",
                  d.highlight
                    ? "border-wood-deep/40 bg-wood"
                    : "border-ink/10 bg-warm hover:border-ink/25",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-ink/50">[{d.index}]</span>
                  <span
                    aria-hidden="true"
                    className="font-mono text-ink/40 transition duration-150 group-hover:translate-x-1 group-hover:text-ink"
                  >
                    →
                  </span>
                </div>
                <h3 className="mt-8 font-display text-xl font-semibold uppercase tracking-tight text-ink">
                  {d.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink/65">{d.text}</p>
                <span className="mt-auto pt-6 text-sm font-semibold text-ember-deep">
                  {d.cta}
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* 02 — Избранные работы */}
      <section className="border-t border-ink/10">
        <Container className="py-16 md:py-24">
          <SectionHeader
            index="02"
            label="Избранные работы"
            action={
              <Link
                href="/portfolio"
                className="font-mono text-xs uppercase tracking-[0.18em] text-ember-deep transition duration-150 hover:text-ember"
              >
                Все работы →
              </Link>
            }
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </Container>
      </section>

      {/* 03 — Ближайший поток */}
      <section className="border-t border-ink/10">
        <Container className="py-16 md:py-24">
          <SectionHeader index="03" label="Ближайший поток" />
          <div
            className={cn(
              "grid items-end gap-8 rounded-2xl p-7 md:grid-cols-[1fr_auto] md:p-12",
              accent.bg,
              accent.text,
            )}
          >
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em]">
                Поток {nearest.stream} — {DIRECTION_LABELS[nearest.direction]}
              </p>
              <h3 className="mt-4 max-w-2xl font-display text-2xl font-semibold uppercase leading-tight tracking-tight md:text-4xl">
                {nearest.title}
              </h3>
              <p className={cn("mt-4 max-w-xl text-sm leading-relaxed md:text-base", accent.sub)}>
                {nearest.short}
              </p>
              <p className={cn("mt-5 font-mono text-xs uppercase tracking-[0.16em]", accent.sub)}>
                Старт {formatDateFull(nearest.startDate)} · {weeksLabel(nearest.weeks)} ·{" "}
                {nearest.format}
              </p>
            </div>
            <div className="flex flex-col items-start gap-4 md:items-end">
              <span className={cn("font-mono text-3xl font-medium", accent.price)}>
                {formatPrice(nearest.price)}
              </span>
              <ButtonLink href={`/courses/${nearest.slug}`} size="lg">
                К курсу
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>

      {/* 04 — О студии */}
      <section className="border-t border-ink/10 bg-warm">
        <Container className="py-16 md:py-24">
          <SectionHeader index="04" label="О студии" />
          <p className="max-w-4xl font-display text-2xl font-semibold uppercase leading-snug tracking-tight text-ink md:text-4xl">
            Ангар — продакшн Amigo Kiz. Снимаем, рендерим и учим — из Кизилюрта, работаем с проектами
            по всей России и за её пределами.
          </p>
          <ButtonLink href="/about" variant="outline" className="mt-8 bg-white">
            Подробнее о нас
          </ButtonLink>
        </Container>
      </section>
    </>
  );
}
