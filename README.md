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

## Требования к окружению

- Node.js `>= 18.18.0` (рекомендуется Node `20`, см. `.nvmrc`)
- npm `>= 9`

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



## Безопасность

- Next.js обновлен до `15.5.14` для закрытия уязвимостей, включая CVE-2025-66478, из-за которых Vercel может блокировать деплой.

## Деплой на Vercel

В репозитории добавлен `vercel.json` с `framework: "nextjs"` и `outputDirectory: ".next"`, чтобы Vercel не ожидал папку `public` как output-directory.

Если в настройках проекта Vercel ранее был вручную указан `Output Directory = public`, поменяйте на `.next` или верните `Auto`.


## Если "не запускается"

1. Проверьте версию Node.js: `node -v` (должна быть не ниже `18.18.0`).
2. Переустановите зависимости: `rm -rf node_modules package-lock.json && npm install`.
3. Выполните проверки: `npm run typecheck && npm run build`.
4. Для локального старта: `npm run dev`, для прод-режима: `npm run build && npm run start`.

## Структура проекта

- `app/` — страницы и API
- `components/` — UI-компоненты
- `lib/` — типы, данные, интеграции
- `data/leads.json` — локальное хранилище заявок (MVP)
- `catalog_chats_site_ready.json` — исходный каталог
