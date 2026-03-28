import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';

export const metadata: Metadata = {
  metadataBase: new URL('https://example.com'),
  title: 'Реклама в Telegram-чатах ЖК — каталог и размещение',
  description:
    'Размещение рекламы в Telegram-чатах жилых комплексов по регионам, городам и районам. Подбор площадок, медиаплан и заявка на размещение.',
  keywords: [
    'реклама в telegram',
    'реклама в чатах жк',
    'telegram чаты новостроек',
    'размещение рекламы жк',
    'купить рекламу в telegram',
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <header className="border-b border-slate-200/80 bg-white">
          <div className="container-page py-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-white px-4 py-3 shadow-sm">
              <Link className="text-sm font-bold tracking-wide text-slate-900 md:text-base" href="/">
                Telegram Ads • ЖК Catalog
              </Link>
              <nav className="flex flex-wrap items-center gap-2 text-sm">
                <Link className="btn-outline !px-4 !py-2" href="/">
                  Главная
                </Link>
                <Link className="btn-outline !px-4 !py-2" href="/catalog">
                  Каталог
                </Link>
                <Link className="btn-outline !px-4 !py-2" href="/#benefits">
                  Преимущества
                </Link>
                <Link className="btn-outline !px-4 !py-2" href="/#regions">
                  Регионы
                </Link>
                <Link className="btn-primary !px-4 !py-2" href="/catalog">
                  Купить рекламу
                </Link>
              </nav>
            </div>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
