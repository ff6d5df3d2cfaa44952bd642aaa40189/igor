import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SeoListPage } from '@/components/SeoListPage';
import { getBySlug, getCatalog } from '@/lib/catalog';

export function generateStaticParams() {
  return [...new Set(getCatalog().map((item) => item.slugDistrict).filter(Boolean))].map((districtSlug) => ({ districtSlug }));
}

export async function generateMetadata({ params }: { params: Promise<{ districtSlug: string }> }): Promise<Metadata> {
  const { districtSlug } = await params;
  const first = getBySlug('district', districtSlug)[0];
  const name = first?.district ?? districtSlug;
  return {
    title: `Telegram-чаты ЖК в районе ${name}`,
    description: `Каталог Telegram-чатов ЖК по району/локации ${name}.`,
  };
}

export default async function DistrictPage({ params }: { params: Promise<{ districtSlug: string }> }) {
  const { districtSlug } = await params;
  const items = getBySlug('district', districtSlug);
  if (!items.length) notFound();
  const name = items[0]?.district ?? districtSlug;

  return <SeoListPage title={`Район / локация: ${name}`} description="Индексируемая страница района/локации." items={items} />;
}
