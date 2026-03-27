import { CatalogFilters } from '@/components/CatalogFilters';
import { CatalogGrid } from '@/components/CatalogGrid';
import { filterCatalog, getCatalog, getFilterOptions, slugify } from '@/lib/catalog';

export const metadata = {
  title: 'Каталог ЖК и Telegram-чатов',
  description: 'Полный каталог ЖК с фильтрами по региону, городу, АО, району и застройщику.',
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
    <main className="container-page space-y-4">
      <h1 className="text-2xl font-bold">Каталог всех ЖК</h1>
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
