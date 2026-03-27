import { Metadata } from 'next';
import { SeoListPage } from '@/components/SeoListPage';
import { getBySlug, getCatalog } from '@/lib/catalog';

export function generateStaticParams() {
  return [...new Set(getCatalog().map((item) => item.slugRegion).filter(Boolean))].map((regionSlug) => ({ regionSlug }));
}

export async function generateMetadata({ params }: { params: Promise<{ regionSlug: string }> }): Promise<Metadata> {
  const { regionSlug } = await params;
  const first = getBySlug('region', regionSlug)[0];
  const regionName = first?.region ?? regionSlug;

  return {
    title: `Telegram-чаты ЖК в регионе ${regionName}`,
    description: `Каталог Telegram-чатов ЖК по региону ${regionName}.`,
  };
}

export default async function RegionPage({ params }: { params: Promise<{ regionSlug: string }> }) {
  const { regionSlug } = await params;
  const items = getBySlug('region', regionSlug);
  const regionName = items[0]?.region ?? regionSlug;

  return <SeoListPage title={`Регион: ${regionName}`} description="Индексируемая региональная страница каталога." items={items} />;
}
