import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    {
      url: "https://torchgeo.org/",
      lastModified,
      changeFrequency: "weekly",
      priority: 1.0,
    },
  ];
}
