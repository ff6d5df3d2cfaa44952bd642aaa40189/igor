import { CatalogItem } from '@/lib/types';
import { CatalogCard } from './CatalogCard';

export function CatalogGrid({ items }: { items: CatalogItem[] }) {
  if (!items.length) {
    return <p className="glass-card p-5 text-sm text-slate-600">Ничего не найдено по выбранным фильтрам. Измените параметры поиска.</p>;
  }

  return (
    <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <CatalogCard key={`${item.slugChat}-${item.chatLink}`} item={item} />
      ))}
    </section>
  );
}
