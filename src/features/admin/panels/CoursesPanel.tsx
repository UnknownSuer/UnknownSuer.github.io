"use client";

import { useState } from "react";
import type {
  ContentPack,
  Course,
  CourseModule,
  Lesson,
  VideoProvider,
} from "@/shared/content/types";
import {
  Area,
  Card,
  Grid,
  IconButton,
  MiniButton,
  MoveButtons,
  Num,
  Section,
  Select,
  StringList,
  Text,
  Toggle,
  makeId,
  move,
} from "@/features/admin/ui";
import { cn } from "@/shared/lib/cn";

type Update = (updater: (pack: ContentPack) => ContentPack) => void;

const DIRECTIONS = [
  { value: "vfx" as const, label: "VFX" },
  { value: "cgi" as const, label: "CGI / 3D" },
  { value: "ugc" as const, label: "UGC" },
];

const ACCENTS = [
  { value: "wood" as const, label: "Дерево" },
  { value: "ember" as const, label: "Ember" },
  { value: "ink" as const, label: "Графит" },
  { value: "pine" as const, label: "Хвоя" },
];

const PROVIDERS: Array<{ value: VideoProvider; label: string }> = [
  { value: "none", label: "— не подключено —" },
  { value: "kinescope", label: "Kinescope (рекомендуется)" },
  { value: "vk", label: "VK Видео" },
  { value: "rutube", label: "Rutube" },
  { value: "youtube", label: "YouTube (без cookie)" },
  { value: "file", label: "Файл на сайте" },
];

const PROVIDER_HINT: Record<VideoProvider, string> = {
  none: "Урок покажет заглушку.",
  kinescope: "ID ролика из ссылки kinescope.io/… либо полная ссылка на embed.",
  vk: "Формат video-12345_67890 либо полная ссылка на плеер.",
  rutube: "ID ролика либо полная ссылка rutube.ru/play/embed/…",
  youtube: "ID ролика (11 символов) либо полная ссылка на embed.",
  file: "Путь вида /media/lessons/lesson-01.mp4 либо внешняя ссылка https://…",
};

function emptyCourse(order: number): Course {
  const id = makeId("course");
  return {
    slug: id,
    stream: String(order).padStart(2, "0"),
    title: "Новый курс",
    short: "",
    direction: "vfx",
    accent: "wood",
    startDate: new Date().toISOString().slice(0, 10),
    weeks: 6,
    price: 0,
    format: "онлайн",
    seats: 20,
    poster: "/media/posters/p01.svg",
    program: [],
    audience: [],
    outcomes: [],
    tariffs: [],
    teacherIds: [],
    published: false,
    order,
  };
}

export function CoursesPanel({ pack, update }: { pack: ContentPack; update: Update }) {
  const [activeSlug, setActiveSlug] = useState(pack.courses[0]?.slug ?? "");
  const course = pack.courses.find((item) => item.slug === activeSlug) ?? pack.courses[0];

  const patchCourse = (patch: Partial<Course>) => {
    if (!course) return;
    update((current) => ({
      ...current,
      courses: current.courses.map((item) =>
        item.slug === course.slug ? { ...item, ...patch } : item,
      ),
    }));
    // Правка slug меняет и выбранный курс.
    if (patch.slug) setActiveSlug(patch.slug);
  };

  const addCourse = () => {
    const created = emptyCourse(pack.courses.length + 1);
    update((current) => ({ ...current, courses: [...current.courses, created] }));
    setActiveSlug(created.slug);
  };

  const removeCourse = (slug: string) => {
    if (!window.confirm("Удалить курс вместе с программой и тарифами?")) return;
    update((current) => ({
      ...current,
      courses: current.courses.filter((item) => item.slug !== slug),
    }));
    setActiveSlug((current) =>
      current === slug ? (pack.courses.find((c) => c.slug !== slug)?.slug ?? "") : current,
    );
  };

  return (
    <div className="space-y-4">
      <Section
        title="Курсы"
        hint="Слева — список потоков. Выберите курс, чтобы править его карточку, программу и тарифы."
        action={<MiniButton tone="accent" onClick={addCourse}>+ курс</MiniButton>}
      >
        <div className="flex flex-wrap gap-2">
          {pack.courses.map((item, index) => (
            <div key={item.slug} className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveSlug(item.slug)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs transition",
                  item.slug === course?.slug
                    ? "border-ink bg-ink text-white"
                    : "border-ink/20 text-ink/70 hover:border-ink/50 hover:text-ink",
                )}
              >
                {item.title}
                {item.published === false && " · черновик"}
              </button>
              <MoveButtons
                index={index}
                total={pack.courses.length}
                onMove={(from, to) =>
                  update((current) => ({
                    ...current,
                    courses: move(current.courses, from, to).map((c, i) => ({
                      ...c,
                      order: i + 1,
                    })),
                  }))
                }
              />
            </div>
          ))}
          {pack.courses.length === 0 && (
            <p className="text-sm text-muted">Курсов пока нет — добавьте первый.</p>
          )}
        </div>
      </Section>

      {course && (
        <>
          <Section
            title={`Карточка курса · ${course.title}`}
            hint="Эти поля видны в афише, на странице курса и в метаданных."
            action={
              <MiniButton tone="danger" onClick={() => removeCourse(course.slug)}>
                удалить курс
              </MiniButton>
            }
          >
            <div className="space-y-3">
              <Grid cols={2}>
                <Text label="Название" value={course.title} onChange={(v) => patchCourse({ title: v })} />
                <Text
                  label="Адрес страницы (slug)"
                  value={course.slug}
                  mono
                  hint="Латиница и дефисы: /courses/<slug>. Меняя, обновите внешние ссылки."
                  onChange={(v) =>
                    patchCourse({ slug: v.toLowerCase().replace(/[^a-z0-9-]/g, "-") })
                  }
                />
              </Grid>
              <Area
                label="Короткое описание"
                value={course.short}
                onChange={(v) => patchCourse({ short: v })}
              />
              <Grid cols={4}>
                <Text label="Поток" value={course.stream} onChange={(v) => patchCourse({ stream: v })} />
                <Select
                  label="Направление"
                  value={course.direction}
                  options={DIRECTIONS}
                  onChange={(v) => patchCourse({ direction: v })}
                />
                <Select
                  label="Акцент карточки"
                  value={course.accent}
                  options={ACCENTS}
                  onChange={(v) => patchCourse({ accent: v })}
                />
                <Text
                  label="Формат"
                  value={course.format}
                  onChange={(v) => patchCourse({ format: v })}
                />
              </Grid>
              <Grid cols={4}>
                <Text
                  label="Старт (ГГГГ-ММ-ДД)"
                  value={course.startDate}
                  mono
                  onChange={(v) => patchCourse({ startDate: v })}
                />
                <Num label="Недель" value={course.weeks} min={1} onChange={(v) => patchCourse({ weeks: v })} />
                <Num
                  label="Цена «от», ₽"
                  value={course.price}
                  step={100}
                  onChange={(v) => patchCourse({ price: v })}
                />
                <Num label="Мест" value={course.seats} onChange={(v) => patchCourse({ seats: v })} />
              </Grid>
              <Grid cols={2}>
                <Text
                  label="Постер"
                  value={course.poster}
                  mono
                  hint="Путь внутри public, например /media/posters/p07.svg"
                  onChange={(v) => patchCourse({ poster: v })}
                />
                <div>
                  <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                    Преподаватели
                  </span>
                  <div className="rounded-md border border-ink/15 bg-white p-2">
                    {pack.teachers.length === 0 && (
                      <p className="text-[11px] text-muted">
                        Добавьте преподавателей во вкладке «Преподаватели».
                      </p>
                    )}
                    {pack.teachers.map((teacher) => (
                      <Toggle
                        key={teacher.id}
                        label={teacher.name}
                        checked={course.teacherIds.includes(teacher.id)}
                        onChange={(checked) =>
                          patchCourse({
                            teacherIds: checked
                              ? [...course.teacherIds, teacher.id]
                              : course.teacherIds.filter((id) => id !== teacher.id),
                          })
                        }
                      />
                    ))}
                  </div>
                </div>
              </Grid>
              <Toggle
                label="Курс опубликован (виден в афише и кабинете)"
                checked={course.published !== false}
                onChange={(v) => patchCourse({ published: v })}
              />
              <Grid cols={2}>
                <StringList
                  label="Кому подходит"
                  items={course.audience}
                  placeholder="Например: монтажёрам, которые хотят выйти в VFX"
                  onChange={(items) => patchCourse({ audience: items })}
                />
                <StringList
                  label="Что будет на выходе"
                  items={course.outcomes}
                  placeholder="Например: собранный шот в портфолио"
                  onChange={(items) => patchCourse({ outcomes: items })}
                />
              </Grid>
            </div>
          </Section>

          <ProgramEditor course={course} patchCourse={patchCourse} />
          <TariffsEditor course={course} patchCourse={patchCourse} />
        </>
      )}
    </div>
  );
}

/* ── Программа: модули (этапы) и уроки с видео ───────────────────── */

function ProgramEditor({
  course,
  patchCourse,
}: {
  course: Course;
  patchCourse: (patch: Partial<Course>) => void;
}) {
  const setProgram = (program: CourseModule[]) => patchCourse({ program });

  const patchModule = (moduleIndex: number, patch: Partial<CourseModule>) =>
    setProgram(
      course.program.map((module, i) => (i === moduleIndex ? { ...module, ...patch } : module)),
    );

  const patchLesson = (moduleIndex: number, lessonIndex: number, patch: Partial<Lesson>) =>
    patchModule(moduleIndex, {
      lessons: course.program[moduleIndex].lessons.map((lesson, i) =>
        i === lessonIndex ? { ...lesson, ...patch } : lesson,
      ),
    });

  return (
    <Section
      title="Программа и этапы"
      hint="Модуль = этап курса, урок = видео в кабинете. Порядок здесь — порядок в кабинете."
      action={
        <MiniButton
          tone="accent"
          onClick={() =>
            setProgram([
              ...course.program,
              { id: makeId("m"), title: `Модуль ${course.program.length + 1}`, lessons: [] },
            ])
          }
        >
          + модуль
        </MiniButton>
      }
    >
      <div className="space-y-3">
        {course.program.length === 0 && (
          <p className="text-sm text-muted">Программа пуста — добавьте первый модуль.</p>
        )}

        {course.program.map((module, moduleIndex) => (
          <Card key={module.id}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] text-muted">
                {String(moduleIndex + 1).padStart(2, "0")}
              </span>
              <input
                value={module.title}
                onChange={(event) => patchModule(moduleIndex, { title: event.target.value })}
                className="min-w-0 flex-1 rounded-md border border-ink/15 bg-white px-3 py-2 text-sm font-semibold text-ink outline-none focus:border-ink/50"
              />
              <MoveButtons
                index={moduleIndex}
                total={course.program.length}
                onMove={(from, to) => setProgram(move(course.program, from, to))}
              />
              <IconButton
                title="Удалить модуль"
                onClick={() => {
                  if (!window.confirm(`Удалить модуль «${module.title}» со всеми уроками?`)) return;
                  setProgram(course.program.filter((_, i) => i !== moduleIndex));
                }}
              >
                ✕
              </IconButton>
            </div>

            <div className="mt-2">
              <Area
                label="Описание этапа (необязательно)"
                rows={2}
                value={module.summary ?? ""}
                onChange={(v) => patchModule(moduleIndex, { summary: v || undefined })}
              />
            </div>

            <div className="mt-3 space-y-2">
              {module.lessons.map((lesson, lessonIndex) => (
                <LessonEditor
                  key={lesson.id}
                  lesson={lesson}
                  index={lessonIndex}
                  total={module.lessons.length}
                  onPatch={(patch) => patchLesson(moduleIndex, lessonIndex, patch)}
                  onMove={(from, to) =>
                    patchModule(moduleIndex, { lessons: move(module.lessons, from, to) })
                  }
                  onRemove={() =>
                    patchModule(moduleIndex, {
                      lessons: module.lessons.filter((_, i) => i !== lessonIndex),
                    })
                  }
                />
              ))}

              <MiniButton
                onClick={() =>
                  patchModule(moduleIndex, {
                    lessons: [
                      ...module.lessons,
                      {
                        id: makeId("l"),
                        title: `Урок ${module.lessons.length + 1}`,
                        video: { provider: "none", ref: "" },
                      },
                    ],
                  })
                }
              >
                + урок
              </MiniButton>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}

function LessonEditor({
  lesson,
  index,
  total,
  onPatch,
  onMove,
  onRemove,
}: {
  lesson: Lesson;
  index: number;
  total: number;
  onPatch: (patch: Partial<Lesson>) => void;
  onMove: (from: number, to: number) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  const video = lesson.video ?? { provider: "none" as VideoProvider, ref: "" };
  const connected = video.provider !== "none" && video.ref.trim().length > 0;

  return (
    <div className="rounded-md border border-ink/10 bg-white">
      <div className="flex flex-wrap items-center gap-1.5 p-2">
        <span className="font-mono text-[10px] text-muted">{index + 1}</span>
        <input
          value={lesson.title}
          onChange={(event) => onPatch({ title: event.target.value })}
          className="min-w-0 flex-1 rounded border border-transparent px-2 py-1.5 text-sm text-ink outline-none hover:border-ink/15 focus:border-ink/40"
        />
        <span
          title={connected ? "Видео привязано" : "Видео не привязано"}
          className={cn(
            "rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider",
            connected ? "bg-ember/10 text-ember-deep" : "bg-ink/5 text-muted",
          )}
        >
          {connected ? "видео" : "нет видео"}
        </span>
        <IconButton title={open ? "Свернуть" : "Настроить видео"} onClick={() => setOpen((v) => !v)}>
          {open ? "−" : "⚙"}
        </IconButton>
        <MoveButtons index={index} total={total} onMove={onMove} />
        <IconButton title="Удалить урок" onClick={onRemove}>
          ✕
        </IconButton>
      </div>

      {open && (
        <div className="space-y-3 border-t border-ink/10 p-3">
          <Area
            label="Описание урока (под плеером)"
            rows={2}
            value={lesson.summary ?? ""}
            onChange={(v) => onPatch({ summary: v || undefined })}
          />
          <Grid cols={2}>
            <Select
              label="Источник видео"
              value={video.provider}
              options={PROVIDERS}
              onChange={(provider) => onPatch({ video: { ...video, provider } })}
            />
            <Text
              label="ID ролика или ссылка"
              value={video.ref}
              mono
              hint={PROVIDER_HINT[video.provider]}
              onChange={(ref) => onPatch({ video: { ...video, ref } })}
            />
          </Grid>
          <Grid cols={2}>
            <Text
              label="Постер (необязательно)"
              value={video.poster ?? ""}
              mono
              onChange={(poster) => onPatch({ video: { ...video, poster: poster || undefined } })}
            />
            <Text
              label="Длительность, напр. 12:40"
              value={video.duration ?? ""}
              mono
              onChange={(duration) =>
                onPatch({ video: { ...video, duration: duration || undefined } })
              }
            />
          </Grid>
          <Toggle
            label="Открытый урок — доступен без покупки"
            checked={Boolean(lesson.free)}
            onChange={(free) => onPatch({ free: free || undefined })}
          />
          <MaterialsEditor lesson={lesson} onPatch={onPatch} />
        </div>
      )}
    </div>
  );
}

function MaterialsEditor({
  lesson,
  onPatch,
}: {
  lesson: Lesson;
  onPatch: (patch: Partial<Lesson>) => void;
}) {
  const materials = lesson.materials ?? [];
  const set = (index: number, patch: Partial<{ label: string; url: string }>) =>
    onPatch({
      materials: materials.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    });

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
          Материалы урока
        </span>
        <MiniButton onClick={() => onPatch({ materials: [...materials, { label: "", url: "" }] })}>
          + файл
        </MiniButton>
      </div>
      <div className="space-y-1.5">
        {materials.length === 0 && (
          <p className="text-[11px] text-muted">Ссылки на исходники, пресеты, PDF.</p>
        )}
        {materials.map((material, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <input
              value={material.label}
              placeholder="Название"
              onChange={(event) => set(index, { label: event.target.value })}
              className="w-1/3 min-w-0 rounded-md border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-ink/50"
            />
            <input
              value={material.url}
              placeholder="https://…"
              onChange={(event) => set(index, { url: event.target.value })}
              className="min-w-0 flex-1 rounded-md border border-ink/15 bg-white px-3 py-2 font-mono text-xs outline-none focus:border-ink/50"
            />
            <IconButton
              title="Удалить материал"
              onClick={() => onPatch({ materials: materials.filter((_, i) => i !== index) })}
            >
              ✕
            </IconButton>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Тарифы ──────────────────────────────────────────────────────── */

function TariffsEditor({
  course,
  patchCourse,
}: {
  course: Course;
  patchCourse: (patch: Partial<Course>) => void;
}) {
  const tariffs = course.tariffs;

  return (
    <Section
      title="Тарифы"
      hint="Минимальная цена тарифа обычно совпадает с ценой «от» в карточке курса."
      action={
        <MiniButton
          tone="accent"
          onClick={() =>
            patchCourse({
              tariffs: [
                ...tariffs,
                { id: makeId("t"), name: "Новый тариф", price: 0, features: [] },
              ],
            })
          }
        >
          + тариф
        </MiniButton>
      }
    >
      <Grid cols={3}>
        {tariffs.map((tariff, index) => (
          <Card key={tariff.id}>
            <div className="flex items-center gap-1.5">
              <input
                value={tariff.name}
                onChange={(event) =>
                  patchCourse({
                    tariffs: tariffs.map((t, i) =>
                      i === index ? { ...t, name: event.target.value } : t,
                    ),
                  })
                }
                className="min-w-0 flex-1 rounded-md border border-ink/15 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-ink/50"
              />
              <MoveButtons
                index={index}
                total={tariffs.length}
                onMove={(from, to) => patchCourse({ tariffs: move(tariffs, from, to) })}
              />
              <IconButton
                title="Удалить тариф"
                onClick={() => patchCourse({ tariffs: tariffs.filter((_, i) => i !== index) })}
              >
                ✕
              </IconButton>
            </div>
            <div className="mt-2 space-y-2">
              <Num
                label="Цена, ₽"
                value={tariff.price}
                step={100}
                onChange={(price) =>
                  patchCourse({
                    tariffs: tariffs.map((t, i) => (i === index ? { ...t, price } : t)),
                  })
                }
              />
              <Toggle
                label="Отметить «хит»"
                checked={Boolean(tariff.popular)}
                onChange={(popular) =>
                  patchCourse({
                    tariffs: tariffs.map((t, i) =>
                      i === index ? { ...t, popular: popular || undefined } : t,
                    ),
                  })
                }
              />
              <StringList
                label="Что входит"
                items={tariff.features}
                onChange={(features) =>
                  patchCourse({
                    tariffs: tariffs.map((t, i) => (i === index ? { ...t, features } : t)),
                  })
                }
              />
            </div>
          </Card>
        ))}
      </Grid>
      {tariffs.length === 0 && <p className="text-sm text-muted">Тарифов пока нет.</p>}
    </Section>
  );
}
