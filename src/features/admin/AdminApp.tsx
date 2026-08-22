"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { ContentPack } from "@/shared/content/types";
import { getContent } from "@/shared/content";
import { clearAdminDraft, readAdminDraft, writeAdminDraft } from "@/shared/content/runtime";
import {
  endAdminSession,
  isAdminConfigured,
  readAdminSession,
  startAdminSession,
  verifyAdminPassword,
} from "@/features/admin/admin-auth";
import { CoursesPanel } from "@/features/admin/panels/CoursesPanel";
import { PortfolioPanel } from "@/features/admin/panels/PortfolioPanel";
import { TeachersPanel } from "@/features/admin/panels/TeachersPanel";
import { AccessPanel } from "@/features/admin/panels/AccessPanel";
import { SettingsPanel } from "@/features/admin/panels/SettingsPanel";
import { Button } from "@/shared/ui/Button";
import { cn } from "@/shared/lib/cn";

const TABS = [
  { id: "courses", label: "Курсы" },
  { id: "portfolio", label: "Портфолио" },
  { id: "teachers", label: "Преподаватели" },
  { id: "access", label: "Доступы" },
  { id: "settings", label: "Публикация" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function AdminApp() {
  const [unlocked, setUnlocked] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setUnlocked(readAdminSession());
    setChecked(true);
  }, []);

  if (!checked) return null;
  if (!isAdminConfigured()) return <NotConfigured />;
  if (!unlocked) return <LockScreen onUnlock={() => setUnlocked(true)} />;

  return (
    <Workspace
      onLock={() => {
        endAdminSession();
        setUnlocked(false);
      }}
    />
  );
}

/* ── Экран «замок не настроен» ───────────────────────────────────── */

function NotConfigured() {
  return (
    <Shell>
      <div className="mx-auto max-w-2xl rounded-2xl border border-ink/10 bg-white p-6 md:p-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ember-deep">
          Админка закрыта
        </p>
        <h1 className="mt-3 font-display text-2xl font-bold uppercase tracking-tight text-ink">
          Пароль не задан
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-ink/70">
          Пока переменная <code className="font-mono">NEXT_PUBLIC_ADMIN_PASS_HASH</code> пуста,
          админка не открывается ни у кого — это защита по умолчанию для публичного
          хостинга.
        </p>
        <ol className="mt-5 space-y-2 text-sm leading-relaxed text-ink/70">
          <li>
            <b>1.</b> Придумайте длинный случайный пароль (20+ символов).
          </li>
          <li>
            <b>2.</b> Получите его SHA-256:{" "}
            <code className="mt-1 block break-all rounded bg-warm px-2 py-1.5 font-mono text-xs">
              node -e &quot;console.log(require(&apos;crypto&apos;).createHash(&apos;sha256&apos;).update(process.argv[1]).digest(&apos;hex&apos;))&quot; &apos;ВАШ-ПАРОЛЬ&apos;
            </code>
          </li>
          <li>
            <b>3.</b> Положите хеш в секреты репозитория и в{" "}
            <code className="font-mono">.env.local</code> — подробности в{" "}
            <code className="font-mono">ADMIN.md</code>.
          </li>
        </ol>
      </div>
    </Shell>
  );
}

/* ── Экран входа ─────────────────────────────────────────────────── */

function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const ok = await verifyAdminPassword(password);
    setBusy(false);
    if (!ok) {
      setError("Пароль не подошёл.");
      setPassword("");
      return;
    }
    startAdminSession();
    onUnlock();
  };

  return (
    <Shell>
      <form
        onSubmit={submit}
        className="mx-auto max-w-sm rounded-2xl border border-ink/10 bg-white p-6 shadow-lift"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
          Панель управления
        </p>
        <h1 className="mt-3 font-display text-xl font-bold uppercase tracking-tight text-ink">
          Вход для владельца
        </h1>
        <label className="mt-6 block">
          <span className="mb-1.5 block text-sm font-medium text-ink">Пароль</span>
          <input
            type="password"
            value={password}
            autoFocus
            autoComplete="current-password"
            onChange={(event) => setPassword(event.target.value)}
            className="h-11 w-full rounded-md border border-ink/15 bg-white px-3.5 text-[15px] text-ink outline-none focus:border-ink/50"
          />
        </label>
        {error && <p className="mt-2 text-sm text-danger">{error}</p>}
        <Button type="submit" size="lg" className="mt-5 w-full" disabled={busy}>
          {busy ? "Проверяем…" : "Войти"}
        </Button>
        <p className="mt-4 text-[11px] leading-relaxed text-muted">
          Сессия живёт 2 часа и только в этой вкладке. Правки хранятся локально в
          вашем браузере, пока вы не выгрузите content.json.
        </p>
      </form>
    </Shell>
  );
}

/* ── Рабочая область ─────────────────────────────────────────────── */

function Workspace({ onLock }: { onLock: () => void }) {
  const [tab, setTab] = useState<TabId>("courses");
  const [pack, setPack] = useState<ContentPack>(() => structuredClone(getContent()));
  const [dirty, setDirty] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Черновик переживает перезагрузку страницы, но никуда не публикуется.
  useEffect(() => {
    const draft = readAdminDraft();
    if (draft) {
      setPack(draft);
      setDirty(true);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded || !dirty) return;
    writeAdminDraft(pack);
  }, [pack, dirty, loaded]);

  // Уход со страницы с несохранённым черновиком — частая потеря работы.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const update = useCallback((updater: (current: ContentPack) => ContentPack) => {
    setPack((current) => updater(current));
    setDirty(true);
  }, []);

  const replace = useCallback((next: ContentPack) => {
    setPack(next);
    setDirty(true);
  }, []);

  if (!loaded) return null;

  return (
    <Shell>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink/10 bg-white px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition",
                tab === item.id ? "bg-ink text-white" : "text-ink/65 hover:bg-warm hover:text-ink",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "font-mono text-[10px] uppercase tracking-[0.16em]",
              dirty ? "text-ember-deep" : "text-muted",
            )}
          >
            {dirty ? "черновик не выгружен" : "изменений нет"}
          </span>
          {dirty && (
            <button
              type="button"
              onClick={() => {
                if (!window.confirm("Удалить локальный черновик и вернуться к контенту сборки?"))
                  return;
                clearAdminDraft();
                setPack(structuredClone(getContent()));
                setDirty(false);
              }}
              className="rounded-md border border-ink/20 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink/70 transition hover:border-ink/50 hover:text-ink"
            >
              сбросить
            </button>
          )}
          <Button variant="ghost" size="sm" onClick={onLock}>
            Выйти
          </Button>
        </div>
      </div>

      {tab === "courses" && <CoursesPanel pack={pack} update={update} />}
      {tab === "portfolio" && <PortfolioPanel pack={pack} update={update} />}
      {tab === "teachers" && <TeachersPanel pack={pack} update={update} />}
      {tab === "access" && <AccessPanel pack={pack} update={update} />}
      {tab === "settings" && (
        <SettingsPanel
          pack={pack}
          update={update}
          onReplace={(next) => {
            replace(next);
            setTab("settings");
          }}
        />
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8 md:px-8 md:py-10">
      <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.24em] text-muted">
        Ангар · панель управления контентом
      </p>
      {children}
    </div>
  );
}
