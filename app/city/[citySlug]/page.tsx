import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SeoListPage } from '@/components/SeoListPage';
import { getBySlug, getCatalog } from '@/lib/catalog';

export function generateStaticParams() {
  return [...new Set(getCatalog().map((item) => item.slugCityCluster).filter(Boolean))].map((citySlug) => ({ citySlug }));
}

export async function generateMetadata({ params }: { params: Promise<{ citySlug: string }> }): Promise<Metadata> {
  const { citySlug } = await params;
  const first = getBySlug('city', citySlug)[0];
  const name = first?.cityCluster ?? citySlug;
  return {
    title: `Telegram-чаты ЖК в ${name}`,
    description: `Каталог Telegram-чатов ЖК по городу/кластеру ${name}.`,
  };
}

export default async function CityPage({ params }: { params: Promise<{ citySlug: string }> }) {
  const { citySlug } = await params;
  const items = getBySlug('city', citySlug);
  if (!items.length) notFound();
  const name = items[0]?.cityCluster ?? citySlug;

  return <SeoListPage title={`Город / кластер: ${name}`} description="Индексируемая страница города или кластера." items={items} />;
}
