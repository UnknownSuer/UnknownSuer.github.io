import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BriefLead, Lead } from "@/shared/api/lead-schema";

export interface BriefSubmission {
  lead: BriefLead;
  files: File[];
}

/**
 * Куда уходят заявки.
 *
 * По умолчанию — локальный route handler /api/leads. Но на статическом
 * хостинге (GitHub Pages) серверных роутов не существует: сборка их
 * выбрасывает, и заявка упирается в 404. Поэтому адрес приёма выносится в
 * переменную NEXT_PUBLIC_LEADS_ENDPOINT — туда ставится свой бэкенд, CRM
 * или форм-сервис.
 *
 * Если endpoint не отвечает, формы не делают вид, что всё хорошо: они
 * показывают запасной путь — отправить тот же текст в Telegram (см.
 * buildLeadFallbackText).
 */
export const LEADS_ENDPOINT = process.env.NEXT_PUBLIC_LEADS_ENDPOINT?.trim() || "/api/leads";

export const leadApi = createApi({
  reducerPath: "leadApi",
  baseQuery: fetchBaseQuery({ baseUrl: "" }),
  endpoints: (build) => ({
    submitLead: build.mutation<{ ok: true; id: string }, Lead>({
      query: (body) => ({ url: LEADS_ENDPOINT, method: "POST", body }),
    }),
    submitBriefLead: build.mutation<{ ok: true; id: string }, BriefSubmission>({
      query: ({ lead, files }) => {
        const body = new FormData();
        body.append("payload", JSON.stringify(lead));
        files.forEach((file) => body.append("attachments", file, file.name));
        return { url: LEADS_ENDPOINT, method: "POST", body };
      },
    }),
  }),
});

export const { useSubmitLeadMutation, useSubmitBriefLeadMutation } = leadApi;

/** Читаемый текст заявки — чтобы человек мог отправить её вручную. */
export function buildLeadFallbackText(lead: Lead, extra?: Record<string, string>): string {
  const lines: string[] =
    lead.type === "course"
      ? [
          "Заявка на курс",
          `Курс: ${extra?.courseTitle ?? lead.courseSlug}`,
          `Тариф: ${extra?.tariffName ?? lead.tariffId}`,
          `Имя: ${lead.name}`,
          `Email: ${lead.email}`,
          `Телефон: ${lead.phone}`,
        ]
      : [
          "Бриф на проект",
          `Направление: ${lead.direction}`,
          `Бюджет: ${lead.budget}`,
          `Имя: ${lead.name}`,
          `Контакт: ${lead.contact}`,
          "",
          lead.message,
        ];

  return lines.join("\n");
}
