import type { MetadataRoute } from "next";
import { getSiteOrigin } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin/", "/api/", "/preview/", "/setup/"] },
    sitemap: `${getSiteOrigin()}/sitemap.xml`,
  };
}
