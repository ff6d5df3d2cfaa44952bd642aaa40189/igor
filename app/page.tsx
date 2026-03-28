import type { Metadata } from 'next';
import Link from 'next/link';
import { getCatalog } from '@/lib/catalog';
import { CatalogGrid } from '@/components/CatalogGrid';
import { TaxonomyLinks } from '@/components/TaxonomyLinks';


export const metadata: Metadata = {
  title: 'Купить рекламу в Telegram-чатах ЖК — лендинг и каталог',
  description:
    'Продающий лендинг и каталог для размещения рекламы в Telegram-чатах жилых комплексов. Подбор площадок по регионам, районам и застройщикам.',
};

export default function HomePage() {
  const all = getCatalog();
  const items = all.slice(0, 6);
  const uniqueDevelopers = new Set(all.map((i) => i.developer)).size;
  const uniqueRegions = new Set(all.map((i) => i.region)).size;

  return (
    <main className="container-page space-y-10">
      <section className="glass-card overflow-hidden p-6 md:p-10">
        <div className="grid items-center gap-8 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="mb-3 inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              Платформа для рекламодателей в недвижимости
            </p>
            <h1 className="section-title md:text-5xl">
              Купить рекламу в <span className="text-blue-700">Telegram-чатах ЖК</span>
            </h1>
            <p className="section-subtitle text-base md:text-lg">
              Размещайте рекламу в активных чатах жилых комплексов: быстро подберем площадки по региону, району, застройщику и целевой
              аудитории.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link className="btn-primary" href="/catalog">
                Подобрать площадки
              </Link>
              <Link className="btn-outline" href="/catalog">
                Посмотреть весь каталог
              </Link>
            </div>
          </div>
          <div className="grid gap-3 rounded-3xl bg-slate-950 p-5 text-white">
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-200">Чатов в каталоге</p>
              <p className="mt-1 text-3xl font-bold">{all.length}+</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-200">Регионов</p>
              <p className="mt-1 text-3xl font-bold">{uniqueRegions}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-200">Застройщиков</p>
              <p className="mt-1 text-3xl font-bold">{uniqueDevelopers}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="benefits" className="glass-card p-6 md:p-8">
        <h2 className="section-title">Почему рекламу в Telegram-чатах ЖК выгодно покупать у нас</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            ['Точный гео-таргетинг', 'Подбор чатов по городу, кластеру, району и АО Москвы.'],
            ['Живая аудитория', 'Чаты жильцов и покупателей квартир с высокой вовлеченностью.'],
            ['Быстрый запуск', 'Оставляете заявку — получаете подборку площадок и старт кампании.'],
          ].map(([title, text]) => (
            <article key={title} className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm text-slate-600">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="section-title">Популярные площадки для размещения рекламы</h2>
            <p className="section-subtitle mt-2">Карточки оформлены в едином продающем стиле, как в лендинге.</p>
          </div>
          <Link className="btn-outline" href="/catalog">
            Все карточки
          </Link>
        </div>
        <CatalogGrid items={items} />
      </section>

      <section id="regions" className="glass-card p-6 md:p-8">
        <h2 className="section-title">SEO-каталог для покупки рекламы</h2>
        <p className="section-subtitle">
          Индексируемые страницы регионов, городов и районов помогают находить релевантные площадки через поиск. Это ускоряет выбор
          чатов под рекламную кампанию и снижает время запуска.
        </p>
        <div className="mt-6">
          <TaxonomyLinks />
        </div>
      </section>
    </main>
  );
}
