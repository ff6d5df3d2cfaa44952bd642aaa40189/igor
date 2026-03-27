import type { MetadataRoute } from 'next';
import { getCatalog, slugify } from '@/lib/catalog';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default function sitemap(): MetadataRoute.Sitemap {
  const data = getCatalog();
  const unique = (arr: string[]) => [...new Set(arr.filter(Boolean))];

  const urls: MetadataRoute.Sitemap = [
    '',
    '/catalog',
    ...unique(data.map((i) => `/chat/${i.slugChat}`)),
    ...unique(data.map((i) => `/region/${i.slugRegion}`)),
    ...unique(data.map((i) => `/city/${i.slugCityCluster}`)),
    ...unique(data.map((i) => `/district/${i.slugDistrict}`)),
    ...unique(data.map((i) => `/moscow-ao/${slugify(i.moscowArea)}`)),
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.7,
  }));

  return urls;
}
