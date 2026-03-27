import Link from 'next/link';
import { CatalogItem } from '@/lib/types';

export function CatalogCard({ item }: { item: CatalogItem }) {
  return (
    <article className="rounded-lg border bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold">{item.chatName}</h3>
      <p className="mt-1 text-sm text-slate-600">Застройщик: {item.developer}</p>
      <div className="mt-3 space-y-1 text-sm">
        <p>Регион: {item.region}</p>
        <p>Город / кластер: {item.cityCluster}</p>
        {item.moscowArea ? <p>АО Москвы: {item.moscowArea}</p> : null}
        <p>Район / локация: {item.district}</p>
      </div>
      <div className="mt-4 flex items-center gap-4 text-sm">
        <a className="text-blue-700 underline" href={item.chatLink} target="_blank" rel="noreferrer">Telegram-чат</a>
        <Link className="rounded bg-slate-900 px-3 py-1.5 text-white" href={`/chat/${item.slugChat}`}>Карточка ЖК</Link>
      </div>
    </article>
  );
}
