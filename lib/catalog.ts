import rawData from '@/catalog_chats_site_ready.json';
import { CatalogFilters, CatalogItem, RawCatalogItem } from './types';

const normalizedData: CatalogItem[] = (rawData as RawCatalogItem[]).map((item) => ({
  catalogGroup: item['Группа каталога'],
  locationType: item['Тип локации'],
  region: item['Регион'],
  cityCluster: item['Город / кластер'],
  moscowArea: item['АО Москвы'] ?? '',
  district: item['Район / локация'],
  chatName: item['ЖК'],
  developer: item['Застройщик'],
  chatLink: item['Ссылка на чат'],
  sourceLink: item['Ссылка исходная'] ?? '',
  slugChat: item.slug_chat,
  slugGroup: item.slug_group,
  slugRegion: item.slug_region,
  slugCityCluster: item.slug_city_cluster,
  slugDistrict: item.slug_district,
  future: {
    pricePlacement: item.price_placement,
    reach: item.reach,
    chatActivity: item.chat_activity,
    adFormat: item.ad_format,
  },
}));

type FilterOption = { label: string; value: string };

const buildOptions = (pairs: FilterOption[]) => {
  const map = new Map<string, string>();
  pairs.forEach((pair) => {
    if (!pair.label || !pair.value) return;
    if (!map.has(pair.value)) map.set(pair.value, pair.label);
  });

  return [...map.entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label, 'ru'));
};

export function getCatalog(): CatalogItem[] {
  return normalizedData;
}

export function getFilterOptions() {
  return {
    regions: buildOptions(normalizedData.map((i) => ({ label: i.region, value: i.slugRegion }))),
    cityClusters: buildOptions(normalizedData.map((i) => ({ label: i.cityCluster, value: i.slugCityCluster }))),
    moscowAreas: buildOptions(normalizedData.map((i) => ({ label: i.moscowArea, value: slugify(i.moscowArea) }))),
    districts: buildOptions(normalizedData.map((i) => ({ label: i.district, value: i.slugDistrict }))),
    developers: buildOptions(normalizedData.map((i) => ({ label: i.developer, value: slugify(i.developer) }))),
  };
}

export function filterCatalog(filters: CatalogFilters): CatalogItem[] {
  return normalizedData.filter((item) => {
    if (filters.region && item.slugRegion !== filters.region) return false;
    if (filters.cityCluster && item.slugCityCluster !== filters.cityCluster) return false;
    if (filters.moscowArea && slugify(item.moscowArea) !== filters.moscowArea) return false;
    if (filters.district && item.slugDistrict !== filters.district) return false;
    if (filters.developer && slugify(item.developer) !== filters.developer) return false;
    return true;
  });
}

export function getBySlug(type: 'chat' | 'region' | 'city' | 'district', slug: string): CatalogItem[] {
  if (type === 'chat') return normalizedData.filter((item) => item.slugChat === slug);
  if (type === 'region') return normalizedData.filter((item) => item.slugRegion === slug);
  if (type === 'city') return normalizedData.filter((item) => item.slugCityCluster === slug);
  return normalizedData.filter((item) => item.slugDistrict === slug);
}

export function getByMoscowAreaSlug(slug: string): CatalogItem[] {
  return normalizedData.filter((item) => slugify(item.moscowArea) === slug);
}

export function slugify(value: string | null | undefined): string {
  if (!value || typeof value !== 'string') return '';

  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zа-я0-9-]/gi, '')
    .replace(/-+/g, '-');
}
