import { CatalogFilters } from '@/components/CatalogFilters';
import { CatalogGrid } from '@/components/CatalogGrid';
import { getCatalog, getFilterOptions, filterCatalog } from '@/lib/catalog';

export const metadata = {
  title: 'Купить рекламу в Telegram-чатах ЖК — полный каталог',
  description:
    'Каталог Telegram-чатов жилых комплексов для размещения рекламы. Фильтры по региону, городу, району, АО Москвы и застройщику.',
};

type SearchParams = {
  q?: string;
  region?: string;
  city?: string;
  ao?: string;
  district?: string;
  developer?: string;
};

export default async function CatalogPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const options = getFilterOptions();
  const allItems = getCatalog();

  const normalizedQuery = (params.q ?? '').trim().toLowerCase();

  const filtered = normalizedQuery
    ? allItems.filter((item) => item.chatName.toLowerCase().includes(normalizedQuery))
    : filterCatalog({
        region: params.region,
        cityCluster: params.city,
        moscowArea: params.ao,
        district: params.district,
        developer: params.developer,
      });

  return (
    <main className="container-page space-y-5">
      <section className="glass-card p-6 md:p-8">
        <h1 className="section-title">Каталог площадок: реклама в Telegram-чатах ЖК</h1>
        <p className="section-subtitle">
          Выберите фильтры для точного подбора или используйте поиск по названию чата/ЖК. Поиск работает отдельно и отключает фильтры.
        </p>
      </section>

      <CatalogFilters
        items={allItems}
        options={{
          regions: options.regions,
          cityClusters: options.cityClusters,
          moscowAreas: options.moscowAreas,
          districts: options.districts,
          developers: options.developers,
        }}
      />
      <p className="text-sm text-slate-600">Всего в выдаче: {filtered.length} из {allItems.length}</p>
      <CatalogGrid items={filtered} />
    </main>
  );
}
