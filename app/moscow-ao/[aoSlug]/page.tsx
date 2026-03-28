import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SeoListPage } from '@/components/SeoListPage';
import { getByMoscowAreaSlug, getCatalog, slugify } from '@/lib/catalog';

export function generateStaticParams() {
  return [...new Set(getCatalog().map((item) => item.moscowArea).filter(Boolean))].map((ao) => ({ aoSlug: slugify(ao) }));
}

export async function generateMetadata({ params }: { params: Promise<{ aoSlug: string }> }): Promise<Metadata> {
  const { aoSlug } = await params;
  return {
    title: `Telegram-чаты ЖК в АО ${aoSlug.toUpperCase()}`,
    description: `Каталог Telegram-чатов ЖК по административному округу Москвы ${aoSlug.toUpperCase()}.`,
  };
}

export default async function MoscowAoPage({ params }: { params: Promise<{ aoSlug: string }> }) {
  const { aoSlug } = await params;
  const items = getByMoscowAreaSlug(aoSlug);
  if (!items.length) notFound();

  return <SeoListPage title={`АО Москвы: ${aoSlug.toUpperCase()}`} description="Индексируемая страница административного округа Москвы." items={items} />;
}
