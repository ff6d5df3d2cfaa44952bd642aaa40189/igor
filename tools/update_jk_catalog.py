#!/usr/bin/env python3
"""Обновление каталога сданных новостроек с pronovostroy.ru.

Источник: https://pronovostroy.ru/novostroyki-sdannye/
Результат:
- data/jk_catalog.json
- jk/auto-*.html
- jk/index.html
"""
from __future__ import annotations

import json
import re
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from html import escape, unescape
from pathlib import Path
from urllib.parse import urljoin
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent.parent
DATA_FILE = ROOT / "data" / "jk_catalog.json"
JK_DIR = ROOT / "jk"
SOURCE_URL = "https://pronovostroy.ru/novostroyki-sdannye/"
UA = "Mozilla/5.0 (compatible; AuditNovostroyBot/1.0; +https://auditnovostroy.ru)"


@dataclass
class JKItem:
    title: str
    source_url: str
    developer: str = "Застройщик уточняется"
    location: str = "Москва / МО"
    image_url: str = "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=60"
    price_hint: str = "уточняется"
    deadline_hint: str = "сдан"
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


def parse_cards(html: str) -> list[JKItem]:
    # Блоки карточек на листингах обычно содержат ссылку, заголовок, картинку и/или застройщика.
    anchors = re.finditer(r'<a[^>]+href=["\'](?P<href>[^"\']+)["\'][^>]*>(?P<body>.*?)</a>', html, re.I | re.S)

    items: list[JKItem] = []
    seen = set()

    for m in anchors:
        href = m.group("href")
        body = m.group("body")
        full = urljoin(SOURCE_URL, href)
        low = href.lower()

        if not any(k in low for k in ["/novostroy", "/zhk", "novostroyki", "/jk-"]):
            continue

        text = unescape(strip_tags(body))
        text = re.sub(r"\s+", " ", text).strip()

        # Вытаскиваем кандидат названия
        title = ""
        title_match = re.search(r"(ЖК\s+[A-Za-zА-Яа-я0-9\-\s«»\"()]+)", text, re.I)
        if title_match:
            title = title_match.group(1).strip(' -–|')
        else:
            if 4 < len(text) < 120:
                title = text.split("|")[0].strip(' -–')

        if len(title) < 4:
            continue
        if full in seen:
            continue

        pos = m.start()
        context = html[max(0, pos - 1000): pos + 1000]

        # Застройщик
        dev = "Застройщик уточняется"
        dev_m = re.search(r"(?:застройщик|девелопер)\s*[:\-]?\s*([A-Za-zА-Яа-я0-9«»\"\-\s]{3,80})", context, re.I)
        if dev_m:
            dev = dev_m.group(1).strip(' .|,')

        # Локация: только Москва/МО
        loc = "Москва / МО"
        if re.search(r"московск[а-я\s]+област", context, re.I):
            loc = "Московская область"
        elif re.search(r"москва", context, re.I):
            loc = "Москва"

        # Цена/статус
        price_m = re.search(r"(от\s*[\d\s,.]+\s*(?:млн|₽|руб))", context, re.I)
        price = price_m.group(1).strip() if price_m else "уточняется"

        # Картинка
        img = ""
        img_m = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', body, re.I)
        if not img_m:
            img_m = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', context, re.I)
        if img_m:
            img = urljoin(SOURCE_URL, img_m.group(1))

        if not img:
            img = "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=60"

        items.append(
            JKItem(
                title=title,
                source_url=full,
                developer=dev,
                location=loc,
                image_url=img,
                price_hint=price,
                deadline_hint="сдан",
            )
        )
        seen.add(full)

    # Фильтруем только Москва/МО и убираем дубли по названию
    dedup: dict[str, JKItem] = {}
    for item in items:
        if item.location not in {"Москва", "Московская область", "Москва / МО"}:
            continue
        dedup[item.title.lower()] = item

    return list(dedup.values())[:150]


def load_prev() -> list[JKItem]:
    if not DATA_FILE.exists():
        return []
    data = json.loads(DATA_FILE.read_text())
    return [
        JKItem(
            title=i.get("title", ""),
            source_url=i.get("source_url", SOURCE_URL),
            developer=i.get("developer", "Застройщик уточняется"),
            location=i.get("location", "Москва / МО"),
            image_url=i.get("image_url") or "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=60",
            price_hint=i.get("price_hint", "уточняется"),
            deadline_hint=i.get("deadline_hint", "сдан"),
            source=i.get("source", "pronovostroy.ru"),
        )
        for i in data.get("items", [])
    ]


def save_data(items: list[JKItem], source_ok: bool, error: str | None) -> None:
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


def shell(title: str, description: str, body: str) -> str:
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
    <header class="site-header"><div class="container top-nav"><a class="brand" href="/index.html">AUDITNOVOSTROY</a><nav class="menu"><a href="/index.html">Главная</a><a href="/experts/index.html">Эксперты</a><a href="/situations/what-to-sign.html">Ситуации</a><a href="/pricing/index.html">Тарифы</a><a href="/cases/index.html">Кейсы</a><a href="/legal/index.html">Юр. сопровождение</a><a href="/booking/index.html">Запись</a></nav></div></header>
    <main class="container page">{body}</main>
    <div class="modal" id="case-modal" aria-hidden="true"><div class="modal__backdrop" data-close-modal></div><div class="modal__content" role="dialog" aria-modal="true" aria-labelledby="case-title"><button class="modal__close" type="button" data-close-modal aria-label="Закрыть">×</button><h3 id="case-title">Кейс проверки</h3><p class="modal__subtitle">Чек-лист проверки:</p><ul id="case-checklist" class="modal__checklist"></ul><p id="case-issues"></p><div id="case-gallery" class="modal__gallery"></div></div></div>
    <footer class="site-footer"><div class="container footer-grid"><div><strong>AUDITNOVOSTROY</strong><p>Передача квартиры под контролем: приёмка, документы, план действий, сопровождение.</p></div><div><p>Телефон: +7 (495) 000-00-00</p><p>Email: lisica.i.v@gmail.com</p><p>© <span id="year"></span></p></div></div></footer>
    <script src="/script.js"></script>
  </body>
</html>'''


def render_jk(item: JKItem) -> str:
    body = f'''
<section class="panel"><h1><span>{escape(item.title).upper()}</span> сданная новостройка: показатели и приёмка</h1><p>Данные подтягиваются автоматически с pronovostroy.ru/novostroyki-sdannye/ и обновляются ежедневно.</p></section>
<section class="panel"><div class="image-strip"><figure class="image-card"><img src="{escape(item.image_url)}" alt="{escape(item.title)}" /><figcaption>{escape(item.title)} · {escape(item.developer)}</figcaption></figure><article class="card"><h3>Застройщик</h3><p>{escape(item.developer)}</p><h3>Локация</h3><p>{escape(item.location)}</p><h3>Цена</h3><p>{escape(item.price_hint)}</p><h3>Статус</h3><p>{escape(item.deadline_hint)}</p><p><a class="text-link" href="{escape(item.source_url)}" target="_blank" rel="noopener">Открыть карточку на pronovostroy.ru</a></p></article></div></section>
<section class="panel cta-panel" id="lead"><h2><span>ЗАПИСЬ</span> на приёмку в {escape(item.title)}</h2><form class="lead-form" id="lead-form"><input type="text" name="name" placeholder="Имя" required /><input type="tel" name="phone" placeholder="Телефон" required /><input type="text" name="district" placeholder="{escape(item.title)}" /><button class="btn" type="submit">Отправить заявку</button></form><p class="muted" id="lead-status" aria-live="polite"></p></section>
'''
    return shell(f"{item.title} — AuditNovostroy", f"Сданная новостройка {item.title}", body)


def render_index(items: list[JKItem], source_ok: bool, error: str | None) -> str:
    cards = []
    for i in items[:120]:
        cards.append(
            f'<article class="card"><h3>{escape(i.title)}</h3><p>Застройщик: {escape(i.developer)}</p><p>Локация: {escape(i.location)}</p><p>Цена: {escape(i.price_hint)}</p><a class="text-link" href="/jk/auto-{i.slug}.html">Открыть страницу ЖК</a></article>'
        )

    status = "данные обновлены" if source_ok else f"источник временно недоступен ({escape(error or 'без деталей')}) — показан кэш"
    body = f'''
<section class="panel"><h1><span>СДАННЫЕ НОВОСТРОЙКИ</span> Москва и Московская область</h1><p>Каталог обновляется автоматически раз в день с источника pronovostroy.ru/novostroyki-sdannye/.</p><p class="muted">Статус: {status}</p></section>
<section class="panel"><h2><span>КАТАЛОГ ЖК</span></h2><div class="grid grid-3">{"".join(cards)}</div></section>
<section class="panel cta-panel" id="lead"><h2><span>НЕ НАШЛИ СВОЙ ЖК?</span></h2><form class="lead-form" id="lead-form"><input type="text" name="name" placeholder="Имя" required /><input type="tel" name="phone" placeholder="Телефон" required /><input type="text" name="district" placeholder="Название ЖК" /><button class="btn" type="submit">Отправить заявку</button></form><p class="muted" id="lead-status" aria-live="polite"></p></section>
'''
    return shell("Каталог сданных ЖК — AuditNovostroy", "Сданные новостройки Москвы и МО", body)


def write_pages(items: list[JKItem], source_ok: bool, error: str | None) -> None:
    JK_DIR.mkdir(exist_ok=True)

    keep = {f"auto-{i.slug}.html" for i in items}
    for p in JK_DIR.glob("auto-*.html"):
        if p.name not in keep:
            p.unlink(missing_ok=True)

    for i in items:
        (JK_DIR / f"auto-{i.slug}.html").write_text(render_jk(i))

    (JK_DIR / "index.html").write_text(render_index(items, source_ok, error))


def main() -> int:
    source_ok = True
    error = None

    try:
        html = fetch(SOURCE_URL)
        items = parse_cards(html)
        if not items:
            source_ok = False
            error = "на странице не найдены карточки ЖК"
            items = load_prev()
    except Exception as exc:  # noqa: BLE001
        source_ok = False
        error = str(exc)
        items = load_prev()

    if not items:
        items = [
            JKItem(title="ЖК Прокшино", source_url=SOURCE_URL, developer="А101", location="Москва"),
            JKItem(title="ЖК Скандинавия", source_url=SOURCE_URL, developer="А101", location="Москва"),
            JKItem(title="ЖК Саларьево Парк", source_url=SOURCE_URL, developer="ПИК", location="Москва"),
        ]

    save_data(items, source_ok, error)
    write_pages(items, source_ok, error)

    print(f"Updated sold JK catalog: {len(items)} items; source_ok={source_ok}")
    if error:
        print(f"Warning: {error}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
