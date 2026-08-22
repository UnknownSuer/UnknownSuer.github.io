const NBSP = " ";

/** 24900 → «24 900 ₽» (неразрывные пробелы). */
export function formatPrice(value: number): string {
  const digits = Math.trunc(value).toString();
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  return `${grouped}${NBSP}₽`;
}

/** «2026-09-12» → «12.09». */
export function formatDateShort(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${d}.${m}`;
}

/** «2026-09-12» → «12.09.2026». */
export function formatDateFull(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

/** Русская плюрализация: pluralizeRu(2, ["неделя", "недели", "недель"]) → «недели». */
export function pluralizeRu(n: number, forms: [string, string, string]): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
  return forms[2];
}

/** 6 → «6 недель». */
export function weeksLabel(n: number): string {
  return `${n}${NBSP}${pluralizeRu(n, ["неделя", "недели", "недель"])}`;
}
