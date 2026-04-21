'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { CatalogFilters } from '@/components/CatalogFilters';
import { CatalogGrid } from '@/components/CatalogGrid';
import { filterCatalog, getCatalog, getFilterOptions, slugify } from '@/lib/catalog';

const options = getFilterOptions();
const allItems = getCatalog();

export function CatalogPageClient() {
  const params = useSearchParams();

  const filtered = useMemo(() => {
    return filterCatalog({
      region: params.get('region') ?? undefined,
      cityCluster: params.get('city') ?? undefined,
      moscowArea: params.get('ao') ?? undefined,
      district: params.get('district') ?? undefined,
      developer: params.get('developer') ?? undefined,
    });
  }, [params]);

  const valuesToOptions = (values: string[]) => values.map((value) => ({ label: value, value: slugify(value) }));

  return (
    <>
      <CatalogFilters
        options={{
          regions: valuesToOptions(options.regions),
          cityClusters: valuesToOptions(options.cityClusters),
          moscowAreas: valuesToOptions(options.moscowAreas),
          districts: valuesToOptions(options.districts),
          developers: valuesToOptions(options.developers),
        }}
      />
      <p className="text-sm text-slate-600">Всего в выдаче: {filtered.length} из {allItems.length}</p>
      <CatalogGrid items={filtered} />
    </>
  );
}
