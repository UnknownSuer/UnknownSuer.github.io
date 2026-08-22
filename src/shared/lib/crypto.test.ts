import { describe, expect, test } from "vitest";
import { normalizeAccessCode, sha256Hex, timingSafeEqual } from "@/shared/lib/crypto";

describe("sha256Hex", () => {
  test("совпадает с эталонным значением SHA-256", async () => {
    // Контрольная сумма пустой строки — фиксированная величина стандарта.
    await expect(sha256Hex("")).resolves.toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    );
    await expect(sha256Hex("abc")).resolves.toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
  });

  test("кириллица кодируется как UTF-8", async () => {
    const hash = await sha256Hex("пароль");
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("normalizeAccessCode", () => {
  test("регистр и пробелы не мешают ученику войти", () => {
    expect(normalizeAccessCode("  ANGAR-7F3K-9X2M ")).toBe("angar-7f3k-9x2m");
    expect(normalizeAccessCode("angar 7f3k 9x2m")).toBe("angar7f3k9x2m");
  });
});

describe("timingSafeEqual", () => {
  test("равные строки совпадают, разные — нет", () => {
    expect(timingSafeEqual("a".repeat(64), "a".repeat(64))).toBe(true);
    expect(timingSafeEqual("a".repeat(64), "b".repeat(64))).toBe(false);
  });

  test("разная длина не совпадает", () => {
    expect(timingSafeEqual("abc", "abcd")).toBe(false);
  });
});
