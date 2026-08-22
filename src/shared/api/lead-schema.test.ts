import { describe, expect, it } from "vitest";
import { briefLeadSchema, courseLeadSchema, leadSchema } from "@/shared/api/lead-schema";

const validCourseLead = {
  type: "course" as const,
  courseSlug: "3d-printing",
  tariffId: "curator",
  name: "Иван",
  email: "ivan@example.ru",
  phone: "+79000000000",
  consent: true,
};

const validBriefLead = {
  type: "brief" as const,
  direction: "vfx" as const,
  message: "Нужен CGI-ролик продукта, референсы пришлю в телеграм",
  budget: "100-300" as const,
  name: "Мария",
  contact: "@maria",
  consent: true,
};

describe("courseLeadSchema", () => {
  it("принимает корректную заявку", () => {
    expect(courseLeadSchema.safeParse(validCourseLead).success).toBe(true);
  });

  it("отклоняет заявку без согласия на ПДн", () => {
    const result = courseLeadSchema.safeParse({ ...validCourseLead, consent: false });
    expect(result.success).toBe(false);
  });

  it("отклоняет кривой email", () => {
    const result = courseLeadSchema.safeParse({ ...validCourseLead, email: "не почта" });
    expect(result.success).toBe(false);
  });
});

describe("briefLeadSchema", () => {
  it("принимает корректный бриф", () => {
    expect(briefLeadSchema.safeParse(validBriefLead).success).toBe(true);
  });

  it("требует осмысленное описание проекта", () => {
    const result = briefLeadSchema.safeParse({ ...validBriefLead, message: "ролик" });
    expect(result.success).toBe(false);
  });
});

describe("leadSchema (discriminated union)", () => {
  it("различает типы заявок по полю type", () => {
    expect(leadSchema.safeParse(validCourseLead).success).toBe(true);
    expect(leadSchema.safeParse(validBriefLead).success).toBe(true);
    expect(leadSchema.safeParse({ type: "unknown" }).success).toBe(false);
  });
});
