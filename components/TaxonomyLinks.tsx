import Link from 'next/link';
import { getCatalog, slugify } from '@/lib/catalog';

type ItemLink = { label: string; href: string };

const uniqueLinks = (items: ItemLink[]) => {
  const map = new Map<string, string>();
  items.forEach((item) => {
    if (!item.label || !item.href) return;
    if (!map.has(item.href)) map.set(item.href, item.label);
  });
  return [...map.entries()]
    .map(([href, label]) => ({ href, label }))
    .sort((a, b) => a.label.localeCompare(b.label, 'ru'));
};

export function TaxonomyLinks() {
  const data = getCatalog();

  const regions = uniqueLinks(data.map((i) => ({ label: i.region, href: `/region/${i.slugRegion}` })));
  const cities = uniqueLinks(data.map((i) => ({ label: i.cityCluster, href: `/city/${i.slugCityCluster}` })));
  const districts = uniqueLinks(data.map((i) => ({ label: i.district, href: `/district/${i.slugDistrict}` })));
  const aos = uniqueLinks(data.map((i) => ({ label: i.moscowArea, href: `/moscow-ao/${slugify(i.moscowArea)}` })));

  const listCls =
    'grid gap-2 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-2 lg:grid-cols-3 [&_a]:rounded-lg [&_a]:px-2 [&_a]:py-1 [&_a]:text-sm [&_a]:text-slate-700 [&_a]:transition hover:[&_a]:bg-blue-50 hover:[&_a]:text-blue-700';

  return (
    <section className="space-y-4">
      <div>
        <h2 className="mb-2 text-xl font-semibold">Регионы</h2>
        <div className={listCls}>
          {regions.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
      <div>
        <h2 className="mb-2 text-xl font-semibold">Города / кластеры</h2>
        <div className={listCls}>
          {cities.slice(0, 30).map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
      <div>
        <h2 className="mb-2 text-xl font-semibold">АО Москвы</h2>
        <div className={listCls}>
          {aos.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
      <div>
        <h2 className="mb-2 text-xl font-semibold">Районы / локации</h2>
        <div className={listCls}>
          {districts.slice(0, 30).map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
