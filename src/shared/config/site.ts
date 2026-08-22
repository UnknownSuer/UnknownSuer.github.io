/**
 * Глобальные константы сайта.
 * TODO(владелец): подтвердить email/телефон/telegram и домен перед запуском.
 */
export const SITE = {
  name: "АНГАР",
  fullName: "AmigoKiz Production",
  owner: "Амир Абдурахманов",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://amigokiz.ru",
  email: "hello@amigokiz.ru",
  phone: "+7 (000) 000-00-00",
  telegramHandle: "@amigokiz",
  telegramUrl: "https://t.me/amigokiz",
  behanceUrl: "https://www.behance.net/amigokiz",
  instagramHandle: "@amigokiz",
  instagramUrl: "https://www.instagram.com/amigokiz",
  geo: "Кизилюрт · Дагестан",
} as const;

export const NAV = [
  { href: "/portfolio", label: "Портфолио" },
  { href: "/courses", label: "Курсы" },
  { href: "/contacts", label: "Контакты" },
  { href: "/about", label: "О нас" },
] as const;

export const LEGAL_LINKS = [
  { href: "/legal/privacy", label: "Политика конфиденциальности" },
  { href: "/legal/consent", label: "Согласие на обработку ПДн" },
  { href: "/legal/offer", label: "Публичная оферта" },
  { href: "/legal/terms", label: "Пользовательское соглашение" },
  { href: "/legal/cookies", label: "Cookie-policy" },
  { href: "/legal/requisites", label: "Реквизиты" },
] as const;

/** Сноска, обязательная при упоминании Instagram на сайте в РФ. */
export const META_DISCLAIMER =
  "* Instagram принадлежит Meta Platforms Inc., признанной экстремистской организацией; её деятельность запрещена на территории РФ.";
