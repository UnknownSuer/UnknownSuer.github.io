import { describe, expect, test } from "vitest";
import { buildEmbedUrl, buildFileUrl, hasVideo } from "@/shared/ui/video-source";

const source = (provider: string, ref: string) =>
  ({ provider, ref }) as Parameters<typeof buildEmbedUrl>[0];

describe("buildEmbedUrl", () => {
  test("Kinescope: из ID собирается embed-ссылка", () => {
    expect(buildEmbedUrl(source("kinescope", "abc123"))).toBe(
      "https://kinescope.io/embed/abc123",
    );
  });

  test("Kinescope: готовая ссылка остаётся как есть", () => {
    const url = "https://kinescope.io/embed/zzz?autoplay=0";
    expect(buildEmbedUrl(source("kinescope", url))).toBe(url);
  });

  test("YouTube: используется домен без cookie", () => {
    expect(buildEmbedUrl(source("youtube", "dQw4w9WgXcQ"))).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1",
    );
  });

  test("Rutube: из ID собирается embed-ссылка", () => {
    expect(buildEmbedUrl(source("rutube", "9f8e7d"))).toBe(
      "https://rutube.ru/play/embed/9f8e7d",
    );
  });

  test("VK: формат video-oid_id разбирается на параметры", () => {
    expect(buildEmbedUrl(source("vk", "video-12345_67890"))).toBe(
      "https://vk.com/video_ext.php?oid=-12345&id=67890&hd=2",
    );
  });

  test("VK: непонятный ref не даёт битую ссылку", () => {
    expect(buildEmbedUrl(source("vk", "просто текст"))).toBeNull();
  });

  test("пустой ref не даёт ссылку ни у одного провайдера", () => {
    for (const provider of ["kinescope", "vk", "rutube", "youtube", "file", "none"]) {
      expect(buildEmbedUrl(source(provider, "   ")), provider).toBeNull();
    }
  });

  test("file и none не встраиваются через iframe", () => {
    expect(buildEmbedUrl(source("file", "/media/x.mp4"))).toBeNull();
    expect(buildEmbedUrl(source("none", "что-то"))).toBeNull();
  });

  test("ID экранируется — «/» из ID не ломает путь", () => {
    expect(buildEmbedUrl(source("kinescope", "a/b"))).toBe(
      "https://kinescope.io/embed/a%2Fb",
    );
  });
});

describe("buildFileUrl", () => {
  test("локальный путь остаётся корневым (basePath пуст в тестах)", () => {
    expect(buildFileUrl("/media/lessons/01.mp4")).toBe("/media/lessons/01.mp4");
  });

  test("внешняя ссылка не трогается", () => {
    expect(buildFileUrl("https://cdn.example.com/01.mp4")).toBe(
      "https://cdn.example.com/01.mp4",
    );
  });

  test("пустая ссылка — null", () => {
    expect(buildFileUrl("  ")).toBeNull();
  });
});

describe("hasVideo", () => {
  test("видео считается подключённым только при провайдере и ref", () => {
    expect(hasVideo(undefined)).toBe(false);
    expect(hasVideo(source("none", ""))).toBe(false);
    expect(hasVideo(source("kinescope", ""))).toBe(false);
    expect(hasVideo(source("kinescope", " "))).toBe(false);
    expect(hasVideo(source("kinescope", "abc"))).toBe(true);
  });
});
