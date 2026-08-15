import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { getPublishedEvents } from "@/lib/queries/events";
import { getPublicGroups } from "@/lib/queries/growth-groups";
import { getActiveSermonSeries } from "@/lib/queries/sermon-series";
import { getPublishedSermons } from "@/lib/queries/sermons";

const STATIC_ROUTES = [
  "",
  "/nosotros",
  "/predicas",
  "/grupos",
  "/grupos/unirme",
  "/eventos",
  "/contacto",
  "/oracion",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [sermons, series, groups, events] = await Promise.all([
    getPublishedSermons(),
    getActiveSermonSeries(),
    getPublicGroups(),
    getPublishedEvents(),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
  }));

  const sermonEntries: MetadataRoute.Sitemap = sermons.map((sermon) => ({
    url: `${SITE_URL}/predicas/${sermon.slug}`,
    lastModified: sermon.sermon_date ? new Date(sermon.sermon_date) : undefined,
  }));

  const seriesEntries: MetadataRoute.Sitemap = series.map((s) => ({
    url: `${SITE_URL}/series/${s.slug}`,
  }));

  const groupEntries: MetadataRoute.Sitemap = groups.map((group) => ({
    url: `${SITE_URL}/grupos/${group.slug}`,
  }));

  const eventEntries: MetadataRoute.Sitemap = events.map((event) => ({
    url: `${SITE_URL}/eventos/${event.slug}`,
    lastModified: event.eventDate ? new Date(event.eventDate) : undefined,
  }));

  return [...staticEntries, ...sermonEntries, ...seriesEntries, ...groupEntries, ...eventEntries];
}
