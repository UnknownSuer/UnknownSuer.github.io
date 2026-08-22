"use client";

import type { ContentPack } from "@/shared/content/types";
import { normalizeAccessCode, sha256Hex, timingSafeEqual } from "@/shared/lib/crypto";
import { normalizeRuPhone } from "@/features/student-auth/phone-otp-auth";

/**
 * Вход в личный кабинет.
 *
 * Два режима, переключаются наличием NEXT_PUBLIC_STUDENT_API:
 *
 *  • «api» — боевой. Телефон покупки → SMS-код → сессия. Проверка на сервере,
 *    контракт описан в features/student-auth/phone-otp-auth.ts. Включается,
 *    когда поднят бэкенд (Directus/VPS) — см. ADMIN.md.
 *
 *  • «code» — для статического хостинга (GitHub Pages), где сервера нет.
 *    Админ выдаёт ученику персональный код доступа, в контенте лежит только
 *    его SHA-256. Код проверяется в браузере.
 *
 * Честно про «code»: раз проверка идёт на клиенте, кто угодно может достать
 * список хешей из бандла и перебирать их офлайн. Поэтому коды генерируются
 * длинными и случайными (см. админку), а по-настоящему закрытым кабинет
 * становится только в режиме «api». Само видео при этом защищает провайдер
 * (Kinescope и т.п.), а не эта проверка.
 */

const SESSION_KEY = "angar:student:session";

export type AuthMode = "api" | "code";

export const STUDENT_API_URL = process.env.NEXT_PUBLIC_STUDENT_API ?? "";

export function getAuthMode(): AuthMode {
  return STUDENT_API_URL ? "api" : "code";
}

export interface StudentSessionData {
  /** Как обращаться к ученику + вотермарк на видео. */
  label: string;
  courseSlugs: string[];
  /** ISO-время окончания сессии. */
  expiresAt: string;
  mode: AuthMode;
  /** Токен боевой сессии — только в режиме «api». */
  token?: string;
}

export type AuthResult =
  | { ok: true; session: StudentSessionData }
  | { ok: false; error: string };

/* ── Хранение сессии ─────────────────────────────────────────────── */

export function readSession(): StudentSessionData | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StudentSessionData;
    if (!parsed?.expiresAt || new Date(parsed.expiresAt).getTime() <= Date.now()) {
      window.localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeSession(session: StudentSessionData): void {
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Приватный режим браузера — сессия проживёт до перезагрузки вкладки.
  }
}

export function clearSession(): void {
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    // Нечего чистить.
  }
}

function expiryFrom(days: number): string {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

/* ── Режим «code»: персональный код доступа ──────────────────────── */

export async function signInWithAccessCode(
  rawCode: string,
  pack: ContentPack,
): Promise<AuthResult> {
  const code = normalizeAccessCode(rawCode);
  if (code.length < 4) {
    return { ok: false, error: "Введите код доступа из письма о покупке." };
  }

  const hash = await sha256Hex(code);
  const record = pack.studentAccess.find((item) => timingSafeEqual(item.codeHash, hash));

  if (!record) {
    return { ok: false, error: "Код не найден. Проверьте раскладку или напишите куратору." };
  }
  if (record.disabled) {
    return { ok: false, error: "Доступ по этому коду отключён. Напишите куратору." };
  }
  if (record.expiresAt && new Date(record.expiresAt).getTime() <= Date.now()) {
    return { ok: false, error: "Срок доступа истёк. Продлить можно у куратора." };
  }

  return {
    ok: true,
    session: {
      label: record.label || "Ученик",
      courseSlugs: record.courseSlugs,
      expiresAt: record.expiresAt ?? expiryFrom(pack.settings.studentSessionDays),
      mode: "code",
    },
  };
}

/* ── Режим «api»: телефон + SMS-код ──────────────────────────────── */

export async function requestPhoneCode(
  rawPhone: string,
): Promise<{ ok: true; challengeId: string } | { ok: false; error: string }> {
  const phone = normalizeRuPhone(rawPhone);
  if (!phone) {
    return { ok: false, error: "Телефон в формате +7 900 000-00-00." };
  }

  try {
    const response = await fetch(`${STUDENT_API_URL}/auth/request-code`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    const data = (await response.json().catch(() => null)) as
      | { challengeId?: string; error?: string }
      | null;

    if (!response.ok || !data?.challengeId) {
      // Наружу — нейтральный текст: не подсказываем, есть ли номер в базе.
      return { ok: false, error: data?.error ?? "Не удалось отправить код. Попробуйте позже." };
    }
    return { ok: true, challengeId: data.challengeId };
  } catch {
    return { ok: false, error: "Сервис авторизации недоступен. Попробуйте позже." };
  }
}

export async function verifyPhoneCode(
  challengeId: string,
  code: string,
  pack: ContentPack,
): Promise<AuthResult> {
  try {
    const response = await fetch(`${STUDENT_API_URL}/auth/verify-code`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ challengeId, code: code.trim() }),
    });
    const data = (await response.json().catch(() => null)) as
      | { token?: string; label?: string; courseSlugs?: string[]; error?: string }
      | null;

    if (!response.ok || !data?.token) {
      return { ok: false, error: data?.error ?? "Код неверный или истёк." };
    }

    return {
      ok: true,
      session: {
        label: data.label ?? "Ученик",
        courseSlugs: data.courseSlugs ?? [],
        expiresAt: expiryFrom(pack.settings.studentSessionDays),
        mode: "api",
        token: data.token,
      },
    };
  } catch {
    return { ok: false, error: "Сервис авторизации недоступен. Попробуйте позже." };
  }
}

/* ── Демо-вход ───────────────────────────────────────────────────── */

export function signInAsDemo(pack: ContentPack): StudentSessionData {
  return {
    label: "Демо-доступ",
    courseSlugs: pack.courses.filter((c) => c.published !== false).map((c) => c.slug),
    expiresAt: expiryFrom(1),
    mode: "code",
  };
}
