'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type Option = { label: string; value: string };

type OptionGroups = {
  regions: Option[];
  cityClusters: Option[];
  moscowAreas: Option[];
  districts: Option[];
  developers: Option[];
};

export function CatalogFilters({ options }: { options: OptionGroups }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`${pathname}?${next.toString()}`);
  };

  const renderSelect = (label: string, param: string, values: Option[]) => (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <select
        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
        value={params.get(param) ?? ''}
        onChange={(event) => setParam(param, event.target.value)}
      >
        <option value="">Все</option>
        {values.map((value) => (
          <option key={value.value} value={value.value}>
            {value.label}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <section className="glass-card grid gap-3 p-4 md:grid-cols-3 lg:grid-cols-5">
      {renderSelect('Регион', 'region', options.regions)}
      {renderSelect('Город / кластер', 'city', options.cityClusters)}
      {renderSelect('АО Москвы', 'ao', options.moscowAreas)}
      {renderSelect('Район / локация', 'district', options.districts)}
      {renderSelect('Застройщик', 'developer', options.developers)}
    </section>
  );
}
