"use client";

import type {
  InputHTMLAttributes,
  Ref,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/shared/lib/cn";

const CONTROL =
  "w-full rounded-md border bg-white px-3.5 text-[15px] text-ink outline-none transition duration-150 placeholder:text-muted/60";

function controlClasses(error?: string, extra?: string) {
  return cn(
    CONTROL,
    error ? "border-danger" : "border-ink/15 focus:border-ink/50",
    extra,
  );
}

function FieldShell({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-danger">{error}</span>}
    </label>
  );
}

export function TextField({
  label,
  error,
  ref,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  ref?: Ref<HTMLInputElement>;
}) {
  return (
    <FieldShell label={label} error={error}>
      <input ref={ref} className={controlClasses(error, cn("h-11", className))} {...props} />
    </FieldShell>
  );
}

export function TextAreaField({
  label,
  error,
  ref,
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
  ref?: Ref<HTMLTextAreaElement>;
}) {
  return (
    <FieldShell label={label} error={error}>
      <textarea
        ref={ref}
        className={controlClasses(error, cn("min-h-28 py-2.5", className))}
        {...props}
      />
    </FieldShell>
  );
}

export function SelectField({
  label,
  error,
  ref,
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  ref?: Ref<HTMLSelectElement>;
}) {
  return (
    <FieldShell label={label} error={error}>
      <select ref={ref} className={controlClasses(error, cn("h-11", className))} {...props}>
        {children}
      </select>
    </FieldShell>
  );
}
