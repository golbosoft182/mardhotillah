import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/api";

// NO_INDEX=true → blokir semua mesin pencari (staging / situs privat).
const noIndex = process.env.NO_INDEX === "true";

export default function robots(): MetadataRoute.Robots {
  if (noIndex) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
