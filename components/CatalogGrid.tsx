'use client';

import { useState } from 'react';
import { CatalogItem } from '@/lib/types';
import { CatalogCard } from './CatalogCard';

const PAGE_SIZE = 9;

export function CatalogGrid({ items }: { items: CatalogItem[] }) {
  const [visible, setVisible] = useState(PAGE_SIZE);

  if (!items.length) {
    return <p className="glass-card p-5 text-sm text-slate-600">Ничего не найдено по выбранным условиям. Измените фильтры или поиск.</p>;
  }

  const visibleItems = items.slice(0, visible);

  return (
    <section className="space-y-4">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {visibleItems.map((item) => (
          <CatalogCard key={`${item.slugChat}-${item.chatLink}`} item={item} />
        ))}
      </div>

      {visible < items.length ? (
        <div className="flex justify-center">
          <button className="btn-primary" type="button" onClick={() => setVisible((prev) => prev + PAGE_SIZE)}>
            Посмотреть больше
          </button>
        </div>
      ) : null}
    </section>
  );
}
