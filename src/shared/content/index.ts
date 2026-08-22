import raw from "@/content/content.json";
import { parseContent } from "@/shared/content/schema";
import type {
  Course,
  ContentPack,
  PortfolioFolder,
  Project,
  Teacher,
} from "@/shared/content/types";

/**
 * Контент сайта.
 *
 * Источник правды — src/content/content.json: его читает сборка (SSG), его же
 * выгружает админка (/admin → «Скачать content.json»). Разбор строгий: битый
 * файл роняет сборку с понятной ошибкой, а не выкатывается на прод.
 *
 * Для правок без пересборки есть рантайм-оверлей public/content/content.json —
 * его подхватывают кабинет и админка (см. shared/content/runtime.ts).
 */
export const content: ContentPack = parseContent(raw);

const byOrder = <T extends { order?: number }>(a: T, b: T) =>
  (a.order ?? 0) - (b.order ?? 0);

export function getContent(): ContentPack {
  return content;
}

/** Все курсы, включая черновики — для админки и генерации страниц. */
export function getCourses(): Course[] {
  return [...content.courses].sort(byOrder);
}

/** Только опубликованные — для афиши, главной и карты сайта. */
export function getPublishedCourses(): Course[] {
  return getCourses().filter((course) => course.published !== false);
}

export function getCourse(slug: string): Course | undefined {
  return content.courses.find((course) => course.slug === slug);
}

/** Ближайший поток — для баннера на главной. */
export function getNearestCourse(): Course {
  const published = getPublishedCourses();
  const pool = published.length > 0 ? published : content.courses;
  return [...pool].sort((a, b) => a.startDate.localeCompare(b.startDate))[0];
}

export function getProjects(): Project[] {
  return [...content.projects].sort(byOrder);
}

export function getProject(slug: string): Project | undefined {
  return content.projects.find((project) => project.slug === slug);
}

export function getPortfolioFolders(): PortfolioFolder[] {
  return [...content.portfolioFolders].sort(byOrder);
}

export function getTeachers(): Teacher[] {
  return content.teachers;
}

export function getCourseTeachers(course: Course): Teacher[] {
  return course.teacherIds
    .map((id) => content.teachers.find((teacher) => teacher.id === id))
    .filter((teacher): teacher is Teacher => Boolean(teacher));
}

/** Плоский список уроков курса — используется кабинетом и админкой. */
export function flattenLessons(course: Course) {
  return course.program.flatMap((module, moduleIndex) =>
    module.lessons.map((lesson, lessonIndex) => ({
      ...lesson,
      moduleId: module.id,
      moduleIndex,
      moduleTitle: module.title,
      lessonIndex,
    })),
  );
}

export type FlatLesson = ReturnType<typeof flattenLessons>[number];
