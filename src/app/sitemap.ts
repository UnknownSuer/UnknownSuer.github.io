import type { MetadataRoute } from "next";
import { SITE, LEGAL_LINKS } from "@/shared/config/site";
import { getCourses } from "@/entities/course/data";
import { getProjects } from "@/entities/project/data";

export const dynamic = "force-static";

/** /cabinet и /admin в карту сайта намеренно не попадают. */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url;
  const staticPaths = [
    "",
    "/portfolio",
    "/courses",
    "/contacts",
    "/about",
    ...LEGAL_LINKS.map((l) => l.href),
  ];

  return [
    ...staticPaths.map((path) => ({ url: `${base}${path}` })),
    ...getCourses()
      .filter((course) => course.published !== false)
      .map((c) => ({ url: `${base}/courses/${c.slug}` })),
    ...getProjects().map((p) => ({ url: `${base}/portfolio/${p.slug}` })),
  ];
}
