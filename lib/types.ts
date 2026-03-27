export type RawCatalogItem = {
  'Группа каталога': string;
  'Тип локации': string;
  'Регион': string;
  'Город / кластер': string;
  'АО Москвы': string | null;
  'Район / локация': string;
  'ЖК': string;
  'Застройщик': string;
  'Ссылка на чат': string;
  'Ссылка исходная': string | null;
  'Листы-источники': string | null;
  'Строки-источники': string | null;
  'Тип списка': string | null;
  'Уверенность': string | null;
  'Комментарий': string | null;
  slug_chat: string;
  slug_group: string;
  slug_region: string;
  slug_city_cluster: string;
  slug_district: string;
  price_placement?: number;
  reach?: number;
  chat_activity?: string;
  ad_format?: string;
};

export type CatalogItem = {
  catalogGroup: string;
  locationType: string;
  region: string;
  cityCluster: string;
  moscowArea: string;
  district: string;
  chatName: string;
  developer: string;
  chatLink: string;
  sourceLink: string;
  slugChat: string;
  slugGroup: string;
  slugRegion: string;
  slugCityCluster: string;
  slugDistrict: string;
  future: {
    pricePlacement?: number;
    reach?: number;
    chatActivity?: string;
    adFormat?: string;
  };
};

export type CatalogFilters = {
  region?: string;
  cityCluster?: string;
  moscowArea?: string;
  district?: string;
  developer?: string;
};

export type LeadPayload = {
  name: string;
  phone: string;
  telegram: string;
  company: string;
  businessType: string;
  comment: string;
  chat_name: string;
  chat_link: string;
  catalog_group: string;
  region: string;
  city_cluster: string;
  district: string;
};
