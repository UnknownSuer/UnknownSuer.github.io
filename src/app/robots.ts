import type { MetadataRoute } from "next";
import { SITE } from "@/shared/config/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Кабинет и панель управления не для поиска.
      disallow: ["/api/", "/cabinet", "/admin"],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
