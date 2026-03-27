# Fullsite-каталог Telegram-чатов ЖК

MVP-проект на **Next.js + TypeScript + Tailwind CSS** для продажи рекламы в Telegram-чатах жилых комплексов.

## Что реализовано

- Главная страница с переходом в каталог.
- Каталог всех ЖК с фильтрами:
  - регион
  - город / кластер
  - АО Москвы
  - район / локация
  - застройщик
- SEO-страницы:
  - `/region/[regionSlug]`
  - `/city/[citySlug]`
  - `/moscow-ao/[aoSlug]`
  - `/district/[districtSlug]`
- Карточка отдельного ЖК: `/chat/[chatSlug]`
- Форма заявки с сохранением в локальный JSON (`data/leads.json`) через API `/api/leads`.
- Точка интеграции для будущей отправки заявок в Telegram webhook и/или email (`lib/integrations.ts`).
- SEO:
  - человекопонятные slug
  - meta title / description
  - `sitemap.xml`
  - `robots.txt`

## Данные

Источник: `catalog_chats_site_ready.json`.

Структура исходного файла **не меняется**. Нормализация выполняется на уровне приложения (`lib/catalog.ts`).

## Будущее расширение

В типы заложены будущие поля:

- `price_placement` — цена размещения
- `reach` — охват
- `chat_activity` — активность чата
- `ad_format` — формат рекламы

## Запуск

```bash
npm install
npm run dev
```

Открыть: `http://localhost:3000`.

## Проверка и сборка

```bash
npm run typecheck
npm run build
```

## Структура проекта

- `app/` — страницы и API
- `components/` — UI-компоненты
- `lib/` — типы, данные, интеграции
- `data/leads.json` — локальное хранилище заявок (MVP)
- `catalog_chats_site_ready.json` — исходный каталог
