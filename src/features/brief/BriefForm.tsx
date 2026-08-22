"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  BRIEF_DIRECTION_OPTIONS,
  BUDGET_OPTIONS,
  briefLeadSchema,
} from "@/shared/api/lead-schema";
import { buildLeadFallbackText, useSubmitBriefLeadMutation } from "@/shared/api/lead-api";
import { Button } from "@/shared/ui/Button";
import { SelectField, TextAreaField, TextField } from "@/shared/ui/Field";
import { SITE } from "@/shared/config/site";

const formSchema = briefLeadSchema.omit({ type: true });
type FormValues = z.infer<typeof formSchema>;

const MAX_ATTACHMENTS_BYTES = 100 * 1024 * 1024;

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(bytes < 10 * 1024 * 1024 ? 1 : 0)} МБ`;
}

/** Бриф на VFX/CGI/UGC-проект (страница «Контакты», якорь #brief). */
export function BriefForm() {
  const [submitBriefLead, { isLoading, isSuccess, isError }] = useSubmitBriefLeadMutation();
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState("");
  const [fallbackText, setFallbackText] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      direction: "vfx",
      budget: "discuss",
      message: "",
      name: "",
      contact: "",
      consent: false,
    },
  });

  const addFiles = (incoming: File[]) => {
    const unique = incoming.filter(
      (candidate) =>
        !files.some(
          (existing) =>
            existing.name === candidate.name &&
            existing.size === candidate.size &&
            existing.lastModified === candidate.lastModified,
        ),
    );
    const next = [...files, ...unique];
    const totalBytes = next.reduce((sum, file) => sum + file.size, 0);

    if (totalBytes > MAX_ATTACHMENTS_BYTES) {
      setFileError("Суммарный размер вложений не должен превышать 100 МБ.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setFiles(next);
    setFileError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      await submitBriefLead({
        lead: { type: "brief", ...values },
        files,
      }).unwrap();
    } catch {
      // Приём брифов не настроен или недоступен — показываем запасной путь
      // вместо тупика «попробуйте ещё раз».
      setFallbackText(buildLeadFallbackText({ type: "brief", ...getValues() }));
    }
  });

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-ink/10 bg-white p-6 text-center sm:p-10">
        <span className="flex size-14 items-center justify-center rounded-full bg-ember/10 text-2xl text-ember">
          ✓
        </span>
        <p className="mt-5 font-display text-xl font-semibold uppercase text-ink">
          Бриф отправлен
        </p>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
          Ответим в течение рабочего дня: уточним детали и пришлём вилку по
          срокам и бюджету. Срочно? Пишите в Telegram {SITE.telegramHandle}.
        </p>
      </div>
    );
  }

  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="rounded-xl border border-ink/10 bg-white p-4 sm:p-6 md:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Что нужно сделать"
          error={errors.direction?.message}
          {...register("direction")}
        >
          {BRIEF_DIRECTION_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Бюджет"
          error={errors.budget?.message}
          {...register("budget")}
        >
          {BUDGET_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </SelectField>
      </div>

      <div className="mt-4">
        <TextAreaField
          label="О проекте"
          placeholder="Что за продукт/бренд, какой ролик нужен, референсы, дедлайн…"
          error={errors.message?.message}
          {...register("message")}
        />
      </div>

      <div className="mt-4">
        <span className="mb-1.5 block text-sm font-medium text-ink">Вложения</span>
        <label
          className="flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-ink/20 bg-warm/60 px-4 py-5 text-center transition hover:border-ink/45 hover:bg-warm"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            addFiles(Array.from(event.dataTransfer.files));
          }}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            className="sr-only"
            onChange={(event) => addFiles(Array.from(event.target.files ?? []))}
          />
          <span className="text-sm font-medium text-ink">Прикрепить файлы</span>
          <span className="mt-1 text-xs leading-relaxed text-muted">
            Нажмите или перетащите сюда · до 100 МБ суммарно
          </span>
        </label>

        {files.length > 0 && (
          <div className="mt-3 space-y-2">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${file.lastModified}-${index}`}
                className="flex items-center justify-between gap-3 rounded-md border border-ink/10 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-ink">{file.name}</p>
                  <p className="mt-0.5 font-mono text-[10px] text-muted">{formatFileSize(file.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index));
                    setFileError("");
                  }}
                  className="shrink-0 text-xs text-muted underline underline-offset-2 transition hover:text-ink"
                >
                  Удалить
                </button>
              </div>
            ))}
            <p className="text-right font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
              {formatFileSize(totalBytes)} / 100 МБ
            </p>
          </div>
        )}
        {fileError && <p className="mt-2 text-xs text-danger">{fileError}</p>}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <TextField
          label="Имя"
          placeholder="Как к вам обращаться"
          autoComplete="name"
          error={errors.name?.message}
          {...register("name")}
        />
        <TextField
          label="Как связаться"
          placeholder="Telegram, телефон или email"
          error={errors.contact?.message}
          {...register("contact")}
        />
      </div>

      <label className="mt-5 flex items-start gap-2.5 text-xs leading-relaxed text-muted">
        <input type="checkbox" className="mt-0.5 accent-ember" {...register("consent")} />
        <span>
          Даю{" "}
          <Link
            href="/legal/consent"
            target="_blank"
            className="underline underline-offset-2"
          >
            согласие на обработку персональных данных
          </Link>
          .
        </span>
      </label>
      {errors.consent && (
        <p className="mt-1 text-xs text-danger">{errors.consent.message}</p>
      )}

      {isError && fallbackText && (
        <div className="mt-3 rounded-lg border border-danger/40 bg-danger/5 p-3">
          <p className="text-xs font-semibold text-danger">Бриф не ушёл автоматически</p>
          <p className="mt-1.5 text-xs leading-relaxed text-ink/70">
            Отправьте текст напрямую — ответим так же быстро.
            {files.length > 0 && " Файлы приложите в переписке."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={`${SITE.telegramUrl}?text=${encodeURIComponent(fallbackText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-ink/20 px-3 py-1.5 text-xs font-medium text-ink transition hover:border-ink/50"
            >
              Telegram
            </a>
            <a
              href={`mailto:${SITE.email}?subject=${encodeURIComponent("Бриф на проект")}&body=${encodeURIComponent(fallbackText)}`}
              className="rounded-md border border-ink/20 px-3 py-1.5 text-xs font-medium text-ink transition hover:border-ink/50"
            >
              Email
            </a>
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard?.writeText(fallbackText);
              }}
              className="rounded-md border border-ink/20 px-3 py-1.5 text-xs font-medium text-ink transition hover:border-ink/50"
            >
              Скопировать
            </button>
          </div>
        </div>
      )}

      <Button type="submit" size="lg" className="mt-6 w-full sm:w-auto" disabled={isLoading}>
        {isLoading ? "Отправляем…" : "Отправить бриф"}
      </Button>
    </form>
  );
}
