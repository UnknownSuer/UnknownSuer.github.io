import type { Metadata } from "next";
import { Container } from "@/shared/ui/Container";
import { ButtonLink } from "@/shared/ui/Button";
import { PortfolioGrid } from "@/features/portfolio-filter/PortfolioGrid";
import { getPortfolioFolders, getProjects } from "@/entities/project/data";
import { pluralizeRu } from "@/shared/lib/format";

export const metadata: Metadata = {
  title: "Портфолио",
  description:
    "Работы студии АНГАР: VFX, CGI/3D и UGC-кейсы. Симуляции, продуктовые ролики, FOOH и нативный контент для брендов.",
};

export default function PortfolioPage() {
  const projects = getProjects();
  const folders = getPortfolioFolders();

  return (
    <Container className="py-12 md:py-16">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <h1 className="font-display text-[clamp(1.75rem,8vw,3.75rem)] font-bold uppercase leading-none tracking-tight text-ink [overflow-wrap:anywhere]">
          Работы
        </h1>
        <p className="font-mono text-sm text-muted">
          {projects.length}{" "}
          {pluralizeRu(projects.length, ["проект", "проекта", "проектов"])}
        </p>
      </div>

      <div className="mt-10">
        <PortfolioGrid projects={projects} folders={folders} />
      </div>

      <section className="mt-16 flex flex-col items-start justify-between gap-6 rounded-2xl bg-ink p-6 text-white sm:p-8 md:mt-24 md:flex-row md:items-center md:p-12">
        <div>
          <h2 className="font-display text-2xl font-semibold uppercase leading-tight tracking-tight md:text-3xl">
            Нужен VFX или CGI для проекта?
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/65">
            Заполните бриф — вернёмся в течение рабочего дня с вилкой по срокам
            и бюджету.
          </p>
        </div>
        <ButtonLink href="/contacts#brief" size="lg" className="shrink-0">
          Заполнить бриф
        </ButtonLink>
      </section>
    </Container>
  );
}
