/**
 * SHA-256 через WebCrypto — для кодов доступа ученика и пароля админки.
 * Сами секреты нигде не хранятся, только их хеши.
 */
export async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Нормализация кода доступа: регистр и пробелы не должны мешать ученику. */
export function normalizeAccessCode(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, "");
}

/** Сравнение хешей за постоянное время — привычка, не роскошь. */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
