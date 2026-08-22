import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourse, getCourses, getCourseTeachers } from "@/entities/course/data";
import { COURSE_ACCENTS } from "@/entities/course/accents";
import { DIRECTION_LABELS } from "@/shared/config/directions";
import { Container } from "@/shared/ui/Container";
import { SectionHeader } from "@/shared/ui/SectionHeader";
import { ProgramAccordion } from "@/features/course-program/ProgramAccordion";
import { BuyCourse } from "@/features/buy-course/BuyCourse";
import { formatDateFull, formatPrice, weeksLabel } from "@/shared/lib/format";
import { cn } from "@/shared/lib/cn";
import { withBasePath } from "@/shared/lib/base-path";

export function generateStaticParams() {
  return getCourses().map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) return {};
  return {
    title: `${course.title} — поток ${course.stream}`,
    description: `${course.short} Старт ${formatDateFull(course.startDate)}, ${weeksLabel(course.weeks)}, от ${formatPrice(course.price)}.`,
  };
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();

  const accent = COURSE_ACCENTS[course.accent];
  const teachers = getCourseTeachers(course);
  const buyProps = {
    course: { slug: course.slug, stream: course.stream, title: course.title },
    tariffs: course.tariffs,
  };

  return (
    <>
      <Container className="pb-24 pt-8 md:pb-16">
        {/* Хиро-плакат курса */}
        <nav aria-label="Хлебные крошки">
          <Link
            href="/courses"
            className="font-mono text-xs uppercase tracking-[0.2em] text-muted transition duration-150 hover:text-ink"
          >
            ← Все курсы
          </Link>
        </nav>

        <section
          className={cn("mt-5 rounded-2xl p-7 md:p-12", accent.bg, accent.text)}
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-[0.2em]">
              Поток {course.stream}
            </span>
            <span
              className={cn(
                "rounded-full border px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-[0.12em]",
                accent.chip,
              )}
            >
              {DIRECTION_LABELS[course.direction]}
            </span>
          </div>
          <h1 className="mt-5 max-w-3xl font-display text-3xl font-bold uppercase leading-tight tracking-tight md:text-5xl">
            {course.title}
          </h1>
          <p className={cn("mt-5 max-w-2xl text-[15px] leading-relaxed md:text-base", accent.sub)}>
            {course.short}
          </p>
          <div
            className={cn(
              "mt-7 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs uppercase tracking-[0.16em]",
              accent.sub,
            )}
          >
            <span>Старт {formatDateFull(course.startDate)}</span>
            <span>{weeksLabel(course.weeks)}</span>
            <span>{course.format}</span>
            <span>Мест: {course.seats}</span>
          </div>
        </section>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px] lg:gap-14">
          <div className="min-w-0">
            {/* Программа */}
            <SectionHeader index="01" label="Программа" />
            <ProgramAccordion program={course.program} />

            {/* Кому подходит / результат */}
            <SectionHeader index="02" label="Кому и зачем" className="mt-14" />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-warm p-6">
                <h3 className="font-display text-sm font-semibold uppercase tracking-tight text-ink">
                  Кому подходит
                </h3>
                <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-ink/75">
                  {course.audience.map((item) => (
                    <li key={item} className="flex gap-2.5">
                      <span aria-hidden="true" className="mt-px text-ember">
                        ▪
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl bg-warm p-6">
                <h3 className="font-display text-sm font-semibold uppercase tracking-tight text-ink">
                  Что будет на выходе
                </h3>
                <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-ink/75">
                  {course.outcomes.map((item) => (
                    <li key={item} className="flex gap-2.5">
                      <span aria-hidden="true" className="mt-px text-ember">
                        ✓
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Тарифы */}
            <SectionHeader index="03" label="Тарифы" className="mt-14" />
            <div className="grid gap-4 md:grid-cols-3">
              {course.tariffs.map((tariff) => (
                <div
                  key={tariff.id}
                  className={cn(
                    "flex flex-col rounded-xl border bg-white p-6",
                    tariff.popular
                      ? "border-ember ring-1 ring-ember"
                      : "border-ink/10",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-base font-semibold uppercase tracking-tight text-ink">
                      {tariff.name}
                    </h3>
                    {tariff.popular && (
                      <span className="rounded-full bg-ember px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-white">
                        хит
                      </span>
                    )}
                  </div>
                  <p className="mt-3 font-mono text-2xl font-medium text-ink">
                    {formatPrice(tariff.price)}
                  </p>
                  <ul className="mt-5 space-y-2 text-sm leading-relaxed text-ink/70">
                    {tariff.features.map((f) => (
                      <li key={f} className="flex gap-2.5">
                        <span aria-hidden="true" className="mt-px text-ember">
                          ✓
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-6">
                    <BuyCourse
                      {...buyProps}
                      defaultTariffId={tariff.id}
                      label="Выбрать"
                      variant={tariff.popular ? "primary" : "outline"}
                      className="w-full"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Преподаватели — из контент-пака, правятся в /admin */}
            {teachers.length > 0 && (
              <>
                <SectionHeader
                  index="04"
                  label={teachers.length > 1 ? "Преподаватели" : "Преподаватель"}
                  className="mt-14"
                />
                <div className="space-y-4">
                  {teachers.map((teacher) => (
                    <div
                      key={teacher.id}
                      className="flex flex-col gap-5 rounded-xl bg-warm p-5 sm:flex-row sm:items-start sm:gap-6 md:p-8"
                    >
                      {teacher.photo && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={withBasePath(teacher.photo)}
                          alt={teacher.name}
                          width="112"
                          height="112"
                          className="size-20 shrink-0 rounded-xl object-cover sm:size-24 md:size-28"
                        />
                      )}
                      <div className="min-w-0">
                        <h3 className="font-display text-base font-semibold uppercase tracking-tight text-ink md:text-lg">
                          {teacher.name}
                        </h3>
                        {teacher.role && (
                          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                            {teacher.role}
                          </p>
                        )}
                        {teacher.bio && (
                          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink/75">
                            {teacher.bio}
                          </p>
                        )}
                        {teacher.links.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                            {teacher.links.map((link) => (
                              <a
                                key={link.url}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-semibold text-ember-deep transition duration-150 hover:text-ember"
                              >
                                {link.label} ↗
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Sticky-карточка покупки (десктоп) */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-xl border border-ink/10 bg-white p-6 shadow-[0_8px_30px_rgb(23_24_26/0.06)]">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                Поток {course.stream} · старт {formatDateFull(course.startDate)}
              </p>
              <p className="mt-4 flex items-baseline gap-2">
                <span className="text-sm text-muted">от</span>
                <span className="font-mono text-3xl font-medium text-ink">
                  {formatPrice(course.price)}
                </span>
              </p>
              <p className="mt-2 text-sm text-muted">
                {weeksLabel(course.weeks)} · {course.format} · мест:{" "}
                {course.seats}
              </p>
              <BuyCourse {...buyProps} label="Купить курс" className="mt-5 w-full" size="lg" />
              <p className="mt-4 text-center font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-muted">
                ЮKassa · рассрочка по запросу
                <br />
                возврат по оферте
              </p>
            </div>
          </aside>
        </div>
      </Container>

      {/* Фиксированная панель покупки (мобилка).
          data-sticky-cta читает cookie-баннер, чтобы не перекрыть кнопку. */}
      <div
        data-sticky-cta
        className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-white/95 px-4 py-3 backdrop-blur-md lg:hidden"
      >
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4">
          <div>
            <p className="font-mono text-base font-medium leading-tight text-ink">
              от {formatPrice(course.price)}
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              старт {formatDateFull(course.startDate)}
            </p>
          </div>
          <BuyCourse {...buyProps} label="Купить курс" />
        </div>
      </div>
    </>
  );
}
