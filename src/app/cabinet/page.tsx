import type { Metadata } from "next";
import { getContent } from "@/shared/content";
import { StudentCabinet } from "@/features/student-cabinet/StudentCabinet";

export const metadata: Metadata = {
  title: "Личный кабинет",
  description:
    "Личный кабинет участника курса АНГАР: видеоуроки, программа курса и материалы.",
  robots: { index: false, follow: false },
};

export default function CabinetPage() {
  // В сборку уходит контент из src/content/content.json; в браузере кабинет
  // поверх него подтягивает оверлей public/content/content.json, если он есть.
  return <StudentCabinet initialPack={getContent()} />;
}
