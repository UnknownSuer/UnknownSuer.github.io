import type { ReactNode } from "react";
import { Container } from "@/shared/ui/Container";

/** Обёртка юридических страниц: заголовок, дата редакции, плашка «черновик». */
export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <Container className="py-14">
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
          Документы
        </p>
        <h1 className="mt-3 font-display text-2xl font-semibold uppercase leading-tight text-ink md:text-4xl">
          {title}
        </h1>
        <p className="mt-3 font-mono text-xs text-muted">Редакция от {updated}</p>
        <div className="mt-6 rounded-lg border border-wood-deep/40 bg-wood/25 px-4 py-3 text-sm text-ink/80">
          Черновик документа. Перед публикацией: вычитка юристом, заполнение
          реквизитов владельца (ФИО, ИНН, контакты).
        </div>
        <div className="prose-legal mt-8">{children}</div>
      </div>
    </Container>
  );
}
