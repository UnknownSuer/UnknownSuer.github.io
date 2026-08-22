"use client";

import { useState } from "react";
import type { ContentPack, StudentAccess } from "@/shared/content/types";
import { generateAccessCode } from "@/features/admin/admin-auth";
import { getAuthMode } from "@/features/student-cabinet/cabinet-auth";
import { sha256Hex } from "@/shared/lib/crypto";
import {
  Card,
  Grid,
  IconButton,
  MiniButton,
  Section,
  Text,
  Toggle,
  makeId,
} from "@/features/admin/ui";

type Update = (updater: (pack: ContentPack) => ContentPack) => void;

/**
 * Коды доступа учеников для статического режима.
 * В контенте лежит только SHA-256 кода — сам код показывается один раз,
 * сразу после генерации, и восстановить его нельзя.
 */
export function AccessPanel({ pack, update }: { pack: ContentPack; update: Update }) {
  const [issued, setIssued] = useState<{ id: string; code: string } | null>(null);
  const mode = getAuthMode();

  const patch = (id: string, value: Partial<StudentAccess>) =>
    update((current) => ({
      ...current,
      studentAccess: current.studentAccess.map((item) =>
        item.id === id ? { ...item, ...value } : item,
      ),
    }));

  const issue = async () => {
    const code = generateAccessCode();
    const record: StudentAccess = {
      id: makeId("access"),
      label: "Новый ученик",
      codeHash: await sha256Hex(code),
      courseSlugs: pack.courses.filter((c) => c.published !== false).map((c) => c.slug).slice(0, 1),
    };
    update((current) => ({ ...current, studentAccess: [...current.studentAccess, record] }));
    setIssued({ id: record.id, code });
  };

  const regenerate = async (id: string) => {
    const code = generateAccessCode();
    patch(id, { codeHash: await sha256Hex(code) });
    setIssued({ id, code });
  };

  return (
    <div className="space-y-4">
      {mode === "api" && (
        <Section title="Режим входа: телефон + SMS" hint="Задан NEXT_PUBLIC_STUDENT_API.">
          <p className="text-sm leading-relaxed text-ink/70">
            Кабинет работает через ваш бэкенд: ученик входит по телефону покупки и
            коду из SMS, доступы живут в базе. Коды ниже в этом режиме не
            используются — оставлены как запасной вход.
          </p>
        </Section>
      )}

      <Section
        title="Коды доступа учеников"
        hint="Код показывается один раз при выдаче. В контенте хранится только его хеш — восстановить нельзя, можно только перевыпустить."
        action={<MiniButton tone="accent" onClick={issue}>+ выдать код</MiniButton>}
      >
        {issued && (
          <div className="mb-4 rounded-lg border border-ember bg-ember/5 p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ember-deep">
              Новый код — скопируйте сейчас
            </p>
            <p className="mt-2 select-all break-all font-mono text-lg font-semibold text-ink">
              {issued.code}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <MiniButton
                onClick={() => {
                  void navigator.clipboard?.writeText(issued.code);
                }}
              >
                копировать
              </MiniButton>
              <MiniButton onClick={() => setIssued(null)}>скрыть</MiniButton>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-muted">
              Отправьте код ученику. Второй раз он не покажется — только перевыпуск.
            </p>
          </div>
        )}

        <div className="space-y-2">
          {pack.studentAccess.length === 0 && (
            <p className="text-sm text-muted">
              Кодов пока нет. Выдайте код после подтверждения оплаты курса.
            </p>
          )}

          {pack.studentAccess.map((record) => (
            <Card key={record.id}>
              <div className="flex flex-wrap items-center gap-1.5">
                <input
                  value={record.label}
                  placeholder="Имя ученика или телефон"
                  onChange={(event) => patch(record.id, { label: event.target.value })}
                  className="min-w-0 flex-1 rounded-md border border-ink/15 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-ink/50"
                />
                <MiniButton onClick={() => void regenerate(record.id)}>перевыпустить</MiniButton>
                <IconButton
                  title="Удалить доступ"
                  onClick={() => {
                    if (!window.confirm(`Удалить доступ «${record.label}»?`)) return;
                    update((current) => ({
                      ...current,
                      studentAccess: current.studentAccess.filter((item) => item.id !== record.id),
                    }));
                  }}
                >
                  ✕
                </IconButton>
              </div>

              <div className="mt-3 space-y-2">
                <Grid cols={2}>
                  <Text
                    label="Доступ до (ГГГГ-ММ-ДД, пусто — бессрочно)"
                    value={record.expiresAt?.slice(0, 10) ?? ""}
                    mono
                    onChange={(v) => patch(record.id, { expiresAt: v || undefined })}
                  />
                  <div>
                    <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                      Курсы
                    </span>
                    <div className="rounded-md border border-ink/15 bg-white p-2">
                      {pack.courses.map((course) => (
                        <Toggle
                          key={course.slug}
                          label={course.title}
                          checked={record.courseSlugs.includes(course.slug)}
                          onChange={(checked) =>
                            patch(record.id, {
                              courseSlugs: checked
                                ? [...record.courseSlugs, course.slug]
                                : record.courseSlugs.filter((slug) => slug !== course.slug),
                            })
                          }
                        />
                      ))}
                    </div>
                  </div>
                </Grid>
                <Toggle
                  label="Доступ отключён"
                  checked={Boolean(record.disabled)}
                  onChange={(disabled) => patch(record.id, { disabled: disabled || undefined })}
                />
                <p className="break-all font-mono text-[10px] text-muted">
                  hash: {record.codeHash.slice(0, 16)}…
                </p>
              </div>
            </Card>
          ))}
        </div>
      </Section>
    </div>
  );
}
