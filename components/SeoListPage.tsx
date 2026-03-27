import { CatalogGrid } from './CatalogGrid';
import { CatalogItem } from '@/lib/types';

export function SeoListPage({ title, description, items }: { title: string; description: string; items: CatalogItem[] }) {
  return (
    <main className="container-page space-y-4">
      <header>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-slate-700">{description}</p>
      </header>
      <CatalogGrid items={items} searchable />
    </main>
  );
}
