import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { LeadForm } from '@/components/LeadForm';
import { getBySlug, getCatalog, slugify } from '@/lib/catalog';

const filterHref = (key: string, value: string) => `/catalog?${key}=${encodeURIComponent(value)}`;

export function generateStaticParams() {
  return getCatalog()
    .map((item) => item.slugChat)
    .filter(Boolean)
    .map((chatSlug) => ({ chatSlug }));
}

export async function generateMetadata({ params }: { params: Promise<{ chatSlug: string }> }): Promise<Metadata> {
  const { chatSlug } = await params;
  const item = getBySlug('chat', chatSlug)[0];

  if (!item) {
    return { title: 'ЖК не найден' };
  }

  return {
    title: `${item.chatName} — Telegram-чат ЖК`,
    description: `Карточка ЖК ${item.chatName}: регион ${item.region}, застройщик ${item.developer}.`,
  };
}

export default async function ChatPage({ params }: { params: Promise<{ chatSlug: string }> }) {
  const { chatSlug } = await params;
  const item = getBySlug('chat', chatSlug)[0];

  if (!item) notFound();

  return (
    <main className="container-page">
      <article className="rounded-lg border bg-white p-6">
        <h1 className="text-3xl font-bold">{item.chatName}</h1>
        <div className="mt-4 grid gap-2 text-sm md:grid-cols-2">
          <p>
            Застройщик:{' '}
            <Link className="text-blue-700 underline" href={filterHref('developer', slugify(item.developer))}>
              {item.developer}
            </Link>
          </p>
          <p>
            Регион:{' '}
            <Link className="text-blue-700 underline" href={filterHref('region', item.slugRegion)}>
              {item.region}
            </Link>
          </p>
          <p>
            Город / кластер:{' '}
            <Link className="text-blue-700 underline" href={filterHref('city', item.slugCityCluster)}>
              {item.cityCluster}
            </Link>
          </p>
          <p>
            АО Москвы:{' '}
            {item.moscowArea ? (
              <Link className="text-blue-700 underline" href={filterHref('ao', slugify(item.moscowArea))}>
                {item.moscowArea}
              </Link>
            ) : (
              '—'
            )}
          </p>
          <p>
            Район / локация:{' '}
            <Link className="text-blue-700 underline" href={filterHref('district', item.slugDistrict)}>
              {item.district}
            </Link>
          </p>
          <p>
            Чат:{' '}
            <a className="text-blue-700 underline" href={item.chatLink} target="_blank" rel="noreferrer">
              Открыть в Telegram
            </a>
          </p>
        </div>

        {(item.future.pricePlacement || item.future.reach || item.future.chatActivity || item.future.adFormat) ? (
          <section className="mt-6 rounded border p-4">
            <h2 className="font-semibold">Будущие метрики</h2>
            <ul className="mt-2 list-disc pl-5 text-sm">
              {item.future.pricePlacement ? <li>Цена размещения: {item.future.pricePlacement}</li> : null}
              {item.future.reach ? <li>Охват: {item.future.reach}</li> : null}
              {item.future.chatActivity ? <li>Активность чата: {item.future.chatActivity}</li> : null}
              {item.future.adFormat ? <li>Формат рекламы: {item.future.adFormat}</li> : null}
            </ul>
          </section>
        ) : null}

        <LeadForm
          hidden={{
            chat_name: item.chatName,
            chat_link: item.chatLink,
            catalog_group: item.catalogGroup,
            region: item.region,
            city_cluster: item.cityCluster,
            district: item.district,
          }}
        />
      </article>
    </main>
  );
}
