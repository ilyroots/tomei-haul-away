import type { MetadataRoute } from "next";
import { SERVICES, SERVICE_AREA, slugifyCity } from "@/lib/business/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";

  const staticRoutes = [
    "/",
    "/services",
    "/pricing",
    "/service-areas",
    "/about",
    "/gallery",
    "/faq",
    "/contact",
    "/quote",
    "/schedule",
    "/privacy",
    "/terms",
  ];

  const serviceRoutes = SERVICES.map((service) => `/services/${service.slug}`);
  const cityRoutes = SERVICE_AREA.cities.map((city) => `/service-areas/${slugifyCity(city)}`);

  const allRoutes = [...staticRoutes, ...serviceRoutes, ...cityRoutes];

  return allRoutes.map((route) => ({
    url: `${appUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "/" ? "daily" : "weekly",
    priority: route === "/" ? 1 : 0.7,
  }));
}
