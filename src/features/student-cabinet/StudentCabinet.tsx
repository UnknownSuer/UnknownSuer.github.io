"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { ContentPack, Course } from "@/shared/content/types";
import { flattenLessons, type FlatLesson } from "@/shared/content";
import { loadRuntimeContent } from "@/shared/content/runtime";
import { Button, ButtonLink } from "@/shared/ui/Button";
import { SecurePlayer } from "@/shared/ui/SecurePlayer";
import { hasVideo } from "@/shared/ui/video-source";
import { SITE } from "@/shared/config/site";
import { cn } from "@/shared/lib/cn";
import {
  clearSession,
  getAuthMode,
  readSession,
  signInAsDemo,
  signInWithAccessCode,
  requestPhoneCode,
  verifyPhoneCode,
  writeSession,
  type StudentSessionData,
} from "@/features/student-cabinet/cabinet-auth";

const PROGRESS_KEY = "angar:student:progress";

interface StudentCabinetProps {
  /** Контент, вшитый в сборку. В браузере поверх него встаёт оверлей. */
  initialPack: ContentPack;
}

export function StudentCabinet({ initialPack }: StudentCabinetProps) {
  const [pack, setPack] = useState<ContentPack>(initialPack);
  const [session, setSession] = useState<StudentSessionData | null>(null);
  const [ready, setReady] = useState(false);

  // Оверлей public/content/content.json — правки видео без пересборки сайта.
  useEffect(() => {
    const controller = new AbortController();
    loadRuntimeContent(controller.signal).then(({ pack: loaded }) => {
      if (!controller.signal.aborted) setPack(loaded);
    });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    setSession(readSession());
    setReady(true);
  }, []);

  const handleSignedIn = useCallback((next: StudentSessionData) => {
    writeSession(next);
    setSession(next);
  }, []);

  const handleSignOut = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-[60svh] items-center justify-center px-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted">
          Загружаем кабинет…
        </p>
      </div>
    );
  }

  if (!session) {
    return <SignIn pack={pack} onSignedIn={handleSignedIn} />;
  }

  return <CabinetWorkspace pack={pack} session={session} onSignOut={handleSignOut} />;
}

/* ─────────────────────────── Вход ─────────────────────────────── */

function SignIn({
  pack,
  onSignedIn,
}: {
  pack: ContentPack;
  onSignedIn: (session: StudentSessionData) => void;
}) {
  const mode = getAuthMode();
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [smsCode, setSmsCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submitAccessCode = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const result = await signInWithAccessCode(code, pack);
    setBusy(false);
    if (result.ok) onSignedIn(result.session);
    else setError(result.error);
  };

  const submitPhone = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const result = await requestPhoneCode(phone);
    setBusy(false);
    if (result.ok) setChallengeId(result.challengeId);
    else setError(result.error);
  };

  const submitSmsCode = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!challengeId) return;
    setBusy(true);
    setError(null);
    const result = await verifyPhoneCode(challengeId, smsCode, pack);
    setBusy(false);
    if (result.ok) onSignedIn(result.session);
    else setError(result.error);
  };

  return (
    <div className="mx-auto grid w-full max-w-[1400px] items-center gap-8 px-4 py-10 md:px-8 md:py-14 lg:min-h-[calc(100svh-4rem)] lg:grid-cols-[1.1fr_0.9fr]">
      <section>
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-ember-deep">
          Для участников курсов
        </p>
        <h1 className="mt-4 max-w-3xl font-display text-3xl font-bold uppercase leading-[1.05] tracking-tight text-ink sm:text-4xl md:text-6xl">
          {pack.settings.cabinetTitle}
        </h1>
        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink/70 md:text-base">
          Видеоуроки потока, программа курса и материалы. Доступ открывается
          после оплаты — код приходит вместе с подтверждением покупки.
        </p>
        <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
          {["Видео и программа", "Материалы уроков", "Связь с куратором"].map((item, index) => (
            <div key={item} className="rounded-xl border border-ink/10 bg-warm p-4">
              <span className="font-mono text-[10px] text-muted">0{index + 1}</span>
              <p className="mt-4 text-sm font-medium text-ink">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-ink/10 bg-white p-5 shadow-lift sm:p-6 md:p-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">Вход</p>
        <h2 className="mt-3 font-display text-lg font-semibold uppercase tracking-tight text-ink sm:text-xl">
          Доступ к курсу
        </h2>

        {mode === "api" ? (
          challengeId ? (
            <form onSubmit={submitSmsCode} className="mt-6 space-y-4">
              <p className="text-sm leading-relaxed text-muted">
                Отправили код на {phone}. Он действует 5 минут.
              </p>
              <LabelledInput
                label="Код из SMS"
                value={smsCode}
                onChange={setSmsCode}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000000"
              />
              {error && <p className="text-sm text-danger">{error}</p>}
              <Button type="submit" size="lg" className="w-full" disabled={busy}>
                {busy ? "Проверяем…" : "Войти"}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setChallengeId(null);
                  setSmsCode("");
                  setError(null);
                }}
                className="w-full text-center text-xs text-muted underline underline-offset-2"
              >
                Изменить номер
              </button>
            </form>
          ) : (
            <form onSubmit={submitPhone} className="mt-6 space-y-4">
              <p className="text-sm leading-relaxed text-muted">
                Введите телефон, указанный при покупке — пришлём код в SMS.
              </p>
              <LabelledInput
                label="Телефон"
                value={phone}
                onChange={setPhone}
                type="tel"
                autoComplete="tel"
                placeholder="+7 900 000-00-00"
              />
              {error && <p className="text-sm text-danger">{error}</p>}
              <Button type="submit" size="lg" className="w-full" disabled={busy}>
                {busy ? "Отправляем…" : "Получить код"}
              </Button>
            </form>
          )
        ) : (
          <form onSubmit={submitAccessCode} className="mt-6 space-y-4">
            <p className="text-sm leading-relaxed text-muted">
              Введите персональный код доступа из письма о покупке.
            </p>
            <LabelledInput
              label="Код доступа"
              value={code}
              onChange={setCode}
              autoComplete="one-time-code"
              placeholder="напр. angar-7f3k-9x2m"
            />
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy ? "Проверяем…" : "Войти в кабинет"}
            </Button>
          </form>
        )}

        {pack.settings.cabinetDemoLogin && (
          <div className="mt-5 border-t border-ink/10 pt-5">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => onSignedIn(signInAsDemo(pack))}
            >
              Посмотреть демо-кабинет
            </Button>
            <p className="mt-2 text-center text-[11px] leading-relaxed text-muted">
              Демо-режим показывает интерфейс без реальных видео.
            </p>
          </div>
        )}

        <p className="mt-5 text-xs leading-relaxed text-muted">
          Нет кода?{" "}
          <a
            href={SITE.telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            Напишите в Telegram
          </a>{" "}
          — восстановим доступ.
        </p>
      </section>
    </div>
  );
}

function LabelledInput({
  label,
  value,
  onChange,
  ...props
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <input
        {...props}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-md border border-ink/15 bg-white px-3.5 text-[15px] text-ink outline-none transition placeholder:text-muted/50 focus:border-ink/50"
      />
    </label>
  );
}

/* ─────────────────────── Рабочая область ──────────────────────── */

function CabinetWorkspace({
  pack,
  session,
  onSignOut,
}: {
  pack: ContentPack;
  session: StudentSessionData;
  onSignOut: () => void;
}) {
  const available = useMemo(() => {
    const published = pack.courses.filter((course) => course.published !== false);
    const mine = published.filter((course) => session.courseSlugs.includes(course.slug));
    return mine.length > 0 ? mine : published.filter((c) => hasFreeLesson(c));
  }, [pack.courses, session.courseSlugs]);

  const [courseSlug, setCourseSlug] = useState(() => available[0]?.slug ?? "");
  const course = available.find((item) => item.slug === courseSlug) ?? available[0];

  const lessons = useMemo(() => (course ? flattenLessons(course) : []), [course]);
  const [activeLessonId, setActiveLessonId] = useState("");
  const [completed, setCompleted] = useState<string[]>([]);
  const [progressLoaded, setProgressLoaded] = useState(false);

  // Активный урок держим в границах текущего курса.
  useEffect(() => {
    if (lessons.length === 0) {
      setActiveLessonId("");
      return;
    }
    setActiveLessonId((current) =>
      lessons.some((lesson) => lesson.id === current) ? current : lessons[0].id,
    );
  }, [lessons]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(PROGRESS_KEY);
      const parsed = saved ? (JSON.parse(saved) as unknown) : null;
      if (Array.isArray(parsed)) setCompleted(parsed.filter((x): x is string => typeof x === "string"));
    } catch {
      // Повреждённый прогресс просто игнорируем.
    } finally {
      setProgressLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!progressLoaded) return;
    try {
      window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(completed));
    } catch {
      // Приватный режим — прогресс не сохранится, интерфейс не ломаем.
    }
  }, [completed, progressLoaded]);

  const activeLesson = lessons.find((lesson) => lesson.id === activeLessonId) ?? lessons[0];
  const activeIndex = Math.max(0, lessons.findIndex((lesson) => lesson.id === activeLesson?.id));

  const toggleCompleted = (lessonId: string) => {
    setCompleted((current) =>
      current.includes(lessonId)
        ? current.filter((id) => id !== lessonId)
        : [...current, lessonId],
    );
  };

  if (!course) {
    return (
      <div className="mx-auto w-full max-w-xl px-4 py-16 text-center md:py-24">
        <h1 className="font-display text-2xl font-bold uppercase tracking-tight text-ink">
          Курсы пока не открыты
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          К вашему коду доступа ещё не привязан ни один поток. Напишите куратору —
          подключим.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <ButtonLink href={SITE.telegramUrl} target="_blank" rel="noopener noreferrer" size="sm">
            Написать в Telegram
          </ButtonLink>
          <Button variant="outline" size="sm" onClick={onSignOut}>
            Выйти
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-8 md:py-8">
      {/*
        Над плеером намеренно нет ни статистики, ни шапки: по макету остаются
        только программа курса, плеер и всё, что ниже него. Управление
        сессией живёт в подвале колонки с программой.
      */}
      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        {/* Плеер идёт первым в потоке — на телефоне он открывается сразу,
            на десктопе grid-порядок возвращает программу влево. */}
        <main className="min-w-0 xl:order-2">
          <section className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
            <SecurePlayer
              video={activeLesson?.video}
              title={activeLesson?.title}
              watermark={session.label}
            />
            <div className="flex flex-col gap-4 p-4 sm:p-5 md:flex-row md:items-center md:justify-between md:p-6">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                  Урок {activeIndex + 1} / {lessons.length} · Модуль{" "}
                  {(activeLesson?.moduleIndex ?? 0) + 1}
                  {activeLesson?.video?.duration ? ` · ${activeLesson.video.duration}` : ""}
                </p>
                {/* Заголовок урока — в 1,5 раза крупнее прежнего (18px → 27px). */}
                <h1 className="mt-2 text-[1.6875rem] font-semibold leading-tight text-ink md:text-[2.0625rem]">
                  {activeLesson?.title}
                </h1>
                {activeLesson?.summary && (
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink/65">
                    {activeLesson.summary}
                  </p>
                )}
              </div>
              {activeLesson && (
                <Button
                  variant={completed.includes(activeLesson.id) ? "outline" : "primary"}
                  className="shrink-0"
                  onClick={() => toggleCompleted(activeLesson.id)}
                >
                  {completed.includes(activeLesson.id) ? "✓ Урок пройден" : "Отметить пройденным"}
                </Button>
              )}
            </div>
          </section>

          <section className="mt-5 grid gap-4 md:mt-6 lg:grid-cols-3">
            <DashboardCard title="Материалы урока" index="01">
              {activeLesson?.materials?.length ? (
                <ul className="space-y-2 text-sm">
                  {activeLesson.materials.map((material) => (
                    <li key={material.url}>
                      <a
                        href={material.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-ember-deep underline underline-offset-2 hover:text-ember"
                      >
                        {material.label} ↗
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm leading-relaxed text-ink/65">
                  К этому уроку материалы пока не приложены.
                </p>
              )}
            </DashboardCard>

            <DashboardCard title="Следующий шаг" index="02">
              <p className="text-sm leading-relaxed text-ink/65">
                Продолжайте с места остановки или переходите к следующему уроку
                программы.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-5"
                disabled={activeIndex >= lessons.length - 1}
                onClick={() => setActiveLessonId(lessons[activeIndex + 1]?.id ?? activeLessonId)}
              >
                Следующий урок →
              </Button>
            </DashboardCard>

            <DashboardCard title="Связь с командой" index="03">
              <p className="text-sm leading-relaxed text-ink/65">
                Вопрос по доступу или уроку можно задать напрямую куратору.
              </p>
              <ButtonLink
                href={SITE.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="outline"
                size="sm"
                className="mt-5"
              >
                Telegram ↗
              </ButtonLink>
            </DashboardCard>
          </section>
        </main>

        <aside className="self-start rounded-2xl border border-ink/10 bg-warm p-3 sm:p-4 xl:sticky xl:top-20 xl:order-1">
          {available.length > 1 && (
            <label className="mb-3 block px-1">
              <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                Курс
              </span>
              <select
                value={course.slug}
                onChange={(event) => setCourseSlug(event.target.value)}
                className="h-10 w-full rounded-md border border-ink/15 bg-white px-3 text-sm text-ink outline-none focus:border-ink/50"
              >
                {available.map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.title}
                  </option>
                ))}
              </select>
            </label>
          )}

          <div className="flex items-center justify-between gap-3 px-2 py-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
              Программа курса
            </p>
            <span className="font-mono text-[10px] text-muted">
              {completed.filter((id) => lessons.some((l) => l.id === id)).length}/{lessons.length}
            </span>
          </div>

          <div className="mt-1 max-h-[60svh] space-y-4 overflow-y-auto pr-1 xl:max-h-[calc(100svh-16rem)]">
            {course.program.map((module, moduleIndex) => (
              <div key={module.id}>
                <p className="px-2 font-display text-xs font-semibold uppercase leading-snug text-ink">
                  {String(moduleIndex + 1).padStart(2, "0")} · {module.title}
                </p>
                <div className="mt-2 space-y-1">
                  {lessons
                    .filter((lesson) => lesson.moduleIndex === moduleIndex)
                    .map((lesson) => (
                      <LessonButton
                        key={lesson.id}
                        lesson={lesson}
                        done={completed.includes(lesson.id)}
                        active={lesson.id === activeLesson?.id}
                        onSelect={() => setActiveLessonId(lesson.id)}
                      />
                    ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-ink/10 pt-3">
            <span className="truncate px-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
              {session.label}
            </span>
            <Button variant="ghost" size="sm" onClick={onSignOut}>
              Выйти
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function LessonButton({
  lesson,
  done,
  active,
  onSelect,
}: {
  lesson: FlatLesson;
  done: boolean;
  active: boolean;
  onSelect: () => void;
}) {
  const lessonHasVideo = hasVideo(lesson.video);
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={active ? "true" : undefined}
      className={cn(
        "flex w-full items-start gap-2 rounded-lg px-2 py-2.5 text-left text-xs leading-snug transition",
        active ? "bg-white text-ink shadow-sm" : "text-ink/65 hover:bg-white/70 hover:text-ink",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border text-[9px]",
          done ? "border-ember bg-ember text-white" : "border-ink/20",
        )}
      >
        {done ? "✓" : lesson.lessonIndex + 1}
      </span>
      <span className="min-w-0 flex-1">{lesson.title}</span>
      {lessonHasVideo && (
        <span aria-hidden="true" className="mt-0.5 shrink-0 font-mono text-[9px] text-muted">
          ▶
        </span>
      )}
    </button>
  );
}

function DashboardCard({
  title,
  index,
  children,
}: {
  title: string;
  index: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-ink/10 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        <span className="font-mono text-[10px] text-muted">[{index}]</span>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function hasFreeLesson(course: Course): boolean {
  return course.program.some((module) => module.lessons.some((lesson) => lesson.free));
}
