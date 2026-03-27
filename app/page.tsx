import Link from 'next/link';
import { getCatalog } from '@/lib/catalog';
import { CatalogGrid } from '@/components/CatalogGrid';
import { TaxonomyLinks } from '@/components/TaxonomyLinks';

export default function HomePage() {
  const items = getCatalog().slice(0, 9);

  return (
    <main className="container-page space-y-6">
      <section className="rounded-lg border bg-white p-6">
        <h1 className="text-3xl font-bold">Каталог рекламы в Telegram-чатах ЖК</h1>
        <p className="mt-2 text-slate-700">650+ чатов жилых комплексов, с SEO-страницами по регионам, городам и локациям.</p>
        <div className="mt-4 flex gap-3">
          <Link className="rounded bg-slate-900 px-4 py-2 text-white" href="/catalog">Открыть каталог</Link>
        </div>
      </section>
      <section>
        <h2 className="mb-3 text-xl font-semibold">Популярные ЖК</h2>
        <CatalogGrid items={items} />
      </section>
      <TaxonomyLinks />
    </main>
  );
}
