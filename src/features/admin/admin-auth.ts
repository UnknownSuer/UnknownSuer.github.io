"use client";

import { sha256Hex, timingSafeEqual } from "@/shared/lib/crypto";

/**
 * Замок админки.
 *
 * Пароль нигде не хранится — в сборку попадает только его SHA-256
 * (NEXT_PUBLIC_ADMIN_PASS_HASH). Если хеш не задан, админка не открывается
 * вообще: так на публичном GitHub Pages она по умолчанию мертва.
 *
 * Важно понимать границу. Сайт статический, сервера нет, поэтому проверка
 * идёт в браузере — хеш лежит в бандле и теоретически поддаётся перебору.
 * Держится это на двух вещах:
 *
 *  1. Админка НИЧЕГО не публикует сама. Она правит копию контента в браузере
 *     владельца и отдаёт готовый content.json файлом. Чтобы правки попали на
 *     сайт, файл нужно закоммитить в репозиторий — а туда пускает GitHub,
 *     не этот пароль.
 *  2. Пароль обязан быть длинным и случайным (20+ символов) — тогда перебор
 *     по SHA-256 бессмысленен.
 *
 * Когда появится бэкенд (Directus/VPS), авторизацию нужно перенести на
 * сервер: см. ADMIN.md, раздел «Боевой режим».
 */

const SESSION_KEY = "angar:admin:session";
const SESSION_TTL_MS = 2 * 60 * 60 * 1000;

export const ADMIN_PASS_HASH = (process.env.NEXT_PUBLIC_ADMIN_PASS_HASH ?? "")
  .trim()
  .toLowerCase();

export function isAdminConfigured(): boolean {
  return /^[0-9a-f]{64}$/.test(ADMIN_PASS_HASH);
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  if (!isAdminConfigured()) return false;
  if (password.length === 0) return false;
  const hash = await sha256Hex(password);
  return timingSafeEqual(hash, ADMIN_PASS_HASH);
}

/** Сессия живёт во вкладке: закрыл браузер — вход нужен заново. */
export function readAdminSession(): boolean {
  if (!isAdminConfigured()) return false;
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (!raw) return false;
    const { expiresAt, hash } = JSON.parse(raw) as { expiresAt: number; hash: string };
    // Смена пароля обесценивает старые сессии.
    if (hash !== ADMIN_PASS_HASH || expiresAt <= Date.now()) {
      window.sessionStorage.removeItem(SESSION_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function startAdminSession(): void {
  try {
    window.sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ expiresAt: Date.now() + SESSION_TTL_MS, hash: ADMIN_PASS_HASH }),
    );
  } catch {
    // Приватный режим — сессия проживёт до перезагрузки страницы.
  }
}

export function endAdminSession(): void {
  try {
    window.sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // Нечего чистить.
  }
}

/** Случайный код доступа для ученика — читаемый, но не угадываемый. */
export function generateAccessCode(): string {
  const alphabet = "abcdefghijkmnpqrstuvwxyz23456789";
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  const body = [...bytes].map((b) => alphabet[b % alphabet.length]).join("");
  return `angar-${body.slice(0, 4)}-${body.slice(4, 8)}-${body.slice(8, 12)}`;
}
