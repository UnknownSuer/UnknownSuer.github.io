import { z } from "zod";
import type { ContentPack } from "@/shared/content/types";

/**
 * Схема контент-пака. Один источник правды и для сборки (SSG читает
 * src/content/content.json), и для рантайм-оверлея, и для импорта в админке:
 * подсунуть битый JSON нельзя — он не пройдёт разбор.
 */

export const CONTENT_VERSION = 1;

const direction = z.enum(["vfx", "cgi", "ugc"]);
const accent = z.enum(["wood", "ember", "ink", "pine"]);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Дата в формате ГГГГ-ММ-ДД");

export const videoSourceSchema = z.object({
  provider: z.enum(["none", "kinescope", "vk", "rutube", "youtube", "file"]),
  ref: z.string().default(""),
  poster: z.string().optional(),
  duration: z.string().optional(),
});

export const lessonSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().optional(),
  video: videoSourceSchema.optional(),
  materials: z
    .array(z.object({ label: z.string().min(1), url: z.string().min(1) }))
    .optional(),
  free: z.boolean().optional(),
});

export const courseModuleSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().optional(),
  lessons: z.array(lessonSchema),
});

export const tariffSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  price: z.number().int().nonnegative(),
  popular: z.boolean().optional(),
  features: z.array(z.string()),
});

export const teacherSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  role: z.string().default(""),
  bio: z.string().default(""),
  photo: z.string().default(""),
  links: z.array(z.object({ label: z.string(), url: z.string() })).default([]),
});

export const portfolioFolderSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  cover: z.string().optional(),
  order: z.number().int().default(0),
});

export const projectSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  category: direction,
  folderId: z.string().optional(),
  year: z.number().int(),
  client: z.string().default(""),
  services: z.array(z.string()).default([]),
  poster: z.string().default(""),
  description: z.array(z.string()).default([]),
  link: z.string().optional(),
  demo: z.boolean().optional(),
  order: z.number().int().optional(),
});

export const courseSchema = z.object({
  slug: z.string().min(1),
  stream: z.string().min(1),
  title: z.string().min(1),
  short: z.string().default(""),
  direction,
  accent,
  startDate: isoDate,
  weeks: z.number().int().positive(),
  price: z.number().int().nonnegative(),
  format: z.string().default("онлайн"),
  seats: z.number().int().nonnegative(),
  poster: z.string().default(""),
  program: z.array(courseModuleSchema).default([]),
  audience: z.array(z.string()).default([]),
  outcomes: z.array(z.string()).default([]),
  tariffs: z.array(tariffSchema).default([]),
  teacherIds: z.array(z.string()).default([]),
  published: z.boolean().optional(),
  order: z.number().int().optional(),
});

export const studentAccessSchema = z.object({
  id: z.string().min(1),
  label: z.string().default(""),
  codeHash: z.string().regex(/^[0-9a-f]{64}$/, "Ожидается SHA-256 в hex"),
  courseSlugs: z.array(z.string()).default([]),
  expiresAt: z.string().optional(),
  disabled: z.boolean().optional(),
});

export const contentSettingsSchema = z.object({
  cabinetTitle: z.string().default("Личный кабинет"),
  cabinetDemoLogin: z.boolean().default(false),
  studentSessionDays: z.number().int().positive().default(30),
});

export const contentPackSchema = z.object({
  version: z.number().int(),
  updatedAt: z.string().default(() => new Date().toISOString()),
  courses: z.array(courseSchema).default([]),
  projects: z.array(projectSchema).default([]),
  portfolioFolders: z.array(portfolioFolderSchema).default([]),
  teachers: z.array(teacherSchema).default([]),
  studentAccess: z.array(studentAccessSchema).default([]),
  settings: contentSettingsSchema.default({
    cabinetTitle: "Личный кабинет",
    cabinetDemoLogin: false,
    studentSessionDays: 30,
  }),
});

export type ParsedContentPack = z.infer<typeof contentPackSchema>;

/** Строгий разбор: бросает, если пак не валиден. */
export function parseContent(input: unknown): ContentPack {
  return contentPackSchema.parse(input) as ContentPack;
}

/** Мягкий разбор для рантайм-оверлея: при ошибке возвращает null. */
export function safeParseContent(input: unknown): ContentPack | null {
  const result = contentPackSchema.safeParse(input);
  return result.success ? (result.data as ContentPack) : null;
}

/** Человекочитаемый список ошибок — для импорта JSON в админке. */
export function describeContentErrors(input: unknown): string[] {
  const result = contentPackSchema.safeParse(input);
  if (result.success) return [];
  return result.error.issues.map(
    (issue) => `${issue.path.join(".") || "корень"}: ${issue.message}`,
  );
}
