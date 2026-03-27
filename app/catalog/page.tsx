import { CatalogFilters } from '@/components/CatalogFilters';
import { CatalogGrid } from '@/components/CatalogGrid';
import { filterCatalog, getCatalog, getFilterOptions, slugify } from '@/lib/catalog';

export const metadata = {
  title: 'Купить рекламу в Telegram-чатах ЖК — полный каталог',
  description:
    'Каталог Telegram-чатов жилых комплексов для размещения рекламы. Фильтры по региону, городу, району, АО Москвы и застройщику.',
};

type SearchParams = {
  region?: string;
  city?: string;
  ao?: string;
  district?: string;
  developer?: string;
};

export default async function CatalogPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const options = getFilterOptions();

  const filtered = filterCatalog({
    region: params.region,
    cityCluster: params.city,
    moscowArea: params.ao,
    district: params.district,
    developer: params.developer,
  });

  const valuesToOptions = (values: string[]) => values.map((value) => ({ label: value, value: slugify(value) }));

  return (
    <main className="container-page space-y-5">
      <section className="glass-card p-6 md:p-8">
        <h1 className="section-title">Каталог площадок: реклама в Telegram-чатах ЖК</h1>
        <p className="section-subtitle">
          Выберите регион, район и застройщика, чтобы быстро найти нужные чаты жилых комплексов и оставить заявку на размещение рекламы.
        </p>
      </section>

      <CatalogFilters
        options={{
          regions: valuesToOptions(options.regions),
          cityClusters: valuesToOptions(options.cityClusters),
          moscowAreas: valuesToOptions(options.moscowAreas),
          districts: valuesToOptions(options.districts),
          developers: valuesToOptions(options.developers),
        }}
      />
      <p className="text-sm text-slate-600">Всего в выдаче: {filtered.length} из {getCatalog().length}</p>
      <CatalogGrid items={filtered} />
    </main>
  );
}
