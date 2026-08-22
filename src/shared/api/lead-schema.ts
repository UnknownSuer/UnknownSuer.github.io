import { z } from "zod";

/**
 * Zod-схемы заявок. Единый источник правды для валидации:
 * используются и в формах (React Hook Form), и на бэкенде.
 */

export const consentSchema = z
  .boolean()
  .refine((v) => v === true, {
    message: "Нужно согласие на обработку персональных данных",
  });

/** Заявка на курс (из диалога «Купить курс»). */
export const courseLeadSchema = z.object({
  type: z.literal("course"),
  courseSlug: z.string().min(1),
  tariffId: z.string().min(1, "Выберите тариф"),
  name: z.string().min(2, "Как к вам обращаться?"),
  email: z.string().email("Похоже, в email опечатка"),
  phone: z
    .string()
    .min(10, "Телефон в формате +7 900 000-00-00")
    .max(20, "Слишком длинный номер"),
  consent: consentSchema,
});

/** Бриф на VFX/CGI/UGC-проект (страница «Контакты»). */
export const briefLeadSchema = z.object({
  type: z.literal("brief"),
  direction: z.enum(["vfx", "cgi", "ugc", "other"]),
  message: z.string().min(10, "Расскажите чуть подробнее — хотя бы пару предложений"),
  budget: z.enum(["100", "100-300", "300-500", "lt1m", "discuss"]),
  name: z.string().min(2, "Как к вам обращаться?"),
  contact: z.string().min(5, "Telegram, телефон или email"),
  consent: consentSchema,
});

export const leadSchema = z.discriminatedUnion("type", [
  courseLeadSchema,
  briefLeadSchema,
]);

export type CourseLead = z.infer<typeof courseLeadSchema>;
export type BriefLead = z.infer<typeof briefLeadSchema>;
export type Lead = z.infer<typeof leadSchema>;

export const BUDGET_OPTIONS = [
  { value: "100", label: "100 тыс. рублей" },
  { value: "100-300", label: "100–300 тыс." },
  { value: "300-500", label: "300–500 тыс. рублей" },
  { value: "lt1m", label: "до 1 млн" },
  { value: "discuss", label: "Обсудим" },
] as const;

export const BRIEF_DIRECTION_OPTIONS = [
  { value: "vfx", label: "VFX-визуализация" },
  { value: "cgi", label: "CGI / 3D-ролик" },
  { value: "ugc", label: "UGC-контент" },
  { value: "other", label: "Другое / не знаю" },
] as const;
