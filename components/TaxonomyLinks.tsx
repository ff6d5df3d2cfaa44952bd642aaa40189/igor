import Link from 'next/link';
import { getCatalog, slugify } from '@/lib/catalog';

export function TaxonomyLinks() {
  const data = getCatalog();
  const unique = (arr: string[]) => [...new Set(arr.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'ru'));

  const regions = unique(data.map((i) => i.region));
  const cities = unique(data.map((i) => i.cityCluster));
  const districts = unique(data.map((i) => i.district));
  const aos = unique(data.map((i) => i.moscowArea));

  const listCls =
    'grid gap-2 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-2 lg:grid-cols-3 [&_a]:rounded-lg [&_a]:px-2 [&_a]:py-1 [&_a]:text-sm [&_a]:text-slate-700 [&_a]:transition hover:[&_a]:bg-blue-50 hover:[&_a]:text-blue-700';

  return (
    <section className="space-y-4">
      <div>
        <h2 className="mb-2 text-xl font-semibold">Регионы</h2>
        <div className={listCls}>
          {regions.map((value) => (
            <Link key={value} href={`/region/${slugify(value)}`}>
              {value}
            </Link>
          ))}
        </div>
      </div>
      <div>
        <h2 className="mb-2 text-xl font-semibold">Города / кластеры</h2>
        <div className={listCls}>
          {cities.slice(0, 30).map((value) => (
            <Link key={value} href={`/city/${slugify(value)}`}>
              {value}
            </Link>
          ))}
        </div>
      </div>
      <div>
        <h2 className="mb-2 text-xl font-semibold">АО Москвы</h2>
        <div className={listCls}>
          {aos.map((value) => (
            <Link key={value} href={`/moscow-ao/${slugify(value)}`}>
              {value}
            </Link>
          ))}
        </div>
      </div>
      <div>
        <h2 className="mb-2 text-xl font-semibold">Районы / локации</h2>
        <div className={listCls}>
          {districts.slice(0, 30).map((value) => (
            <Link key={value} href={`/district/${slugify(value)}`}>
              {value}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
