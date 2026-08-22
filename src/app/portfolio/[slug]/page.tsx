import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, getProjects } from "@/entities/project/data";
import { DIRECTION_LABELS } from "@/shared/config/directions";
import { Container } from "@/shared/ui/Container";
import { ButtonLink } from "@/shared/ui/Button";
import { Chip } from "@/shared/ui/Chip";
import { withBasePath } from "@/shared/lib/base-path";

export function generateStaticParams() {
  return getProjects().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: `${project.title} — портфолио`,
    description: project.description[0],
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <Container className="py-10 md:py-14">
      <nav aria-label="Хлебные крошки">
        <Link
          href="/portfolio"
          className="font-mono text-xs uppercase tracking-[0.2em] text-muted transition duration-150 hover:text-ink"
        >
          ← Все работы
        </Link>
      </nav>

      <div className="mt-6 overflow-hidden rounded-2xl bg-tile">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={withBasePath(project.poster)}
          alt={project.title}
          className="aspect-[16/9] w-full object-cover"
        />
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-bold uppercase leading-tight tracking-tight text-ink md:text-5xl">
            {project.title}
          </h1>
          {project.demo && (
            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
              Демо-кейс для вёрстки — будет заменён реальной работой
            </p>
          )}
          <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-ink/80">
            {project.description.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          {project.link && (
            <ButtonLink
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              variant="outline"
              className="mt-8"
            >
              Смотреть на Behance ↗
            </ButtonLink>
          )}
        </div>

        <aside className="h-fit rounded-xl border border-ink/10 p-6">
          <dl className="space-y-5">
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                Год
              </dt>
              <dd className="mt-1 font-mono text-sm text-ink">{project.year}</dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                Категория
              </dt>
              <dd className="mt-1 text-sm font-medium text-ink">
                {DIRECTION_LABELS[project.category]}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                Клиент
              </dt>
              <dd className="mt-1 text-sm font-medium text-ink">{project.client}</dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                Услуги
              </dt>
              <dd className="mt-2 flex flex-wrap gap-1.5">
                {project.services.map((service) => (
                  <Chip key={service}>{service}</Chip>
                ))}
              </dd>
            </div>
          </dl>
        </aside>
      </div>

      <div className="mt-16 rounded-2xl bg-warm p-8 text-center md:p-10">
        <p className="font-display text-lg font-semibold uppercase tracking-tight text-ink md:text-xl">
          Хотите похожий проект?
        </p>
        <ButtonLink href="/contacts#brief" className="mt-5">
          Обсудить задачу
        </ButtonLink>
      </div>
    </Container>
  );
}
