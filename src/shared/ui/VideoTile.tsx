"use client";

import { useEffect, useRef } from "react";
import { withBasePath } from "@/shared/lib/base-path";

/**
 * Плитка видео-сетки хиро.
 *
 * Без `src` рендерит только постер (текущий MVP-режим).
 * С `src` (WebM/MP4-луп из public/media/loops/):
 *  - видео получает src лениво — только когда плитка близко к вьюпорту
 *    (IntersectionObserver, rootMargin 200px);
 *  - при выходе из вьюпорта ставится на паузу;
 *  - при prefers-reduced-motion автозапуск отключён — остаётся постер.
 */
export function VideoTile({
  poster,
  src,
  className,
}: {
  poster: string;
  src?: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video || !src) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (!video.src) video.src = withBasePath(src);
            void video.play().catch(() => {});
          } else {
            video.pause();
          }
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(video);
    return () => io.disconnect();
  }, [src]);

  if (!src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- SVG-постеры не требуют оптимизации next/image
      <img src={withBasePath(poster)} alt="" loading="lazy" decoding="async" className={className} />
    );
  }

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload="none"
      poster={withBasePath(poster)}
      className={className}
    />
  );
}
