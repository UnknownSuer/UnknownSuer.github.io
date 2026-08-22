"use client";

import type { ContentPack, Teacher } from "@/shared/content/types";
import {
  Area,
  Card,
  Grid,
  IconButton,
  MiniButton,
  MoveButtons,
  Section,
  Text,
  makeId,
  move,
} from "@/features/admin/ui";

type Update = (updater: (pack: ContentPack) => ContentPack) => void;

export function TeachersPanel({ pack, update }: { pack: ContentPack; update: Update }) {
  const setTeachers = (teachers: Teacher[]) => update((current) => ({ ...current, teachers }));

  const patch = (index: number, value: Partial<Teacher>) =>
    setTeachers(pack.teachers.map((item, i) => (i === index ? { ...item, ...value } : item)));

  const remove = (teacher: Teacher) => {
    const usedBy = pack.courses.filter((course) => course.teacherIds.includes(teacher.id));
    const message =
      usedBy.length > 0
        ? `«${teacher.name}» указан в курсах: ${usedBy.map((c) => c.title).join(", ")}. Удалить и отвязать?`
        : `Удалить «${teacher.name}»?`;
    if (!window.confirm(message)) return;

    update((current) => ({
      ...current,
      teachers: current.teachers.filter((item) => item.id !== teacher.id),
      courses: current.courses.map((course) => ({
        ...course,
        teacherIds: course.teacherIds.filter((id) => id !== teacher.id),
      })),
    }));
  };

  return (
    <Section
      title="Преподаватели"
      hint="Карточки выводятся на странице курса в блоке «Преподаватель». Привязка — во вкладке «Курсы»."
      action={
        <MiniButton
          tone="accent"
          onClick={() =>
            setTeachers([
              ...pack.teachers,
              {
                id: makeId("teacher"),
                name: "Новый преподаватель",
                role: "",
                bio: "",
                photo: "/media/posters/avatar-amir.svg",
                links: [],
              },
            ])
          }
        >
          + преподаватель
        </MiniButton>
      }
    >
      <div className="space-y-3">
        {pack.teachers.length === 0 && (
          <p className="text-sm text-muted">Преподавателей пока нет — добавьте первого.</p>
        )}

        {pack.teachers.map((teacher, index) => (
          <Card key={teacher.id}>
            <div className="flex flex-wrap items-center gap-1.5">
              <input
                value={teacher.name}
                onChange={(event) => patch(index, { name: event.target.value })}
                className="min-w-0 flex-1 rounded-md border border-ink/15 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-ink/50"
              />
              <MoveButtons
                index={index}
                total={pack.teachers.length}
                onMove={(from, to) => setTeachers(move(pack.teachers, from, to))}
              />
              <IconButton title="Удалить преподавателя" onClick={() => remove(teacher)}>
                ✕
              </IconButton>
            </div>

            <div className="mt-3 space-y-3">
              <Grid cols={2}>
                <Text
                  label="Роль / подпись"
                  value={teacher.role}
                  placeholder="Amigo Kiz — основатель Ангара · CGI / VFX"
                  onChange={(v) => patch(index, { role: v })}
                />
                <Text
                  label="Фото"
                  value={teacher.photo}
                  mono
                  hint="Путь внутри public, например /media/posters/avatar-amir.svg"
                  onChange={(v) => patch(index, { photo: v })}
                />
              </Grid>
              <Area
                label="Био"
                rows={3}
                value={teacher.bio}
                onChange={(v) => patch(index, { bio: v })}
              />

              <div>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                    Ссылки
                  </span>
                  <MiniButton
                    onClick={() => patch(index, { links: [...teacher.links, { label: "", url: "" }] })}
                  >
                    + ссылка
                  </MiniButton>
                </div>
                <div className="space-y-1.5">
                  {teacher.links.length === 0 && (
                    <p className="text-[11px] text-muted">Behance, Telegram, сайт.</p>
                  )}
                  {teacher.links.map((link, linkIndex) => (
                    <div key={linkIndex} className="flex items-center gap-1.5">
                      <input
                        value={link.label}
                        placeholder="Behance"
                        onChange={(event) =>
                          patch(index, {
                            links: teacher.links.map((item, i) =>
                              i === linkIndex ? { ...item, label: event.target.value } : item,
                            ),
                          })
                        }
                        className="w-1/3 min-w-0 rounded-md border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-ink/50"
                      />
                      <input
                        value={link.url}
                        placeholder="https://…"
                        onChange={(event) =>
                          patch(index, {
                            links: teacher.links.map((item, i) =>
                              i === linkIndex ? { ...item, url: event.target.value } : item,
                            ),
                          })
                        }
                        className="min-w-0 flex-1 rounded-md border border-ink/15 bg-white px-3 py-2 font-mono text-xs outline-none focus:border-ink/50"
                      />
                      <IconButton
                        title="Удалить ссылку"
                        onClick={() =>
                          patch(index, {
                            links: teacher.links.filter((_, i) => i !== linkIndex),
                          })
                        }
                      >
                        ✕
                      </IconButton>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}
