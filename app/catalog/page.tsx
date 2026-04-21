import { Suspense } from 'react';
import { CatalogPageClient } from '@/components/CatalogPageClient';

export const metadata = {
  title: 'Купить рекламу в Telegram-чатах ЖК — полный каталог',
  description:
    'Каталог Telegram-чатов жилых комплексов для размещения рекламы. Фильтры по региону, городу, району, АО Москвы и застройщику.',
};

export default function CatalogPage() {
  return (
    <main className="container-page space-y-5">
      <section className="glass-card p-6 md:p-8">
        <h1 className="section-title">Каталог площадок: реклама в Telegram-чатах ЖК</h1>
        <p className="section-subtitle">
          Выберите регион, район и застройщика, чтобы быстро найти нужные чаты жилых комплексов и оставить заявку на размещение рекламы.
        </p>
      </section>

      <Suspense fallback={<p className="text-sm text-slate-600">Загружаем каталог...</p>}>
        <CatalogPageClient />
      </Suspense>
    </main>
  );
}
