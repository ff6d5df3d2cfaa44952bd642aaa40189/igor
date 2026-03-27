import { CatalogItem } from '@/lib/types';
import { CatalogCard } from './CatalogCard';

export function CatalogGrid({ items }: { items: CatalogItem[] }) {
  if (!items.length) {
    return <p className="rounded border bg-white p-4">Ничего не найдено по выбранным фильтрам.</p>;
  }

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <CatalogCard key={`${item.slugChat}-${item.chatLink}`} item={item} />
      ))}
    </section>
  );
}
