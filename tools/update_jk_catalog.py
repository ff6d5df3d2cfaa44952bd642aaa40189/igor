#!/usr/bin/env python3
"""Парсер каталога ЖК с pronovostroy.ru + генератор страниц jk/auto-*.html и jk/index.html.

Запуск:
  python3 tools/update_jk_catalog.py

Если сайт недоступен, скрипт не ломает сайт и использует последний data/jk_catalog.json.
"""
from __future__ import annotations

import json
import re
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from html import unescape, escape
from pathlib import Path
from typing import Iterable
from urllib.parse import urljoin
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent.parent
DATA_FILE = ROOT / "data" / "jk_catalog.json"
JK_DIR = ROOT / "jk"
SOURCE_URL = "https://pronovostroy.ru/"
UA = "Mozilla/5.0 (compatible; AuditNovostroyBot/1.0; +https://auditnovostroy.ru)"


@dataclass
class JKItem:
    title: str
    source_url: str
    location: str = "Москва / МО"
    price_hint: str = "уточняется"
    deadline_hint: str = "уточняется"
    source: str = "pronovostroy.ru"

    @property
    def slug(self) -> str:
        return slugify(self.title)


def slugify(value: str) -> str:
    table = {
        "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ё": "e", "ж": "zh", "з": "z",
        "и": "i", "й": "y", "к": "k", "л": "l", "м": "m", "н": "n", "о": "o", "п": "p", "р": "r",
        "с": "s", "т": "t", "у": "u", "ф": "f", "х": "h", "ц": "c", "ч": "ch", "ш": "sh", "щ": "sch",
        "ъ": "", "ы": "y", "ь": "", "э": "e", "ю": "yu", "я": "ya",
    }
    text = value.lower().strip()
    text = "".join(table.get(ch, ch) for ch in text)
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return re.sub(r"-+", "-", text).strip("-") or "jk"


def fetch(url: str) -> str:
    req = Request(url, headers={"User-Agent": UA})
    with urlopen(req, timeout=35) as res:
        return res.read().decode("utf-8", "ignore")


def strip_tags(html: str) -> str:
    return re.sub(r"<[^>]+>", "", html)


def extract_candidates(html: str, base_url: str) -> list[JKItem]:
    # Универсально по ссылкам на карточки ЖК
    link_pattern = re.compile(r'<a[^>]+href=["\']([^"\']+)["\'][^>]*>(.*?)</a>', re.I | re.S)
    items: list[JKItem] = []
    seen: set[str] = set()

    for href, raw_text in link_pattern.findall(html):
        text = unescape(strip_tags(raw_text)).strip()
        text = re.sub(r"\s+", " ", text)
        full_url = urljoin(base_url, href)
        low_href = href.lower()

        is_jk_link = any(k in low_href for k in ["/novostroy", "/zhk", "novostroyki", "jk-"])
        looks_like_jk_name = bool(re.search(r"\b(жк|жилой комплекс)\b", text.lower())) or (len(text) > 7 and text[0].isupper())

        if not (is_jk_link and looks_like_jk_name):
            continue
        if len(text) < 4 or len(text) > 120:
            continue
        if full_url in seen:
            continue

        # Берём небольшой контекст вокруг ссылки и ищем подсказки показателей
        idx = html.find(href)
        context = html[max(0, idx - 600): idx + 600] if idx >= 0 else ""

        price_match = re.search(r"(от\s*[\d\s,.]+\s*(?:млн|₽|руб))", context, re.I)
        deadline_match = re.search(r"(сдач[аи][^<\n]{0,40})", context, re.I)
        location_match = re.search(r"(москва|московск[а-я ]+область|мо)", context, re.I)

        items.append(
            JKItem(
                title=text,
                source_url=full_url,
                location=location_match.group(1).strip() if location_match else "Москва / МО",
                price_hint=price_match.group(1).strip() if price_match else "уточняется",
                deadline_hint=deadline_match.group(1).strip() if deadline_match else "уточняется",
            )
        )
        seen.add(full_url)

    # Чистка дублей по названию
    dedup: dict[str, JKItem] = {}
    for item in items:
        key = item.title.lower()
        dedup[key] = item

    # Ограничим объём
    return list(dedup.values())[:120]


def load_previous_items() -> list[JKItem]:
    if not DATA_FILE.exists():
        return []
    data = json.loads(DATA_FILE.read_text())
    items = []
    for obj in data.get("items", []):
        items.append(JKItem(**{k: obj.get(k, "") for k in ["title", "source_url", "location", "price_hint", "deadline_hint", "source"]}))
    return items


def save_data(items: list[JKItem], source_ok: bool, error: str | None = None) -> None:
    payload = {
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "source_url": SOURCE_URL,
        "source_ok": source_ok,
        "error": error,
        "count": len(items),
        "items": [asdict(i) | {"slug": i.slug} for i in items],
    }
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    DATA_FILE.write_text(json.dumps(payload, ensure_ascii=False, indent=2))


def page_shell(title: str, description: str, body: str) -> str:
    return f'''<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
    <meta name="description" content="{description}" />
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body>
    <div class="poster-grid" aria-hidden="true"></div>
    <header class="site-header">
      <div class="container top-nav">
        <a class="brand" href="/index.html">AUDITNOVOSTROY</a>
        <nav class="menu">
          <a href="/index.html">Главная</a>
          <a href="/experts/index.html">Эксперты</a>
          <a href="/situations/what-to-sign.html">Ситуации</a>
          <a href="/pricing/index.html">Тарифы</a>
          <a href="/cases/index.html">Кейсы</a>
          <a href="/legal/index.html">Юр. сопровождение</a>
          <a href="/booking/index.html">Запись</a>
        </nav>
      </div>
    </header>
    <main class="container page">
{body}
    </main>
    <div class="modal" id="case-modal" aria-hidden="true">
      <div class="modal__backdrop" data-close-modal></div>
      <div class="modal__content" role="dialog" aria-modal="true" aria-labelledby="case-title">
        <button class="modal__close" type="button" data-close-modal aria-label="Закрыть">×</button>
        <h3 id="case-title">Кейс проверки</h3>
        <p class="modal__subtitle">Чек-лист проверки:</p>
        <ul id="case-checklist" class="modal__checklist"></ul>
        <p id="case-issues"></p>
        <div id="case-gallery" class="modal__gallery"></div>
      </div>
    </div>
    <footer class="site-footer">
      <div class="container footer-grid">
        <div><strong>AUDITNOVOSTROY</strong><p>Передача квартиры под контролем: приёмка, документы, план действий, сопровождение.</p></div>
        <div><p>Телефон: +7 (495) 000-00-00</p><p>Email: lisica.i.v@gmail.com</p><p>© <span id="year"></span></p></div>
      </div>
    </footer>
    <script src="/script.js"></script>
  </body>
</html>
'''


def render_jk_page(item: JKItem) -> str:
    body = f'''
      <section class="panel"><h1><span>{item.title.upper()}</span> актуальные показатели и приёмка</h1><p>Страница сгенерирована автоматически из открытого источника {item.source}. Перед выездом эксперт уточняет показатели по объекту.</p></section>
      <section class="panel"><h2><span>ПОКАЗАТЕЛИ ЖК</span></h2><div class="grid grid-3"><article class="card"><h3>Локация</h3><p>{item.location}</p></article><article class="card"><h3>Цена</h3><p>{item.price_hint}</p></article><article class="card"><h3>Сроки/статус</h3><p>{item.deadline_hint}</p></article></div></section>
      <section class="panel"><h2><span>ИСТОЧНИК</span></h2><p><a class="text-link" href="{item.source_url}" target="_blank" rel="noopener">Открыть карточку ЖК на pronovostroy.ru</a></p></section>
      <section class="panel cta-panel" id="lead"><h2><span>ЗАПИСЬ</span> на приёмку в этом ЖК</h2><p>Оставьте заявку — подберём эксперта с релевантным опытом именно по вашему объекту.</p><form class="lead-form" id="lead-form"><input type="text" name="name" placeholder="Имя" required /><input type="tel" name="phone" placeholder="Телефон" required /><input type="text" name="district" placeholder="{item.title}" /><button class="btn" type="submit">Отправить заявку</button></form><p class="muted" id="lead-status" aria-live="polite"></p></section>
    '''
    return page_shell(f"{item.title} — AuditNovostroy", f"Показатели и приёмка в {item.title}", body)


def render_jk_index(items: list[JKItem], source_ok: bool, error: str | None) -> str:
    cards = []
    for item in items[:90]:
        cards.append(
            f'<article class="card"><h3>{item.title}</h3><p>Локация: {item.location}</p><p>Цена: {item.price_hint}</p><p>Статус: {item.deadline_hint}</p><a class="text-link" href="/jk/auto-{item.slug}.html">Открыть страницу ЖК</a></article>'
        )

    status_text = "данные обновлены автоматически" if source_ok else f"источник временно недоступен ({escape(error or 'без деталей')}), показан кэш"

    body = f'''
      <section class="panel"><h1><span>КАТАЛОГ ЖК</span> автоматическое обновление</h1><p>Список формируется парсером с pronovostroy.ru и обновляется раз в сутки.</p><p class="muted">Статус: {status_text}</p></section>
      <section class="panel"><h2><span>ЖК В КАТАЛОГЕ</span></h2><div class="grid grid-3">{"".join(cards) if cards else '<p>Данные пока не загружены.</p>'}</div></section>
      <section class="panel cta-panel" id="lead"><h2><span>НЕ НАШЛИ СВОЙ ЖК?</span></h2><p>Оставьте заявку — добавим объект вручную и подберём эксперта.</p><form class="lead-form" id="lead-form"><input type="text" name="name" placeholder="Имя" required /><input type="tel" name="phone" placeholder="Телефон" required /><input type="text" name="district" placeholder="Название ЖК" /><button class="btn" type="submit">Отправить заявку</button></form><p class="muted" id="lead-status" aria-live="polite"></p></section>
    '''
    return page_shell("Каталог ЖК — AuditNovostroy", "Автоматически обновляемый список жилых комплексов", body)


def write_pages(items: list[JKItem], source_ok: bool, error: str | None) -> None:
    JK_DIR.mkdir(exist_ok=True)

    # Удаляем старые auto-страницы, которые больше не актуальны
    keep = {f"auto-{i.slug}.html" for i in items}
    for p in JK_DIR.glob("auto-*.html"):
        if p.name not in keep:
            p.unlink(missing_ok=True)

    # Пишем страницы ЖК
    for item in items:
        (JK_DIR / f"auto-{item.slug}.html").write_text(render_jk_page(item))

    # Индекс каталога
    (JK_DIR / "index.html").write_text(render_jk_index(items, source_ok, error))


def main() -> int:
    source_ok = True
    error = None
    items: list[JKItem]

    try:
        html = fetch(SOURCE_URL)
        parsed = extract_candidates(html, SOURCE_URL)
        items = parsed if parsed else load_previous_items()
        if not parsed:
            source_ok = False
            error = "на источнике не найдены карточки ЖК"
    except Exception as exc:  # noqa: BLE001
        source_ok = False
        error = str(exc)
        items = load_previous_items()

    # Минимальный фолбек, чтобы каталог не был пустым
    if not items:
        items = [
            JKItem(title="ЖК Прокшино", source_url="https://pronovostroy.ru/", price_hint="уточняется", deadline_hint="уточняется"),
            JKItem(title="ЖК Скандинавия", source_url="https://pronovostroy.ru/", price_hint="уточняется", deadline_hint="уточняется"),
            JKItem(title="ЖК Саларьево Парк", source_url="https://pronovostroy.ru/", price_hint="уточняется", deadline_hint="уточняется"),
        ]

    save_data(items, source_ok, error)
    write_pages(items, source_ok, error)

    print(f"Updated JK catalog: {len(items)} items; source_ok={source_ok}")
    if error:
        print(f"Warning: {error}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
