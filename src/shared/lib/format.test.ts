import { describe, expect, it } from "vitest";
import {
  formatDateFull,
  formatDateShort,
  formatPrice,
  pluralizeRu,
  weeksLabel,
} from "@/shared/lib/format";

const NBSP = " ";

describe("formatPrice", () => {
  it("группирует тысячи неразрывными пробелами", () => {
    expect(formatPrice(24900)).toBe(`24${NBSP}900${NBSP}₽`);
    expect(formatPrice(1250000)).toBe(`1${NBSP}250${NBSP}000${NBSP}₽`);
  });

  it("не трогает суммы до тысячи", () => {
    expect(formatPrice(900)).toBe(`900${NBSP}₽`);
  });
});

describe("formatDate", () => {
  it("короткий формат для афиши", () => {
    expect(formatDateShort("2026-09-12")).toBe("12.09");
  });

  it("полный формат для страницы курса", () => {
    expect(formatDateFull("2026-10-03")).toBe("03.10.2026");
  });
});

describe("pluralizeRu", () => {
  const forms: [string, string, string] = ["неделя", "недели", "недель"];

  it.each([
    [1, "неделя"],
    [2, "недели"],
    [4, "недели"],
    [5, "недель"],
    [11, "недель"],
    [12, "недель"],
    [21, "неделя"],
    [22, "недели"],
    [100, "недель"],
  ])("%i → %s", (n, expected) => {
    expect(pluralizeRu(n, forms)).toBe(expected);
  });
});

describe("weeksLabel", () => {
  it("склеивает число и форму неразрывным пробелом", () => {
    expect(weeksLabel(6)).toBe(`6${NBSP}недель`);
    expect(weeksLabel(4)).toBe(`4${NBSP}недели`);
  });
});
