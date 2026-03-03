# JK parser (pronovostroy.ru/novostroyki-sdannye)

Скрипт `tools/update_jk_catalog.py`:
- парсит `https://pronovostroy.ru/novostroyki-sdannye/`;
- извлекает название ЖК, застройщика, локацию, изображение и базовые показатели (если есть);
- сохраняет результат в `data/jk_catalog.json`;
- генерирует страницы `jk/auto-*.html` и `jk/index.html`.

Дополнительно каталог автоматически показывается на главной странице (`/index.html`) и открывает popup карточку ЖК по клику.

## Ручной запуск
```bash
python3 tools/update_jk_catalog.py
```

## Ежедневное обновление (cron)
```bash
bash tools/install_daily_cron.sh
```

Cron запускает `tools/run_daily_update.sh` ежедневно в 03:00.
Логи пишутся в `data/jk_update.log`.

## Важно
Если источник временно недоступен, скрипт использует последний кэш (`data/jk_catalog.json`) и не ломает сайт.
