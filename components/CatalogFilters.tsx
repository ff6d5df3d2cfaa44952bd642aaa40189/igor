'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { CatalogItem } from '@/lib/types';
import { slugify } from '@/lib/catalog';

type Option = { label: string; value: string };

type OptionGroups = {
  regions: Option[];
  cityClusters: Option[];
  moscowAreas: Option[];
  districts: Option[];
  developers: Option[];
};

type ParamKey = 'region' | 'city' | 'ao' | 'district' | 'developer';

const ALL_KEYS: ParamKey[] = ['region', 'city', 'ao', 'district', 'developer'];

const getItemValueByParam = (item: CatalogItem, key: ParamKey): string => {
  if (key === 'region') return item.slugRegion;
  if (key === 'city') return item.slugCityCluster;
  if (key === 'ao') return slugify(item.moscowArea);
  if (key === 'district') return item.slugDistrict;
  return slugify(item.developer);
};

export function CatalogFilters({ options, items }: { options: OptionGroups; items: CatalogItem[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [query, setQuery] = useState(params.get('q') ?? '');

  useEffect(() => {
    setQuery(params.get('q') ?? '');
  }, [params]);

  const selected = {
    region: params.get('region') ?? '',
    city: params.get('city') ?? '',
    ao: params.get('ao') ?? '',
    district: params.get('district') ?? '',
    developer: params.get('developer') ?? '',
  };

  const availableByParam = useMemo(() => {
    const computeAvailable = (target: ParamKey) => {
      const activeWithoutTarget = ALL_KEYS.filter((key) => key !== target).filter((key) => selected[key]);

      const filteredItems = items.filter((item) =>
        activeWithoutTarget.every((key) => getItemValueByParam(item, key) === selected[key]),
      );

      return new Set(filteredItems.map((item) => getItemValueByParam(item, target)).filter(Boolean));
    };

    return {
      region: computeAvailable('region'),
      city: computeAvailable('city'),
      ao: computeAvailable('ao'),
      district: computeAvailable('district'),
      developer: computeAvailable('developer'),
    };
  }, [items, selected.ao, selected.city, selected.developer, selected.district, selected.region]);

  const setParam = (key: ParamKey, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);

    // Если пользователь работает с фильтрами — снимаем текстовый поиск
    next.delete('q');

    // Автоочистка конфликтующих выбранных параметров
    ALL_KEYS.forEach((paramKey) => {
      const activeValue = next.get(paramKey);
      if (!activeValue) return;

      const isAvailable = availableByParam[paramKey].has(activeValue);
      if (!isAvailable) next.delete(paramKey);
    });

    router.push(`${pathname}?${next.toString()}`);
  };

  const onSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = new URLSearchParams(params.toString());

    const normalizedQuery = query.trim();
    if (normalizedQuery) next.set('q', normalizedQuery);
    else next.delete('q');

    // Поиск по названию работает отдельно от фильтров
    ALL_KEYS.forEach((key) => next.delete(key));

    router.push(`${pathname}?${next.toString()}`);
  };

  const onReset = () => {
    setQuery('');
    router.push(pathname);
  };

  const renderSelect = (label: string, param: ParamKey, values: Option[]) => {
    const availableValues = availableByParam[param];
    const prepared = values.filter((value) => availableValues.has(value.value));

    return (
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <select
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
          value={params.get(param) ?? ''}
          onChange={(event) => setParam(param, event.target.value)}
        >
          <option value="">Все</option>
          {prepared.map((value) => (
            <option key={value.value} value={value.value}>
              {value.label}
            </option>
          ))}
        </select>
        <span className="text-xs text-slate-500">Доступно: {prepared.length}</span>
      </label>
    );
  };

  return (
    <section className="glass-card space-y-4 p-4">
      <form className="grid gap-3 md:grid-cols-[1fr_auto_auto]" onSubmit={onSearchSubmit}>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">Поиск по названию чата / ЖК</span>
          <input
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
            placeholder="Например: ЖК Яуза Парк"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <button className="btn-primary self-end" type="submit">
          Поиск
        </button>
        <button className="btn-outline self-end" type="button" onClick={onReset}>
          Сбросить фильтры
        </button>
      </form>

      <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-5">
        {renderSelect('Регион', 'region', options.regions)}
        {renderSelect('Город / кластер', 'city', options.cityClusters)}
        {renderSelect('АО Москвы', 'ao', options.moscowAreas)}
        {renderSelect('Район / локация', 'district', options.districts)}
        {renderSelect('Застройщик', 'developer', options.developers)}
      </div>
    </section>
  );
}
