"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import type { CourseTariff } from "@/entities/course/types";
import { courseLeadSchema } from "@/shared/api/lead-schema";
import { buildLeadFallbackText, useSubmitLeadMutation } from "@/shared/api/lead-api";
import { Button, ButtonLink } from "@/shared/ui/Button";
import { TextField } from "@/shared/ui/Field";
import { formatPrice } from "@/shared/lib/format";
import { SITE } from "@/shared/config/site";
import { cn } from "@/shared/lib/cn";

const formSchema = courseLeadSchema.omit({ type: true, courseSlug: true });
type FormValues = z.infer<typeof formSchema>;

type BuyCourseProps = {
  course: { slug: string; stream: string; title: string };
  tariffs: CourseTariff[];
  defaultTariffId?: string;
  label?: string;
  variant?: "primary" | "outline" | "dark" | "light";
  size?: "sm" | "md" | "lg";
  className?: string;
};

/**
 * Кнопка «Купить» + диалог заявки на курс.
 *
 * После отправки показывается шаг с доступом в личный кабинет: ученику важно
 * сразу понимать, где будут уроки и как туда попасть. При подключении ЮKassa
 * этот же шаг заменяется редиректом на оплату, а кабинетный блок остаётся
 * на странице «спасибо».
 */
export function BuyCourse({
  course,
  tariffs,
  defaultTariffId,
  label = "Купить курс",
  variant = "primary",
  size = "md",
  className,
}: BuyCourseProps) {
  const [open, setOpen] = useState(false);
  const [submitLead, { isLoading, isSuccess, isError, reset: resetMutation }] =
    useSubmitLeadMutation();
  const [fallbackText, setFallbackText] = useState("");

  const {
    register,
    handleSubmit,
    reset: resetForm,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tariffId:
        defaultTariffId ?? tariffs.find((t) => t.popular)?.id ?? tariffs[0]?.id ?? "",
      name: "",
      email: "",
      phone: "",
      consent: false,
    },
  });

  const onOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) {
      resetMutation();
      resetForm();
      setFallbackText("");
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      await submitLead({ type: "course", courseSlug: course.slug, ...values }).unwrap();
    } catch {
      // Приём заявок не настроен или недоступен — даём человеку запасной путь,
      // а не «упс, попробуйте позже».
      const current = getValues();
      setFallbackText(
        buildLeadFallbackText(
          { type: "course", courseSlug: course.slug, ...current },
          {
            courseTitle: course.title,
            tariffName:
              tariffs.find((t) => t.id === current.tariffId)?.name ?? current.tariffId,
          },
        ),
      );
    }
  });

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>
        <Button variant={variant} size={size} className={className}>
          {label}
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-ink/45 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[80] max-h-[92dvh] w-[calc(100vw-1.5rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white p-5 shadow-lift focus:outline-none sm:w-[calc(100vw-2rem)] sm:p-6">
          {isSuccess ? (
            <CabinetAccessStep course={course} onClose={() => onOpenChange(false)} />
          ) : (
            <>
              <Dialog.Title className="font-display text-lg font-semibold uppercase leading-tight text-ink sm:text-xl">
                Запись на курс
              </Dialog.Title>
              <Dialog.Description className="mt-2 text-sm text-muted">
                Поток {course.stream} — {course.title}
              </Dialog.Description>

              <form onSubmit={onSubmit} className="mt-5 space-y-4" noValidate>
                <fieldset>
                  <legend className="mb-2 block text-sm font-medium text-ink">Тариф</legend>
                  <div className="space-y-2">
                    {tariffs.map((tariff) => (
                      <label
                        key={tariff.id}
                        className={cn(
                          "flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-ink/15 px-3.5 py-3 transition duration-150 sm:px-4",
                          "hover:border-ink/40 has-[:checked]:border-ember has-[:checked]:ring-1 has-[:checked]:ring-ember",
                        )}
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <input
                            type="radio"
                            value={tariff.id}
                            className="accent-ember"
                            {...register("tariffId")}
                          />
                          <span className="min-w-0 text-sm font-medium text-ink">
                            {tariff.name}
                            {tariff.popular && (
                              <span className="ml-2 rounded-full bg-ember px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-white">
                                хит
                              </span>
                            )}
                          </span>
                        </span>
                        <span className="shrink-0 font-mono text-sm text-ink">
                          {formatPrice(tariff.price)}
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.tariffId && (
                    <p className="mt-1 text-xs text-danger">{errors.tariffId.message}</p>
                  )}
                </fieldset>

                <TextField
                  label="Имя"
                  placeholder="Как к вам обращаться"
                  autoComplete="name"
                  error={errors.name?.message}
                  {...register("name")}
                />
                <TextField
                  label="Email"
                  type="email"
                  inputMode="email"
                  placeholder="you@example.ru"
                  autoComplete="email"
                  error={errors.email?.message}
                  {...register("email")}
                />
                <TextField
                  label="Телефон"
                  type="tel"
                  inputMode="tel"
                  placeholder="+7 900 000-00-00"
                  autoComplete="tel"
                  error={errors.phone?.message}
                  {...register("phone")}
                />

                <label className="flex items-start gap-2.5 text-xs leading-relaxed text-muted">
                  <input type="checkbox" className="mt-0.5 accent-ember" {...register("consent")} />
                  <span>
                    Даю{" "}
                    <Link href="/legal/consent" target="_blank" className="underline underline-offset-2">
                      согласие на обработку персональных данных
                    </Link>{" "}
                    и принимаю{" "}
                    <Link href="/legal/offer" target="_blank" className="underline underline-offset-2">
                      публичную оферту
                    </Link>
                    .
                  </span>
                </label>
                {errors.consent && <p className="text-xs text-danger">{errors.consent.message}</p>}

                {isError && fallbackText && <SendFallback text={fallbackText} />}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Отправляем…" : "Отправить заявку"}
                </Button>
                <p className="text-center font-mono text-[10px] uppercase leading-relaxed tracking-[0.18em] text-muted">
                  Оплата — ЮKassa · чек самозанятого · возврат по оферте
                </p>
              </form>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/**
 * Шаг после отправки заявки: что дальше и как попасть в кабинет.
 * Это и есть «поп-ап после покупки» — он объясняет путь к урокам.
 */
function CabinetAccessStep({
  course,
  onClose,
}: {
  course: { title: string; stream: string };
  onClose: () => void;
}) {
  return (
    <div className="py-2 text-center">
      <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-ember/10 text-2xl text-ember">
        ✓
      </span>
      <Dialog.Title className="mt-5 font-display text-lg font-semibold uppercase text-ink sm:text-xl">
        Заявка принята
      </Dialog.Title>
      <Dialog.Description className="mt-3 text-sm leading-relaxed text-muted">
        Поток {course.stream} — {course.title}. Мы свяжемся с вами и пришлём ссылку
        на оплату (ЮKassa, чек — автоматически).
      </Dialog.Description>

      <div className="mt-6 rounded-xl border border-ink/10 bg-warm p-4 text-left">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ember-deep">
          Доступ к урокам
        </p>
        <h3 className="mt-2 font-display text-base font-semibold uppercase tracking-tight text-ink">
          Личный кабинет
        </h3>
        <ol className="mt-3 space-y-1.5 text-xs leading-relaxed text-ink/70">
          <li>
            <b>1.</b> После оплаты придёт персональный код доступа.
          </li>
          <li>
            <b>2.</b> Введите его на странице кабинета — там видеоуроки, программа и
            материалы потока.
          </li>
          <li>
            <b>3.</b> Код именной: он привязан к вашей покупке.
          </li>
        </ol>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <ButtonLink href="/cabinet" size="sm" className="w-full sm:w-auto">
            Войти в кабинет
          </ButtonLink>
          <ButtonLink
            href={SITE.telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
          >
            Написать куратору
          </ButtonLink>
        </div>
      </div>

      <Button variant="ghost" className="mt-5 w-full" onClick={onClose}>
        Закрыть
      </Button>
    </div>
  );
}

/** Приём заявок не ответил — предлагаем отправить то же самое руками. */
function SendFallback({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-danger/40 bg-danger/5 p-3">
      <p className="text-xs font-semibold text-danger">Заявка не ушла автоматически</p>
      <p className="mt-1.5 text-xs leading-relaxed text-ink/70">
        Отправьте её напрямую — мы ответим так же быстро.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <a
          href={`${SITE.telegramUrl}?text=${encodeURIComponent(text)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md border border-ink/20 px-3 py-1.5 text-xs font-medium text-ink transition hover:border-ink/50"
        >
          Telegram
        </a>
        <a
          href={`mailto:${SITE.email}?subject=${encodeURIComponent("Заявка на курс")}&body=${encodeURIComponent(text)}`}
          className="rounded-md border border-ink/20 px-3 py-1.5 text-xs font-medium text-ink transition hover:border-ink/50"
        >
          Email
        </a>
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard?.writeText(text);
          }}
          className="rounded-md border border-ink/20 px-3 py-1.5 text-xs font-medium text-ink transition hover:border-ink/50"
        >
          Скопировать
        </button>
      </div>
    </div>
  );
}
