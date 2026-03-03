# JK parser (pronovostroy.ru)

Скрипт `tools/update_jk_catalog.py`:
- парсит доступные карточки ЖК с `https://pronovostroy.ru/`;
- извлекает название и базовые показатели (если найдены в HTML);
- обновляет `data/jk_catalog.json`;
- генерирует страницы `jk/auto-*.html`;
- обновляет индекс `jk/index.html`.

## Ручной запуск
```bash
python3 tools/update_jk_catalog.py
```

## Ежедневное обновление (cron)
```bash
bash tools/install_daily_cron.sh
```

Cron запускает `tools/run_daily_update.sh` раз в сутки в 03:00.
Логи пишутся в `data/jk_update.log`.

## Важно
Если источник временно недоступен, скрипт использует последний кэш из `data/jk_catalog.json`
и не ломает сайт.
