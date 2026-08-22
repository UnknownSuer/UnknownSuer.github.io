"use client";

import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

/** Мелкие примитивы админки: одинаковые поля, карточки и кнопки-иконки. */

export function Section({
  title,
  hint,
  action,
  children,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-ink/10 bg-white p-4 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-sm font-semibold uppercase tracking-tight text-ink">
            {title}
          </h2>
          {hint && <p className="mt-1 text-xs leading-relaxed text-muted">{hint}</p>}
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border border-ink/10 bg-warm p-3 md:p-4", className)}>
      {children}
    </div>
  );
}

export function Grid({ children, cols = 2 }: { children: ReactNode; cols?: 2 | 3 | 4 }) {
  const map = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  } as const;
  return <div className={cn("grid gap-3", map[cols])}>{children}</div>;
}

const CONTROL =
  "w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm text-ink outline-none transition placeholder:text-muted/50 focus:border-ink/50";

export function Text({
  label,
  value,
  onChange,
  placeholder,
  hint,
  mono,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  mono?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={cn(CONTROL, mono && "font-mono text-xs")}
      />
      {hint && <span className="mt-1 block text-[11px] leading-snug text-muted">{hint}</span>}
    </label>
  );
}

export function Area({
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
        {label}
      </span>
      <textarea
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={cn(CONTROL, "resize-y leading-relaxed")}
      />
    </label>
  );
}

export function Num({
  label,
  value,
  onChange,
  min = 0,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  step?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
        {label}
      </span>
      <input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        min={min}
        step={step}
        onChange={(event) => {
          const next = Number(event.target.value);
          onChange(Number.isFinite(next) ? next : 0);
        }}
        className={cn(CONTROL, "font-mono")}
      />
    </label>
  );
}

export function Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className={CONTROL}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 py-1 text-sm text-ink">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 accent-ember"
      />
      {label}
    </label>
  );
}

/** Редактор списка строк: пункты аудитории, результаты, фичи тарифа. */
export function StringList({
  label,
  items,
  onChange,
  placeholder,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}) {
  const set = (index: number, value: string) =>
    onChange(items.map((item, i) => (i === index ? value : item)));

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
          {label}
        </span>
        <MiniButton onClick={() => onChange([...items, ""])}>+ пункт</MiniButton>
      </div>
      <div className="space-y-1.5">
        {items.length === 0 && (
          <p className="text-[11px] text-muted">Пусто — добавьте первый пункт.</p>
        )}
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <input
              value={item}
              placeholder={placeholder}
              onChange={(event) => set(index, event.target.value)}
              className={CONTROL}
            />
            <MoveButtons
              index={index}
              total={items.length}
              onMove={(from, to) => onChange(move(items, from, to))}
            />
            <IconButton
              title="Удалить пункт"
              onClick={() => onChange(items.filter((_, i) => i !== index))}
            >
              ✕
            </IconButton>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MiniButton({
  children,
  onClick,
  tone = "default",
}: {
  children: ReactNode;
  onClick: () => void;
  tone?: "default" | "danger" | "accent";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] transition",
        tone === "danger" && "border-danger/40 text-danger hover:bg-danger/10",
        tone === "accent" && "border-ember bg-ember text-white hover:bg-ember-deep",
        tone === "default" && "border-ink/20 text-ink/70 hover:border-ink/50 hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

export function IconButton({
  children,
  onClick,
  title,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  title: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className="flex size-8 shrink-0 items-center justify-center rounded-md border border-ink/15 text-xs text-ink/60 transition hover:border-ink/40 hover:text-ink disabled:pointer-events-none disabled:opacity-35"
    >
      {children}
    </button>
  );
}

export function MoveButtons({
  index,
  total,
  onMove,
}: {
  index: number;
  total: number;
  onMove: (from: number, to: number) => void;
}) {
  return (
    <>
      <IconButton title="Выше" disabled={index === 0} onClick={() => onMove(index, index - 1)}>
        ↑
      </IconButton>
      <IconButton
        title="Ниже"
        disabled={index === total - 1}
        onClick={() => onMove(index, index + 1)}
      >
        ↓
      </IconButton>
    </>
  );
}

/** Перестановка элемента массива — общая для всех списков админки. */
export function move<T>(items: T[], from: number, to: number): T[] {
  if (to < 0 || to >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/** Устойчивый id из подписи: латиница/цифры + случайный хвост. */
export function makeId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}
