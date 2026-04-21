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
  - `/region/[regionSlug]/`
  - `/city/[citySlug]/`
  - `/moscow-ao/[aoSlug]/`
  - `/district/[districtSlug]/`
- Карточка отдельного ЖК: `/chat/[chatSlug]/`
- Форма заявки с сохранением в `data/leads.json` через PHP endpoint: `/api/leads.php`.
- SEO:
  - человекопонятные slug
  - meta title / description
  - `sitemap.xml`
  - `robots.txt`

## Данные

Источник: `catalog_chats_site_ready.json`.

Структура исходного файла **не меняется**. Нормализация выполняется на уровне приложения (`lib/catalog.ts`).

## Требования к окружению

- Node.js `>= 18.18.0` (рекомендуется Node `20`)
- npm `>= 9`

## Локальный запуск

```bash
npm install
npm run dev
```

Открыть: `http://localhost:3000`.

## Статическая сборка для shared hosting (REG.RU + ISPmanager)

Проект подготовлен под сценарий из панели файлового менеджера (как на скриншоте):

- сайт собирается в **статические HTML/CSS/JS**,
- форма заявок работает через `PHP` файл `/api/leads.php`,
- заявки складываются в `/data/leads.json`.

### 1) Собрать сайт локально

```bash
npm install
npm run build
```

После сборки будет папка `out/`.

### 2) Залить на REG.RU

В ISPmanager откройте корень домена, например:

`/www/ваш-домен/`

И загрузите **содержимое** папки `out/` (не саму папку, а файлы внутри):

- `index.html`
- `catalog/`, `chat/`, `region/`, ...
- `api/leads.php`
- `data/leads.json`
- остальные статические файлы

### 3) Права на запись для формы

Проверьте, что PHP может писать в `data/leads.json`:

- `data/` — минимум `755` (при необходимости `775`)
- `data/leads.json` — минимум `664`

Если заявка не отправляется — обычно причина именно в правах.

### 4) Проверка формы

Откройте карточку любого ЖК и отправьте тестовую заявку.

Проверьте, что запись появилась в `/data/leads.json`.

## Важно

- Этот вариант подходит для **обычного shared-хостинга** REG.RU, где нет постоянного Node.js процесса.
- Поэтому используется `next.config.ts` в режиме `output: 'export'` + PHP endpoint для формы.

## Проверка и сборка

```bash
npm run typecheck
npm run build
```

## Структура проекта

- `app/` — страницы
- `components/` — UI-компоненты
- `lib/` — типы и каталог
- `public/api/leads.php` — backend для формы на shared hosting
- `public/data/leads.json` — хранилище заявок в production на shared hosting
- `catalog_chats_site_ready.json` — исходный каталог
