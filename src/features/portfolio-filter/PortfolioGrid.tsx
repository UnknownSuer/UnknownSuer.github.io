"use client";

import { useMemo, useState } from "react";
import type { PortfolioFolder, Project } from "@/entities/project/types";
import { ProjectCard } from "@/entities/project/ProjectCard";
import { DIRECTION_FILTERS, type Direction } from "@/shared/config/directions";
import { cn } from "@/shared/lib/cn";

/**
 * Грид портфолио: папки (разделы) + фильтр по направлению.
 * Папки задаются в админке — там же работы к ним привязываются.
 */
export function PortfolioGrid({
  projects,
  folders,
}: {
  projects: Project[];
  folders: PortfolioFolder[];
}) {
  const [folderId, setFolderId] = useState<string | "all">("all");
  const [direction, setDirection] = useState<Direction | "all">("all");

  const activeFolder = folders.find((folder) => folder.id === folderId);

  const visible = useMemo(
    () =>
      projects.filter(
        (project) =>
          (folderId === "all" || project.folderId === folderId) &&
          (direction === "all" || project.category === direction),
      ),
    [projects, folderId, direction],
  );

  return (
    <div>
      {folders.length > 0 && (
        <div
          role="group"
          aria-label="Папки портфолио"
          className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
        >
          <FilterChip
            active={folderId === "all"}
            onClick={() => setFolderId("all")}
            variant="folder"
          >
            Все работы
          </FilterChip>
          {folders.map((folder) => (
            <FilterChip
              key={folder.id}
              active={folderId === folder.id}
              onClick={() => setFolderId(folder.id)}
              variant="folder"
            >
              {folder.title}
            </FilterChip>
          ))}
        </div>
      )}

      {activeFolder?.description && (
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          {activeFolder.description}
        </p>
      )}

      <div
        role="group"
        aria-label="Фильтр по направлению"
        className="mt-4 flex flex-wrap items-center gap-2"
      >
        {DIRECTION_FILTERS.map((filter) => (
          <FilterChip
            key={filter.value}
            active={direction === filter.value}
            onClick={() => setDirection(filter.value)}
          >
            {filter.label}
          </FilterChip>
        ))}
        <span className="ml-auto hidden font-mono text-xs text-muted sm:inline">
          {visible.length} / {projects.length}
        </span>
      </div>

      {visible.length > 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-xl border border-dashed border-ink/20 p-8 text-center md:p-12">
          <p className="font-mono text-sm uppercase tracking-[0.15em] text-muted">
            Здесь пока пусто
          </p>
          <p className="mt-2 text-sm text-muted">
            Попробуйте другой раздел или снимите фильтр по направлению.
          </p>
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
  variant = "direction",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  variant?: "direction" | "folder";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 transition duration-150",
        variant === "folder"
          ? "text-sm font-medium"
          : "font-mono text-xs uppercase tracking-[0.12em]",
        active
          ? "border-ink bg-ink text-white"
          : "border-ink/20 text-ink/70 hover:border-ink/50 hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
