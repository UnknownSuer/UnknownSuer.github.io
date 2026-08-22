import type { VideoSource } from "@/shared/content/types";
import { withBasePath } from "@/shared/lib/base-path";

/**
 * Построение ссылок для плеера. Вынесено из компонента, чтобы покрыть тестами:
 * ошибка здесь означает пустой урок у оплатившего человека.
 *
 * `ref` намеренно принимает и «голый» ID у провайдера, и полную ссылку —
 * владелец копирует из адресной строки то, что видит.
 */

export function buildEmbedUrl(video: VideoSource): string | null {
  const ref = video.ref.trim();
  if (!ref) return null;
  const isUrl = /^https?:\/\//i.test(ref);

  switch (video.provider) {
    case "kinescope":
      return isUrl ? ref : `https://kinescope.io/embed/${encodeURIComponent(ref)}`;
    case "rutube":
      return isUrl ? ref : `https://rutube.ru/play/embed/${encodeURIComponent(ref)}`;
    case "youtube":
      return isUrl
        ? ref
        : `https://www.youtube-nocookie.com/embed/${encodeURIComponent(ref)}?rel=0&modestbranding=1`;
    case "vk": {
      if (isUrl) return ref;
      // Формат «video-12345_67890» — ровно то, что показывает VK в ссылке.
      const match = ref.match(/^video(-?\d+)_(\d+)$/);
      if (!match) return null;
      return `https://vk.com/video_ext.php?oid=${match[1]}&id=${match[2]}&hd=2`;
    }
    default:
      return null;
  }
}

/** Прямая ссылка на файл: локальный путь получает basePath, внешний — нет. */
export function buildFileUrl(ref: string): string | null {
  const value = ref.trim();
  if (!value) return null;
  return /^https?:\/\//i.test(value) ? value : withBasePath(value);
}

/** Есть ли у урока реально подключённое видео. */
export function hasVideo(video?: VideoSource): boolean {
  return Boolean(video && video.provider !== "none" && video.ref.trim());
}
