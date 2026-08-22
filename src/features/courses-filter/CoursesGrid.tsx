"use client";

import { useState } from "react";
import type { Course } from "@/entities/course/types";
import { CourseCard } from "@/entities/course/CourseCard";
import { DIRECTION_FILTERS, type Direction } from "@/shared/config/directions";
import { cn } from "@/shared/lib/cn";

/** Афиша курсов с фильтром по направлению: все | vfx | cgi | ugc. */
export function CoursesGrid({ courses }: { courses: Course[] }) {
  const [filter, setFilter] = useState<Direction | "all">("all");
  const visible =
    filter === "all" ? courses : courses.filter((c) => c.direction === filter);

  return (
    <div>
      <div
        role="group"
        aria-label="Фильтр по направлению"
        className="flex flex-wrap items-center gap-2"
      >
        <span className="mr-2 font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
          Фильтр:
        </span>
        {DIRECTION_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            aria-pressed={filter === f.value}
            className={cn(
              "rounded-full border px-3.5 py-1.5 font-mono text-xs uppercase tracking-[0.12em] transition duration-150",
              filter === f.value
                ? "border-ink bg-ink text-white"
                : "border-ink/20 text-ink/70 hover:border-ink/50 hover:text-ink",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {visible.length > 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((course) => (
            <CourseCard key={course.slug} course={course} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-xl border border-dashed border-ink/20 p-12 text-center">
          <p className="font-mono text-sm uppercase tracking-[0.15em] text-muted">
            В этом направлении пока нет потоков
          </p>
          <p className="mt-2 text-sm text-muted">
            Загляните позже или напишите нам — расскажем о планах набора.
          </p>
        </div>
      )}
    </div>
  );
}
