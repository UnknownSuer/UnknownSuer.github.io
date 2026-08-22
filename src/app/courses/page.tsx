import type { Metadata } from "next";
import { Container } from "@/shared/ui/Container";
import { ButtonLink } from "@/shared/ui/Button";
import { CoursesGrid } from "@/features/courses-filter/CoursesGrid";
import { getPublishedCourses } from "@/entities/course/data";
import { pluralizeRu } from "@/shared/lib/format";

export const metadata: Metadata = {
  title: "Курсы и интенсивы",
  description:
    "Интенсивы АНГАРА по VFX, CGI/3D и UGC: программы, даты потоков, цены. Онлайн-обучение от практиков студии AmigoKiz Production.",
};

const STEPS = [
  {
    index: "01",
    title: "Живые созвоны и записи",
    text: "Уроки в записи — смотрите когда удобно; созвоны с разбором — по расписанию потока.",
  },
  {
    index: "02",
    title: "Домашки с разбором",
    text: "Каждый модуль — практика. На тарифах с куратором работы разбираются лично.",
  },
  {
    index: "03",
    title: "Чат потока",
    text: "Комьюнити, взаимопомощь и нетворкинг — чат живёт и после конца потока.",
  },
];

export default function CoursesPage() {
  const courses = getPublishedCourses();

  return (
    <Container className="py-12 md:py-16">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <h1 className="font-display text-[clamp(1.75rem,8vw,3.75rem)] font-bold uppercase leading-none tracking-tight text-ink [overflow-wrap:anywhere]">
          Интенсивы_2026
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-mono text-sm text-muted">
            {courses.length}{" "}
            {pluralizeRu(courses.length, ["поток", "потока", "потоков"])} · онлайн
          </p>
          <ButtonLink href="/cabinet" variant="outline" size="sm">
            Личный кабинет →
          </ButtonLink>
        </div>
      </div>

      <div className="mt-10">
        <CoursesGrid courses={courses} />
      </div>

      <section className="mt-16 border-t border-ink/10 pt-12 md:mt-24">
        <div className="grid gap-4 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.index} className="rounded-xl bg-warm p-6">
              <span className="font-mono text-xs text-ink/50">[{s.index}]</span>
              <h2 className="mt-4 font-display text-base font-semibold uppercase tracking-tight text-ink">
                {s.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink/65">{s.text}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 font-mono text-[11px] uppercase leading-relaxed tracking-[0.16em] text-muted">
          Оплата — ЮKassa · чек самозанятого уходит в ФНС автоматически · возврат
          — по условиям публичной оферты
        </p>
      </section>
    </Container>
  );
}
