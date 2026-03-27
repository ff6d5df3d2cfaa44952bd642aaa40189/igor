import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Каталог Telegram-чатов ЖК',
  description: 'Каталог чатов жилых комплексов для размещения рекламы.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <header className="border-b bg-white">
          <div className="container-page flex items-center justify-between py-4">
            <Link className="font-semibold" href="/">Telegram-каталог ЖК</Link>
            <nav className="flex gap-4 text-sm">
              <Link href="/catalog">Каталог</Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
