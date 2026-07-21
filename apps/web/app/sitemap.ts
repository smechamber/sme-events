import type { MetadataRoute } from "next";
import { demoEvents } from "../lib/events";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://events.company.com";

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1
    },
    ...demoEvents.map((event) => ({
      url: `${baseUrl}/events/${event.id}`,
      lastModified: new Date(event.startDate ?? Date.now()),
      changeFrequency: "weekly" as const,
      priority: 0.8
    }))
  ];
}
