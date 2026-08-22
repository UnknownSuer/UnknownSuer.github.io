import Link from "next/link";
import type { Project } from "@/entities/project/types";
import { DIRECTION_LABELS } from "@/shared/config/directions";
import { withBasePath } from "@/shared/lib/base-path";

/** Тёмная медиа-карточка проекта — «10% тёмного» даёт сам контент. */
export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/portfolio/${project.slug}`}
      className="group relative block overflow-hidden rounded-xl bg-tile ring-1 ring-ink/10 transition duration-150 hover:-translate-y-1 hover:shadow-lift"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={withBasePath(project.poster)}
        alt={project.title}
        loading="lazy"
        decoding="async"
        className="aspect-[4/3] w-full object-cover transition duration-150 group-hover:scale-[1.03]"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent p-4 pt-14">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="font-display text-sm font-medium uppercase leading-snug tracking-tight text-white">
              {project.title}
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/60">
              {DIRECTION_LABELS[project.category]} · {project.year}
            </p>
          </div>
          <span
            aria-hidden="true"
            className="font-mono text-sm text-white/70 transition duration-150 group-hover:translate-x-1 group-hover:text-white"
          >
            →
          </span>
        </div>
      </div>
    </Link>
  );
}
