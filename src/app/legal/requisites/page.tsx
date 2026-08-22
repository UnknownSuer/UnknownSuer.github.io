import type { Metadata } from "next";
import { LegalPage } from "@/shared/ui/LegalPage";
import { SITE } from "@/shared/config/site";

export const metadata: Metadata = {
  title: "Реквизиты",
};

const ROWS = [
  { label: "Исполнитель", value: "[ФИО полностью] (Amigo Kiz)" },
  {
    label: "Статус",
    value:
      "Самозанятый — плательщик налога на профессиональный доход (422-ФЗ)",
  },
  { label: "ИНН", value: "[заполнить перед публикацией]" },
  { label: "Email", value: SITE.email },
  { label: "Телефон", value: SITE.phone },
  { label: "География", value: "Кизилюрт (Республика Дагестан)" },
  {
    label: "Приём платежей",
    value: "ЮKassa (банковские карты, СБП). Чек формируется в «Мой налог» и направляется автоматически",
  },
] as const;

export default function RequisitesPage() {
  return (
    <LegalPage title="Реквизиты" updated="16.08.2026">
      <div className="not-prose overflow-hidden rounded-xl border border-ink/10">
        <dl className="divide-y divide-ink/10">
          {ROWS.map((row) => (
            <div
              key={row.label}
              className="grid gap-1 px-5 py-4 sm:grid-cols-[200px_1fr] sm:gap-6"
            >
              <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted sm:pt-0.5">
                {row.label}
              </dt>
              <dd className="text-sm font-medium text-ink">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <p>
        Деятельность ведётся без образования юридического лица и без статуса ИП
        в соответствии с Федеральным законом № 422-ФЗ. Онлайн-касса не
        применяется; фискальные чеки формирует ФНС через приложение «Мой
        налог».
      </p>
    </LegalPage>
  );
}
