"use client";

import * as Accordion from "@radix-ui/react-accordion";
import type { CourseModule } from "@/entities/course/types";

/** Программа курса аккордеоном (Radix — доступность из коробки). */
export function ProgramAccordion({ program }: { program: CourseModule[] }) {
  return (
    <Accordion.Root
      type="multiple"
      defaultValue={["module-0"]}
      className="divide-y divide-ink/10 overflow-hidden rounded-xl border border-ink/10 bg-white"
    >
      {program.map((module, i) => (
        <Accordion.Item key={module.id} value={`module-${i}`}>
          <Accordion.Header asChild>
            <h3>
              <Accordion.Trigger className="flex w-full items-center gap-4 px-5 py-4 text-left transition duration-150 hover:bg-warm [&[data-state=open]>svg]:rotate-180">
                <span className="font-mono text-xs text-muted">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 text-[15px] font-semibold text-ink">
                  {module.title}
                </span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                  className="shrink-0 text-muted transition-transform duration-150"
                >
                  <path
                    d="m3 6 5 5 5-5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Accordion.Trigger>
            </h3>
          </Accordion.Header>
          <Accordion.Content className="px-5 pb-5">
            {module.summary && (
              <p className="mb-3 pl-9 text-sm leading-relaxed text-muted">{module.summary}</p>
            )}
            <ul className="grid gap-2 pl-9 text-sm leading-relaxed text-ink/75">
              {module.lessons.map((lesson) => (
                <li key={lesson.id} className="flex gap-2.5">
                  <span aria-hidden="true" className="mt-px text-ember">
                    ▪
                  </span>
                  <span className="min-w-0">
                    {lesson.title}
                    {lesson.free && (
                      <span className="ml-2 rounded-full border border-ember/40 px-1.5 py-px font-mono text-[10px] uppercase tracking-wider text-ember-deep">
                        превью
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
