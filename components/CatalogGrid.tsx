'use client';

import { useMemo, useState } from 'react';
import { CatalogItem } from '@/lib/types';
import { CatalogCard } from './CatalogCard';

const PAGE_SIZE = 9;

export function CatalogGrid({ items, searchable = false }: { items: CatalogItem[]; searchable?: boolean }) {
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items;

    return items.filter((item) => {
      const source = `${item.chatName} ${item.developer} ${item.region} ${item.cityCluster} ${item.district}`.toLowerCase();
      return source.includes(normalized);
    });
  }, [items, query]);

  const visibleItems = filtered.slice(0, visible);

  const onSearchChange = (value: string) => {
    setQuery(value);
    setVisible(PAGE_SIZE);
  };

  if (!items.length) {
    return <p className="glass-card p-5 text-sm text-slate-600">Ничего не найдено по выбранным фильтрам. Измените параметры поиска.</p>;
  }

  return (
    <section className="space-y-4">
      {searchable ? (
        <div className="glass-card p-4">
          <label className="text-sm font-medium text-slate-700" htmlFor="catalog-search">
            Поиск по чатам и ЖК
          </label>
          <input
            id="catalog-search"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
            placeholder="Например: Самолёт, Мытищи, ЖК Символ"
            value={query}
            onChange={(event) => onSearchChange(event.target.value)}
          />
          <p className="mt-2 text-xs text-slate-500">Найдено: {filtered.length}</p>
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {visibleItems.map((item) => (
          <CatalogCard key={`${item.slugChat}-${item.chatLink}`} item={item} />
        ))}
      </div>

      {visible < filtered.length ? (
        <div className="flex justify-center">
          <button className="btn-primary" type="button" onClick={() => setVisible((prev) => prev + PAGE_SIZE)}>
            Посмотреть больше
          </button>
        </div>
      ) : null}

      {!visibleItems.length ? <p className="glass-card p-5 text-sm text-slate-600">По вашему запросу ничего не найдено.</p> : null}
    </section>
  );
}
