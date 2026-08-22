"use client";

import { useRef, useState } from "react";
import type { ContentPack } from "@/shared/content/types";
import { CONTENT_VERSION, describeContentErrors, safeParseContent } from "@/shared/content/schema";
import { getContent } from "@/shared/content";
import { Grid, MiniButton, Num, Section, Text, Toggle } from "@/features/admin/ui";

type Update = (updater: (pack: ContentPack) => ContentPack) => void;

export function SettingsPanel({
  pack,
  update,
  onReplace,
}: {
  pack: ContentPack;
  update: Update;
  onReplace: (pack: ContentPack) => void;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [importErrors, setImportErrors] = useState<string[]>([]);

  const patchSettings = (patch: Partial<ContentPack["settings"]>) =>
    update((current) => ({ ...current, settings: { ...current.settings, ...patch } }));

  const download = () => {
    const payload: ContentPack = {
      ...pack,
      version: CONTENT_VERSION,
      updatedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2) + "\n"], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "content.json";
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const importFile = async (file: File) => {
    setImportErrors([]);
    try {
      const json = JSON.parse(await file.text()) as unknown;
      const parsed = safeParseContent(json);
      if (!parsed) {
        setImportErrors(describeContentErrors(json).slice(0, 12));
        return;
      }
      onReplace(parsed);
    } catch {
      setImportErrors(["Файл не является корректным JSON."]);
    }
  };

  return (
    <div className="space-y-4">
      <Section title="Кабинет" hint="Настройки личного кабинета ученика.">
        <div className="space-y-3">
          <Grid cols={2}>
            <Text
              label="Заголовок кабинета"
              value={pack.settings.cabinetTitle}
              onChange={(v) => patchSettings({ cabinetTitle: v })}
            />
            <Num
              label="Срок сессии ученика, дней"
              value={pack.settings.studentSessionDays}
              min={1}
              onChange={(v) => patchSettings({ studentSessionDays: v })}
            />
          </Grid>
          <Toggle
            label="Показывать кнопку «Посмотреть демо-кабинет» (вход без кода)"
            checked={pack.settings.cabinetDemoLogin}
            onChange={(v) => patchSettings({ cabinetDemoLogin: v })}
          />
          {pack.settings.cabinetDemoLogin && (
            <p className="rounded-md border border-ember/30 bg-ember/5 p-3 text-xs leading-relaxed text-ink/75">
              Демо-вход открыт всем. Перед продажей курса выключите его, иначе
              кабинет доступен без кода.
            </p>
          )}
        </div>
      </Section>

      <Section
        title="Публикация"
        hint="Админка не пишет на сервер — она отдаёт готовый content.json. Как его выкатить, описано в ADMIN.md."
      >
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <MiniButton tone="accent" onClick={download}>
              скачать content.json
            </MiniButton>
            <MiniButton onClick={() => fileRef.current?.click()}>загрузить content.json</MiniButton>
            <MiniButton
              tone="danger"
              onClick={() => {
                if (!window.confirm("Сбросить все правки до контента текущей сборки?")) return;
                onReplace(structuredClone(getContent()));
              }}
            >
              сбросить правки
            </MiniButton>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void importFile(file);
              event.target.value = "";
            }}
          />

          {importErrors.length > 0 && (
            <div className="rounded-md border border-danger/40 bg-danger/5 p-3">
              <p className="text-xs font-semibold text-danger">Файл не принят:</p>
              <ul className="mt-1.5 space-y-1 font-mono text-[11px] leading-snug text-danger/90">
                {importErrors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <ol className="space-y-2 text-xs leading-relaxed text-ink/70">
            <li>
              <b>1.</b> Скачайте <code className="font-mono">content.json</code>.
            </li>
            <li>
              <b>2. Насовсем:</b> положите файл в репозиторий по пути{" "}
              <code className="font-mono">src/content/content.json</code> и закоммитьте в
              ветку <code className="font-mono">main</code> — GitHub Pages пересоберёт сайт
              сам. Так правки попадают и в поиск, и в статические страницы.
            </li>
            <li>
              <b>3. Быстро, без пересборки:</b> положите тот же файл в{" "}
              <code className="font-mono">public/content/content.json</code>. Кабинет
              подхватывает его на лету — удобно, когда нужно поменять только видео уроков.
            </li>
          </ol>
        </div>
      </Section>

      <Section title="Служебное">
        <dl className="grid gap-2 font-mono text-[11px] text-muted sm:grid-cols-2">
          <div>
            <dt className="uppercase tracking-[0.16em]">версия схемы</dt>
            <dd className="text-ink">{pack.version}</dd>
          </div>
          <div>
            <dt className="uppercase tracking-[0.16em]">обновлён</dt>
            <dd className="text-ink">{pack.updatedAt}</dd>
          </div>
          <div>
            <dt className="uppercase tracking-[0.16em]">курсов / работ</dt>
            <dd className="text-ink">
              {pack.courses.length} / {pack.projects.length}
            </dd>
          </div>
          <div>
            <dt className="uppercase tracking-[0.16em]">уроков с видео</dt>
            <dd className="text-ink">
              {pack.courses.reduce(
                (total, course) =>
                  total +
                  course.program.reduce(
                    (sum, module) =>
                      sum +
                      module.lessons.filter(
                        (lesson) =>
                          lesson.video && lesson.video.provider !== "none" && lesson.video.ref,
                      ).length,
                    0,
                  ),
                0,
              )}
            </dd>
          </div>
        </dl>
      </Section>
    </div>
  );
}
