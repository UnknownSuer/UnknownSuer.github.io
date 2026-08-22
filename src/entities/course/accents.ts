import type { CourseAccent } from "@/entities/course/types";

/** Классы оформления плакатной карточки/баннера курса по акценту. */
export const COURSE_ACCENTS: Record<
  CourseAccent,
  {
    bg: string;
    text: string;
    sub: string;
    chip: string;
    rule: string;
    price: string;
  }
> = {
  wood: {
    bg: "bg-wood",
    text: "text-ink",
    sub: "text-ink/70",
    chip: "border-ink/30 text-ink/80",
    rule: "bg-ink/15",
    price: "text-ink",
  },
  ember: {
    bg: "bg-ember",
    text: "text-white",
    sub: "text-white/85",
    chip: "border-white/50 text-white",
    rule: "bg-white/30",
    price: "text-white",
  },
  ink: {
    bg: "bg-ink",
    text: "text-white",
    sub: "text-white/70",
    chip: "border-white/30 text-white/90",
    rule: "bg-white/20",
    price: "text-wood",
  },
  pine: {
    bg: "bg-pine",
    text: "text-white",
    sub: "text-white/75",
    chip: "border-white/35 text-white/90",
    rule: "bg-white/20",
    price: "text-wood",
  },
};
