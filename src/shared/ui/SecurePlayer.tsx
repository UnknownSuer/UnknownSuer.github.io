"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { VideoSource } from "@/shared/content/types";
import { withBasePath } from "@/shared/lib/base-path";
import { cn } from "@/shared/lib/cn";
import { buildEmbedUrl, buildFileUrl } from "@/shared/ui/video-source";

/**
 * Защищённый плеер уроков.
 *
 * Источник берётся из контент-пака (админка → «Видео урока»), поэтому плеер
 * сам подхватывает нужный ролик — руками ничего прописывать не надо.
 *
 * Единственная настоящая защита — провайдер. Kinescope, VK, Rutube и YouTube
 * отдают видео через свой iframe с подписанными/временными ссылками: прямого
 * файла на странице нет, и достать его из вёрстки нельзя. Для платного курса
 * нужен именно такой провайдер, лучше Kinescope с DRM.
 *
 * Остальное — заслон от случайного скачивания, не от целенаправленного:
 *  • src у <video> не пишется в разметку, а назначается из JS после
 *    монтирования — «сохранить как» по исходнику страницы не сработает;
 *  • отключены нативное скачивание, PiP, кастовое воспроизведение,
 *    контекстное меню и перетаскивание;
 *  • поверх кадра — именной вотермарк: у утёкшей записи видно владельца.
 *
 * Прямо и без иллюзий: при provider: "file" путь к ролику всё равно лежит в
 * контент-паке, который на статическом хостинге публичен, а экран пользователь
 * запишет при любом провайдере. «file» годится для бесплатных превью, для
 * оплаченных уроков — нет.
 */

export interface SecurePlayerProps {
  video?: VideoSource;
  /** Подпись-вотермарк поверх кадра: телефон/имя ученика. */
  watermark?: string;
  /** Заголовок урока для placeholder-состояния. */
  title?: string;
  className?: string;
}

const PROVIDER_LABEL: Record<VideoSource["provider"], string> = {
  none: "Видео не подключено",
  kinescope: "Kinescope",
  vk: "VK Видео",
  rutube: "Rutube",
  youtube: "YouTube",
  file: "Файл студии",
};

export function SecurePlayer({ video, watermark, title, className }: SecurePlayerProps) {
  const provider = video?.provider ?? "none";
  const embedUrl = useMemo(() => (video ? buildEmbedUrl(video) : null), [video]);
  const fileUrl = useMemo(
    () => (video?.provider === "file" ? buildFileUrl(video.ref) : null),
    [video],
  );

  return (
    <div
      className={cn("relative aspect-video w-full overflow-hidden bg-tile", className)}
      onContextMenu={(event) => event.preventDefault()}
    >
      {embedUrl ? (
        <iframe
          key={embedUrl}
          src={embedUrl}
          title={title ?? "Видео урока"}
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : fileUrl ? (
        <ProtectedFileVideo src={fileUrl} poster={video?.poster} />
      ) : (
        <PlayerPlaceholder title={title} provider={provider} />
      )}

      {watermark && (embedUrl || fileUrl) && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-3 z-10 select-none rounded bg-black/35 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white/70 mix-blend-screen"
        >
          {watermark}
        </span>
      )}
    </div>
  );
}

/**
 * HTML5-видео с максимумом того, что браузер позволяет закрыть.
 * src назначается из JS: в исходнике страницы ссылки нет, в живом DOM — есть,
 * иначе воспроизведение невозможно.
 */
function ProtectedFileVideo({ src, poster }: { src: string; poster?: string }) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.src = src;
    return () => {
      video.removeAttribute("src");
      video.load();
    };
  }, [src]);

  // Ctrl/Cmd+S на странице с уроком — самый частый «наивный» способ сохранить.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (failed) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/50">
          Видео недоступно
        </p>
        <p className="max-w-sm text-xs leading-relaxed text-white/60">
          Файл урока не загрузился. Обновите страницу или напишите куратору.
        </p>
      </div>
    );
  }

  return (
    <video
      ref={ref}
      controls
      playsInline
      preload="metadata"
      poster={poster ? withBasePath(poster) : undefined}
      controlsList="nodownload noplaybackrate noremoteplayback"
      disablePictureInPicture
      disableRemotePlayback
      onError={() => setFailed(true)}
      onContextMenu={(event) => event.preventDefault()}
      onDragStart={(event) => event.preventDefault()}
      className="absolute inset-0 h-full w-full bg-tile object-contain"
    />
  );
}

function PlayerPlaceholder({
  title,
  provider,
}: {
  title?: string;
  provider: VideoSource["provider"];
}) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
      <span className="flex size-14 items-center justify-center rounded-full border border-white/25 bg-white/10 text-xl backdrop-blur md:size-16 md:text-2xl">
        ▶
      </span>
      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.24em] text-white/55">
        {PROVIDER_LABEL[provider]}
      </p>
      {title && (
        <p className="mt-2 max-w-xl text-sm font-medium leading-snug text-white/80 md:text-base">
          {title}
        </p>
      )}
      <p className="mt-3 max-w-md text-xs leading-relaxed text-white/45">
        Урок появится здесь, как только видео будет привязано в админке.
      </p>
    </div>
  );
}
