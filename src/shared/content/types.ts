import type { Direction } from "@/shared/config/directions";

/** Цветовой акцент плакатной карточки курса (ограниченный набор системы). */
export type CourseAccent = "wood" | "ember" | "ink" | "pine";

/** Откуда кабинет берёт видео урока. */
export type VideoProvider = "none" | "kinescope" | "vk" | "rutube" | "youtube" | "file";

export interface VideoSource {
  provider: VideoProvider;
  /** ID ролика у провайдера либо путь/URL файла для provider: "file". */
  ref: string;
  /** Кадр-заставка (необязательно). */
  poster?: string;
  /** Длительность для подписи, например «12:40». */
  duration?: string;
}

export interface LessonMaterial {
  label: string;
  url: string;
}

/** Урок = «этап» программы курса. */
export interface Lesson {
  id: string;
  title: string;
  /** Короткое описание под плеером. */
  summary?: string;
  video?: VideoSource;
  materials?: LessonMaterial[];
  /** Урок открыт без покупки (превью). */
  free?: boolean;
}

/** Модуль программы курса. */
export interface CourseModule {
  id: string;
  title: string;
  summary?: string;
  lessons: Lesson[];
}

export interface CourseTariff {
  id: string;
  name: string;
  price: number;
  popular?: boolean;
  features: string[];
}

export interface Teacher {
  id: string;
  name: string;
  role: string;
  bio: string;
  photo: string;
  links: { label: string; url: string }[];
}

/** Папка портфолио — группирует проекты в разделы. */
export interface PortfolioFolder {
  id: string;
  slug: string;
  title: string;
  description?: string;
  cover?: string;
  order: number;
}

export interface Project {
  slug: string;
  title: string;
  category: Direction;
  /** Папка портфолио; пусто — проект показывается только в общем списке. */
  folderId?: string;
  year: number;
  client: string;
  services: string[];
  poster: string;
  description: string[];
  link?: string;
  demo?: boolean;
  order?: number;
}

export interface Course {
  slug: string;
  stream: string;
  title: string;
  short: string;
  direction: Direction;
  accent: CourseAccent;
  /** ISO-дата старта потока. */
  startDate: string;
  weeks: number;
  /** Цена минимального тарифа — показывается в афише. */
  price: number;
  format: string;
  seats: number;
  poster: string;
  program: CourseModule[];
  audience: string[];
  outcomes: string[];
  tariffs: CourseTariff[];
  teacherIds: string[];
  /** Курс доступен в личном кабинете. */
  published?: boolean;
  order?: number;
}

/**
 * Доступ ученика в кабинет для статического режима (без бэкенда).
 * Хранится ТОЛЬКО хеш кода — сам код админ выдаёт ученику лично.
 */
export interface StudentAccess {
  id: string;
  label: string;
  /** SHA-256 от кода доступа в нижнем регистре, hex. */
  codeHash: string;
  courseSlugs: string[];
  /** ISO-дата, после которой доступ не работает. Пусто — бессрочно. */
  expiresAt?: string;
  disabled?: boolean;
}

export interface ContentSettings {
  /** Заголовок кабинета. */
  cabinetTitle: string;
  /** Показывать демо-вход в кабинет (без кода). */
  cabinetDemoLogin: boolean;
  /** Сколько дней держать сессию ученика. */
  studentSessionDays: number;
}

export interface ContentPack {
  /** Версия схемы — растёт при несовместимых изменениях. */
  version: number;
  updatedAt: string;
  courses: Course[];
  projects: Project[];
  portfolioFolders: PortfolioFolder[];
  teachers: Teacher[];
  studentAccess: StudentAccess[];
  settings: ContentSettings;
}
