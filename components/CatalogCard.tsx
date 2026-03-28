import Link from 'next/link';
import { CatalogItem } from '@/lib/types';
import { slugify } from '@/lib/catalog';

const filterHref = (key: string, value: string) => `/catalog?${key}=${encodeURIComponent(value)}`;

export function CatalogCard({ item }: { item: CatalogItem }) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_10px_25px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(37,99,235,0.2)]">
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-900 p-5 text-white">
        <p className="text-xs uppercase tracking-wider text-blue-200">Реклама в Telegram-чате ЖК</p>
        <h3 className="mt-2 line-clamp-2 text-lg font-semibold">{item.chatName}</h3>
      </div>

      <div className="space-y-3 p-5 text-sm">
        <p className="text-slate-600">
          Застройщик:{' '}
          <Link className="font-medium text-blue-700 hover:underline" href={filterHref('developer', slugify(item.developer))}>
            {item.developer}
          </Link>
        </p>
        <div className="grid gap-1.5 text-slate-700">
          <p>
            <span className="text-slate-500">Регион:</span>{' '}
            <Link className="text-blue-700 hover:underline" href={filterHref('region', item.slugRegion)}>
              {item.region}
            </Link>
          </p>
          <p>
            <span className="text-slate-500">Город / кластер:</span>{' '}
            <Link className="text-blue-700 hover:underline" href={filterHref('city', item.slugCityCluster)}>
              {item.cityCluster}
            </Link>
          </p>
          {item.moscowArea ? (
            <p>
              <span className="text-slate-500">АО Москвы:</span>{' '}
              <Link className="text-blue-700 hover:underline" href={filterHref('ao', slugify(item.moscowArea))}>
                {item.moscowArea}
              </Link>
            </p>
          ) : null}
          <p>
            <span className="text-slate-500">Район / локация:</span>{' '}
            <Link className="text-blue-700 hover:underline" href={filterHref('district', item.slugDistrict)}>
              {item.district}
            </Link>
          </p>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <a
            className="inline-flex items-center justify-center rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
            href={item.chatLink}
            target="_blank"
            rel="noreferrer"
          >
            Telegram-чат
          </a>
          <Link className="btn-primary !px-4 !py-2 !text-xs" href={`/chat/${item.slugChat}`}>
            Купить рекламу
          </Link>
        </div>
      </div>
    </article>
  );
}
