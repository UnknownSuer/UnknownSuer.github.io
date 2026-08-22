import { describe, expect, test } from "vitest";
import content from "@/content/content.json";
import {
  CONTENT_VERSION,
  describeContentErrors,
  parseContent,
  safeParseContent,
} from "@/shared/content/schema";

describe("контент-пак", () => {
  test("реальный content.json проходит строгую схему", () => {
    expect(() => parseContent(content)).not.toThrow();
  });

  test("версия схемы совпадает с версией файла", () => {
    expect(parseContent(content).version).toBe(CONTENT_VERSION);
  });

  test("slug курсов уникальны", () => {
    const slugs = parseContent(content).courses.map((course) => course.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  test("id уроков уникальны внутри курса", () => {
    for (const course of parseContent(content).courses) {
      const ids = course.program.flatMap((module) => module.lessons.map((lesson) => lesson.id));
      expect(new Set(ids).size, `курс ${course.slug}`).toBe(ids.length);
    }
  });

  test("все teacherIds курсов существуют", () => {
    const pack = parseContent(content);
    const known = new Set(pack.teachers.map((teacher) => teacher.id));
    for (const course of pack.courses) {
      for (const id of course.teacherIds) expect(known.has(id), `${course.slug} → ${id}`).toBe(true);
    }
  });

  test("все folderId проектов существуют", () => {
    const pack = parseContent(content);
    const known = new Set(pack.portfolioFolders.map((folder) => folder.id));
    for (const project of pack.projects) {
      if (project.folderId) expect(known.has(project.folderId), project.slug).toBe(true);
    }
  });

  test("битый пак не проходит мягкий разбор", () => {
    expect(safeParseContent({ version: 1, courses: "нет" })).toBeNull();
  });

  test("ошибки импорта описаны по-человечески", () => {
    const errors = describeContentErrors({
      version: 1,
      courses: [{ slug: "x" }],
    });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((error) => error.includes("courses.0"))).toBe(true);
  });

  test("код доступа принимается только как SHA-256 hex", () => {
    const base = { version: CONTENT_VERSION, updatedAt: new Date().toISOString() };
    const good = safeParseContent({
      ...base,
      studentAccess: [{ id: "a", label: "l", codeHash: "a".repeat(64), courseSlugs: [] }],
    });
    const bad = safeParseContent({
      ...base,
      studentAccess: [{ id: "a", label: "l", codeHash: "секрет", courseSlugs: [] }],
    });
    expect(good).not.toBeNull();
    expect(bad).toBeNull();
  });
});
