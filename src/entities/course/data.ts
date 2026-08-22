/**
 * Курсы берутся из контент-пака (src/content/content.json), который правится
 * через админку /admin. Модуль оставлен как точка импорта для страниц.
 */
export {
  getCourse,
  getCourses,
  getPublishedCourses,
  getCourseTeachers,
  getNearestCourse,
  flattenLessons,
} from "@/shared/content";
