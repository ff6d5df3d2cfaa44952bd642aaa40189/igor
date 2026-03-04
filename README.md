# AuditNovostroy — документация сайта

Этот репозиторий содержит статический многостраничный сайт AuditNovostroy, клиентский JavaScript для форм/FAQ и утилиты для обновления каталога сданных ЖК.

## 1) Что внутри

- **Статика сайта**: HTML-страницы по разделам (`index.html`, `about/`, `cases/`, `experts/`, `legal/`, `situations/`, и т.д.).
- **Стили**: `styles.css` (единая визуальная система, адаптив, постерная стилистика).
- **Клиентский JS**: `script.js` (формы, FAQ-аккордеон, служебные UI-состояния).
- **Данные каталога ЖК**: `data/jk_catalog.json`.
- **Парсер каталога ЖК**: `tools/update_jk_catalog.py` + вспомогательные скрипты cron.

## 2) Быстрый старт (локально)

> Сайт статический, сборка не нужна.

```bash
cd /workspace/igor
python3 -m http.server 4173
```

Открыть в браузере:
- `http://127.0.0.1:4173/index.html`

## 3) Структура проекта

```text
.
├── index.html
├── styles.css
├── script.js
├── about/
├── booking/
├── cases/
├── contacts/
├── developers/
├── expertise/
├── experts/
├── faq/
├── guides/
├── jk/
├── legal/
├── pricing/
├── process/
├── situations/
├── assets/
├── data/
│   └── jk_catalog.json
└── tools/
    ├── update_jk_catalog.py
    ├── run_daily_update.sh
    ├── install_daily_cron.sh
    └── README-jk-parser.md
```

## 4) Ключевые страницы

- **Главная**: `index.html` — основной лендинг, формы, FAQ, CTA-блоки.
- **Каталог ЖК**: `jk/index.html` и автогенерируемые `jk/auto-*.html`.
- **Коммерческие/контентные разделы**: `pricing/`, `legal/`, `situations/`, `cases/`, `experts/`.

## 5) Как работают формы

Клиентская логика в `script.js`:

- отправка формы через `FormSubmit` AJAX endpoint;
- если авто-отправка недоступна — fallback на `mailto:`;
- базовая валидация (обязательный телефон);
- UI-состояния: disabled, loading, success/error-текст.

Текущий контактный email для fallback: `lisica.i.v@gmail.com`.

## 6) FAQ и интерактив

В `script.js` реализован простой аккордеон FAQ:
- клик по `.faq-q` переключает `.open` у родительского `.faq-item`.

## 7) Каталог ЖК: источник и обновления

Каталог заполняется через `tools/update_jk_catalog.py`.

Что делает скрипт:
- парсит `https://pronovostroy.ru/novostroyki-sdannye/`;
- обновляет `data/jk_catalog.json`;
- генерирует/обновляет страницы `jk/index.html` и `jk/auto-*.html`;
- при недоступности источника использует кэш и не ломает сайт.

Ручной запуск:

```bash
python3 tools/update_jk_catalog.py
```

Установка ежедневного cron-обновления:

```bash
bash tools/install_daily_cron.sh
```

Подробности: `tools/README-jk-parser.md`.

## 8) Контентные правки

### Обновить тексты/блоки
- править соответствующие `.html` страницы напрямую.

### Обновить дизайн
- править `styles.css`.

### Обновить поведение форм/FAQ
- править `script.js`.

## 9) Публикация

Сайт готов к деплою как статический (Nginx, Apache, S3/CloudFront, Netlify и т.п.).

Обязательные файлы для публикации:
- все HTML-страницы;
- `styles.css`, `script.js`;
- `assets/`;
- `data/jk_catalog.json`;
- автогенерируемые страницы `jk/auto-*.html`.

## 10) Ограничения и замечания

- Источник каталога ЖК может возвращать блокировки/403; в этом случае используется кэш.
- Отправка заявок зависит от доступности внешнего FormSubmit endpoint.
- Так как проект статический, серверной валидации/CRM-интеграции в этом репозитории нет.
