import Link from "next/link";
import type { Course } from "@/entities/course/types";
import { COURSE_ACCENTS } from "@/entities/course/accents";
import { DIRECTION_LABELS } from "@/shared/config/directions";
import { formatDateShort, formatPrice, weeksLabel } from "@/shared/lib/format";
import { cn } from "@/shared/lib/cn";
import { withBasePath } from "@/shared/lib/base-path";

/** Плакатная карточка курса для афиши. */
export function CourseCard({ course }: { course: Course }) {
  const a = COURSE_ACCENTS[course.accent];
  return (
    <Link
      href={`/courses/${course.slug}`}
      className={cn(
        "group flex flex-col rounded-xl p-5 transition duration-150 hover:-translate-y-1 hover:shadow-lift md:p-6",
        a.bg,
        a.text,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-xs uppercase tracking-[0.2em]">
          Поток {course.stream}
        </span>
        <span
          className={cn(
            "rounded-full border px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-[0.12em]",
            a.chip,
          )}
        >
          {DIRECTION_LABELS[course.direction]}
        </span>
      </div>

      <h3 className="mt-4 font-display text-xl font-semibold uppercase leading-tight tracking-tight md:text-[1.35rem]">
        {course.title}
      </h3>

      <div className="mt-4 overflow-hidden rounded-md">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={withBasePath(course.poster)}
          alt=""
          loading="lazy"
          decoding="async"
          className="aspect-[16/10] w-full object-cover transition duration-150 group-hover:scale-[1.03]"
        />
      </div>

      <p className={cn("mt-4 font-mono text-xs uppercase tracking-[0.14em]", a.sub)}>
        {formatDateShort(course.startDate)} · {weeksLabel(course.weeks)} ·{" "}
        {course.format}
      </p>

      <div className={cn("mt-4 h-px w-full", a.rule)} aria-hidden="true" />

      <div className="mt-4 flex items-end justify-between gap-3">
        <span className={cn("font-mono text-2xl font-medium", a.price)}>
          ▸ {formatPrice(course.price)}
        </span>
        <span
          className={cn(
            "font-mono text-xs uppercase tracking-[0.14em] transition duration-150 group-hover:translate-x-1",
            a.sub,
          )}
        >
          Подробнее →
        </span>
      </div>
    </Link>
  );
}
