"use client";

import { useState } from "react";
import type { ContentPack, PortfolioFolder, Project } from "@/shared/content/types";
import {
  Area,
  Card,
  Grid,
  IconButton,
  MiniButton,
  MoveButtons,
  Num,
  Section,
  Select,
  StringList,
  Text,
  Toggle,
  makeId,
  move,
} from "@/features/admin/ui";
import { cn } from "@/shared/lib/cn";

type Update = (updater: (pack: ContentPack) => ContentPack) => void;

const DIRECTIONS = [
  { value: "vfx" as const, label: "VFX" },
  { value: "cgi" as const, label: "CGI / 3D" },
  { value: "ugc" as const, label: "UGC" },
];

export function PortfolioPanel({ pack, update }: { pack: ContentPack; update: Update }) {
  const [activeSlug, setActiveSlug] = useState(pack.projects[0]?.slug ?? "");
  const project = pack.projects.find((item) => item.slug === activeSlug) ?? pack.projects[0];

  const setFolders = (folders: PortfolioFolder[]) =>
    update((current) => ({ ...current, portfolioFolders: folders }));

  const patchProject = (patch: Partial<Project>) => {
    if (!project) return;
    update((current) => ({
      ...current,
      projects: current.projects.map((item) =>
        item.slug === project.slug ? { ...item, ...patch } : item,
      ),
    }));
    if (patch.slug) setActiveSlug(patch.slug);
  };

  const addProject = () => {
    const slug = makeId("project");
    const created: Project = {
      slug,
      title: "Новый проект",
      category: "cgi",
      folderId: pack.portfolioFolders[0]?.id,
      year: new Date().getFullYear(),
      client: "",
      services: [],
      poster: "/media/posters/p01.svg",
      description: [""],
      order: pack.projects.length + 1,
    };
    update((current) => ({ ...current, projects: [...current.projects, created] }));
    setActiveSlug(slug);
  };

  const folderOptions = [
    { value: "", label: "— без папки —" },
    ...pack.portfolioFolders.map((folder) => ({ value: folder.id, label: folder.title })),
  ];

  return (
    <div className="space-y-4">
      <Section
        title="Папки портфолио"
        hint="Папки группируют работы на странице «Портфолио» — например «CGI-ролики» или «UGC для брендов»."
        action={
          <MiniButton
            tone="accent"
            onClick={() => {
              const id = makeId("folder");
              setFolders([
                ...pack.portfolioFolders,
                {
                  id,
                  slug: id,
                  title: "Новая папка",
                  order: pack.portfolioFolders.length + 1,
                },
              ]);
            }}
          >
            + папка
          </MiniButton>
        }
      >
        <div className="space-y-2">
          {pack.portfolioFolders.length === 0 && (
            <p className="text-sm text-muted">
              Папок нет — работы показываются одним списком с фильтром по направлению.
            </p>
          )}
          {pack.portfolioFolders.map((folder, index) => {
            const used = pack.projects.filter((p) => p.folderId === folder.id).length;
            return (
              <Card key={folder.id}>
                <div className="flex flex-wrap items-center gap-1.5">
                  <input
                    value={folder.title}
                    onChange={(event) =>
                      setFolders(
                        pack.portfolioFolders.map((item, i) =>
                          i === index ? { ...item, title: event.target.value } : item,
                        ),
                      )
                    }
                    className="min-w-0 flex-1 rounded-md border border-ink/15 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-ink/50"
                  />
                  <span className="font-mono text-[10px] text-muted">{used} работ</span>
                  <MoveButtons
                    index={index}
                    total={pack.portfolioFolders.length}
                    onMove={(from, to) =>
                      setFolders(
                        move(pack.portfolioFolders, from, to).map((item, i) => ({
                          ...item,
                          order: i + 1,
                        })),
                      )
                    }
                  />
                  <IconButton
                    title="Удалить папку"
                    onClick={() => {
                      if (
                        !window.confirm(
                          used > 0
                            ? `В папке ${used} работ. Удалить папку? Работы останутся, но без папки.`
                            : "Удалить папку?",
                        )
                      )
                        return;
                      update((current) => ({
                        ...current,
                        portfolioFolders: current.portfolioFolders.filter((_, i) => i !== index),
                        projects: current.projects.map((p) =>
                          p.folderId === folder.id ? { ...p, folderId: undefined } : p,
                        ),
                      }));
                    }}
                  >
                    ✕
                  </IconButton>
                </div>
                <div className="mt-2">
                  <Grid cols={2}>
                    <Text
                      label="Адрес папки (slug)"
                      value={folder.slug}
                      mono
                      onChange={(v) =>
                        setFolders(
                          pack.portfolioFolders.map((item, i) =>
                            i === index
                              ? { ...item, slug: v.toLowerCase().replace(/[^a-z0-9-]/g, "-") }
                              : item,
                          ),
                        )
                      }
                    />
                    <Text
                      label="Обложка (необязательно)"
                      value={folder.cover ?? ""}
                      mono
                      onChange={(v) =>
                        setFolders(
                          pack.portfolioFolders.map((item, i) =>
                            i === index ? { ...item, cover: v || undefined } : item,
                          ),
                        )
                      }
                    />
                  </Grid>
                  <div className="mt-2">
                    <Area
                      label="Описание папки"
                      rows={2}
                      value={folder.description ?? ""}
                      onChange={(v) =>
                        setFolders(
                          pack.portfolioFolders.map((item, i) =>
                            i === index ? { ...item, description: v || undefined } : item,
                          ),
                        )
                      }
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Section>

      <Section
        title="Работы"
        hint="Выберите работу, чтобы отредактировать её карточку и страницу."
        action={<MiniButton tone="accent" onClick={addProject}>+ работа</MiniButton>}
      >
        <div className="flex flex-wrap gap-2">
          {pack.projects.map((item, index) => (
            <div key={item.slug} className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveSlug(item.slug)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs transition",
                  item.slug === project?.slug
                    ? "border-ink bg-ink text-white"
                    : "border-ink/20 text-ink/70 hover:border-ink/50 hover:text-ink",
                )}
              >
                {item.title}
                {item.demo && " · демо"}
              </button>
              <MoveButtons
                index={index}
                total={pack.projects.length}
                onMove={(from, to) =>
                  update((current) => ({
                    ...current,
                    projects: move(current.projects, from, to).map((p, i) => ({
                      ...p,
                      order: i + 1,
                    })),
                  }))
                }
              />
            </div>
          ))}
          {pack.projects.length === 0 && (
            <p className="text-sm text-muted">Работ пока нет — добавьте первую.</p>
          )}
        </div>
      </Section>

      {project && (
        <Section
          title={`Работа · ${project.title}`}
          action={
            <MiniButton
              tone="danger"
              onClick={() => {
                if (!window.confirm("Удалить работу из портфолио?")) return;
                update((current) => ({
                  ...current,
                  projects: current.projects.filter((item) => item.slug !== project.slug),
                }));
                setActiveSlug(pack.projects.find((p) => p.slug !== project.slug)?.slug ?? "");
              }}
            >
              удалить работу
            </MiniButton>
          }
        >
          <div className="space-y-3">
            <Grid cols={2}>
              <Text label="Название" value={project.title} onChange={(v) => patchProject({ title: v })} />
              <Text
                label="Адрес страницы (slug)"
                value={project.slug}
                mono
                onChange={(v) => patchProject({ slug: v.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
              />
            </Grid>
            <Grid cols={4}>
              <Select
                label="Направление"
                value={project.category}
                options={DIRECTIONS}
                onChange={(v) => patchProject({ category: v })}
              />
              <Select
                label="Папка"
                value={project.folderId ?? ""}
                options={folderOptions}
                onChange={(v) => patchProject({ folderId: v || undefined })}
              />
              <Num label="Год" value={project.year} min={2000} onChange={(v) => patchProject({ year: v })} />
              <Text label="Клиент" value={project.client} onChange={(v) => patchProject({ client: v })} />
            </Grid>
            <Grid cols={2}>
              <Text
                label="Постер"
                value={project.poster}
                mono
                hint="Путь внутри public, например /media/posters/p03.svg"
                onChange={(v) => patchProject({ poster: v })}
              />
              <Text
                label="Внешняя ссылка (Behance и т.п.)"
                value={project.link ?? ""}
                mono
                onChange={(v) => patchProject({ link: v || undefined })}
              />
            </Grid>
            <StringList
              label="Услуги"
              items={project.services}
              placeholder="Например: композитинг"
              onChange={(services) => patchProject({ services })}
            />
            <StringList
              label="Описание (абзацы)"
              items={project.description}
              placeholder="Абзац описания кейса"
              onChange={(description) => patchProject({ description })}
            />
            <Toggle
              label="Демо-кейс (плашка «будет заменён реальной работой»)"
              checked={Boolean(project.demo)}
              onChange={(demo) => patchProject({ demo: demo || undefined })}
            />
          </div>
        </Section>
      )}
    </div>
  );
}
