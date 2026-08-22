/** Мини-утилита объединения классов (замена clsx для наших нужд). */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
