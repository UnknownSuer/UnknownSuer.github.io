"use client";

import { getContent } from "@/shared/content";
import { safeParseContent } from "@/shared/content/schema";
import type { ContentPack } from "@/shared/content/types";
import { withBasePath } from "@/shared/lib/base-path";

/**
 * Клиентская загрузка контента.
 *
 * Приоритет:
 *   1. public/content/content.json — «горячий» оверлей. Владелец кладёт файл
 *      рядом с сайтом и меняет видео/уроки без пересборки.
 *   2. Контент, вшитый в сборку (src/content/content.json).
 *
 * Черновик админки (localStorage) намеренно НЕ участвует: он виден только
 * внутри самой админки, чтобы недоделанные правки не утекали ученикам.
 */

export const RUNTIME_OVERLAY_PATH = "/content/content.json";
export const ADMIN_DRAFT_KEY = "angar:admin:draft";

export interface LoadedContent {
  pack: ContentPack;
  source: "overlay" | "build";
}

export async function loadRuntimeContent(signal?: AbortSignal): Promise<LoadedContent> {
  try {
    const response = await fetch(withBasePath(RUNTIME_OVERLAY_PATH), {
      cache: "no-cache",
      signal,
    });
    if (response.ok) {
      const parsed = safeParseContent(await response.json());
      if (parsed) return { pack: parsed, source: "overlay" };
    }
  } catch {
    // Оверлея нет (обычный случай) либо он битый — тихо берём сборочный.
  }
  return { pack: getContent(), source: "build" };
}

/** Черновик админки — только локально, в браузере владельца. */
export function readAdminDraft(): ContentPack | null {
  try {
    const raw = window.localStorage.getItem(ADMIN_DRAFT_KEY);
    if (!raw) return null;
    return safeParseContent(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function writeAdminDraft(pack: ContentPack): void {
  try {
    window.localStorage.setItem(ADMIN_DRAFT_KEY, JSON.stringify(pack));
  } catch {
    // Переполнен localStorage — правки останутся только в памяти вкладки.
  }
}

export function clearAdminDraft(): void {
  try {
    window.localStorage.removeItem(ADMIN_DRAFT_KEY);
  } catch {
    // Нечего чистить.
  }
}
