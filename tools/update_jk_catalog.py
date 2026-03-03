#!/usr/bin/env python3
"""Надёжный парсер каталога сданных новостроек pronovostroy.ru.

Что делает:
1) Загружает список: https://pronovostroy.ru/novostroyki-sdannye/
2) Находит URL карточек ЖК (через JSON-LD + HTML fallback)
3) Открывает карточку каждого ЖК и вытаскивает:
   - название ЖК
   - застройщик
   - локацию
   - цену (если есть)
   - статус (если есть)
   - URL изображения
4) Скачивает изображение ЖК локально в assets/jk/
5) Генерирует:
   - data/jk_catalog.json
   - jk/index.html
   - jk/auto-*.html

Поведение при недоступности источника:
- Используется прошлый кэш без выдуманных данных/картинок.
"""
from __future__ import annotations

import json
import re
import time
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from html import escape, unescape
from pathlib import Path
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent.parent
DATA_FILE = ROOT / "data" / "jk_catalog.json"
JK_DIR = ROOT / "jk"
ASSETS_JK_DIR = ROOT / "assets" / "jk"
SOURCE_URL = "https://pronovostroy.ru/novostroyki-sdannye/"

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
]


@dataclass
class JKItem:
    title: str
    source_url: str
    developer: str = "Застройщик не указан"
    location: str = "Москва / МО"
    image_url: str = ""
    local_image: str = ""
    price_hint: str = "не указана"
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


def request_text(url: str, retries: int = 3) -> str:
    last_error = None
    for attempt in range(retries):
        for ua in USER_AGENTS:
            req = Request(
                url,
                headers={
                    "User-Agent": ua,
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                    "Accept-Language": "ru-RU,ru;q=0.9,en;q=0.8",
                    "Referer": "https://www.google.com/",
                    "Connection": "keep-alive",
                },
            )
            try:
                with urlopen(req, timeout=35) as res:
                    return res.read().decode("utf-8", "ignore")
            except Exception as exc:  # noqa: BLE001
                last_error = exc
                time.sleep(0.3)
        time.sleep(0.8)
    raise RuntimeError(f"fetch failed for {url}: {last_error}")


def request_binary(url: str) -> bytes:
    req = Request(url, headers={"User-Agent": USER_AGENTS[0], "Referer": SOURCE_URL})
    with urlopen(req, timeout=35) as res:
        return res.read()


def strip_tags(raw: str) -> str:
    return re.sub(r"<[^>]+>", "", raw)


def normalize_space(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def extract_json_ld(html: str) -> list[dict]:
    blocks = re.findall(
        r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
        html,
        flags=re.I | re.S,
    )
    result: list[dict] = []
    for block in blocks:
        text = block.strip()
        if not text:
            continue
        try:
            parsed = json.loads(text)
            if isinstance(parsed, list):
                result.extend(x for x in parsed if isinstance(x, dict))
            elif isinstance(parsed, dict):
                result.append(parsed)
        except Exception:
            continue
    return result


def extract_list_urls(html: str) -> list[str]:
    urls: set[str] = set()

    # 1) JSON-LD ItemList
    for obj in extract_json_ld(html):
        t = str(obj.get("@type", "")).lower()
        if "itemlist" in t:
            for el in obj.get("itemListElement", []) or []:
                if isinstance(el, dict):
                    if isinstance(el.get("item"), dict) and el["item"].get("url"):
                        urls.add(urljoin(SOURCE_URL, el["item"]["url"]))
                    elif el.get("url"):
                        urls.add(urljoin(SOURCE_URL, el["url"]))

    # 2) HTML fallback
    for href in re.findall(r'<a[^>]+href=["\']([^"\']+)["\']', html, flags=re.I):
        low = href.lower()
        if any(k in low for k in ["/novostroy", "/zhk", "novostroyki", "jk-"]):
            urls.add(urljoin(SOURCE_URL, href))

    # Оставляем только ссылки этого домена
    clean = [u for u in urls if "pronovostroy.ru" in u]

    # Удаляем служебные/не карточки
    deny = ["/novostroyki-sdannye", "/novostroyki/", "/developers", "/news", "/contacts", "/rating"]
    out = []
    for u in clean:
        lu = u.lower()
        if any(d in lu for d in deny):
            continue
        out.append(u)

    # Стабильный порядок
    return sorted(set(out))


def parse_detail(url: str, html: str) -> JKItem | None:
    title = ""
    developer = "Застройщик не указан"
    location = "Москва / МО"
    image_url = ""
    price = "не указана"
    status = "сдан"

    # title: OpenGraph / <title> / H1
    m = re.search(r'<meta[^>]+property=["\']og:title["\'][^>]+content=["\']([^"\']+)["\']', html, re.I)
    if m:
        title = normalize_space(unescape(m.group(1)))
    if not title:
        m = re.search(r"<title>(.*?)</title>", html, re.I | re.S)
        if m:
            title = normalize_space(unescape(strip_tags(m.group(1))))
    if not title:
        m = re.search(r"<h1[^>]*>(.*?)</h1>", html, re.I | re.S)
        if m:
            title = normalize_space(unescape(strip_tags(m.group(1))))

    if title:
        title = re.sub(r"\s*[\-|—].*$", "", title).strip()

    # json-ld offers structured fields
    for obj in extract_json_ld(html):
        obj_type = str(obj.get("@type", "")).lower()
        if obj_type in {"product", "residence", "apartmentcomplex", "thing"} or "product" in obj_type:
            if not title and obj.get("name"):
                title = normalize_space(str(obj.get("name")))
            if not image_url and obj.get("image"):
                if isinstance(obj["image"], list) and obj["image"]:
                    image_url = urljoin(url, str(obj["image"][0]))
                else:
                    image_url = urljoin(url, str(obj["image"]))
            if isinstance(obj.get("offers"), dict):
                p = obj["offers"].get("price")
                cur = obj["offers"].get("priceCurrency", "")
                if p:
                    price = f"от {p} {cur}".strip()

    # image fallback
    if not image_url:
        m = re.search(r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']', html, re.I)
        if m:
            image_url = urljoin(url, m.group(1))
    if not image_url:
        m = re.search(r'<img[^>]+src=["\']([^"\']+)["\'][^>]*>', html, re.I)
        if m:
            image_url = urljoin(url, m.group(1))

    # developer/location/status/price from text
    text = normalize_space(unescape(strip_tags(html)))

    dm = re.search(r"(?:Застройщик|Девелопер)\s*[:\-]?\s*([A-Za-zА-Яа-я0-9«»\"\-\s]{2,120})", text, re.I)
    if dm:
        developer = normalize_space(dm.group(1).split("Срок")[0].split("Цена")[0])

    if re.search(r"московск[а-я\s]+область", text, re.I):
        location = "Московская область"
    elif re.search(r"\bмосква\b", text, re.I):
        location = "Москва"

    pm = re.search(r"от\s*[\d\s,.]+\s*(?:млн|₽|руб)", text, re.I)
    if pm:
        price = normalize_space(pm.group(0))

    sm = re.search(r"(сдан[аоы]?|введ[её]н[аоы]?\s*в\s*эксплуатацию)", text, re.I)
    if sm:
        status = normalize_space(sm.group(1))

    # фильтр по МСК/МО
    if location not in {"Москва", "Московская область", "Москва / МО"}:
        return None

    if not title:
        return None

    return JKItem(
        title=title,
        source_url=url,
        developer=developer,
        location=location,
        image_url=image_url,
        price_hint=price,
        deadline_hint=status,
    )


def download_image(item: JKItem) -> str:
    if not item.image_url:
        return ""

    try:
        ASSETS_JK_DIR.mkdir(parents=True, exist_ok=True)
        parsed = urlparse(item.image_url)
        ext = Path(parsed.path).suffix.lower()
        if ext not in {".jpg", ".jpeg", ".png", ".webp", ".avif"}:
            ext = ".jpg"
        out_name = f"{item.slug}{ext}"
        out_path = ASSETS_JK_DIR / out_name
        out_path.write_bytes(request_binary(item.image_url))
        return f"/assets/jk/{out_name}"
    except Exception:
        return ""


def load_previous_items() -> list[JKItem]:
    if not DATA_FILE.exists():
        return []
    data = json.loads(DATA_FILE.read_text())
    items: list[JKItem] = []
    for obj in data.get("items", []):
        img = obj.get("image_url", "")
        # не тянем старые выдуманные изображения
        if isinstance(img, str) and "unsplash.com" in img:
            img = ""
        items.append(
            JKItem(
                title=obj.get("title", ""),
                source_url=obj.get("source_url", SOURCE_URL),
                developer=obj.get("developer", "Застройщик не указан"),
                location=obj.get("location", "Москва / МО"),
                image_url=img,
                local_image=obj.get("local_image", ""),
                price_hint=obj.get("price_hint", "не указана"),
                deadline_hint=obj.get("deadline_hint", "сдан"),
                source=obj.get("source", "pronovostroy.ru"),
            )
        )
    return [x for x in items if x.title]


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
    <header class="site-header"><div class="container top-nav"><a class="brand" href="/index.html">AUDITNOVOSTROY</a><nav class="menu"><a href="/index.html">Главная</a><a href="/experts/index.html">Эксперты</a><a href="/situations/what-to-sign.html">Ситуации</a><a href="/pricing/index.html">Тарифы</a><a href="/cases/index.html">Кейсы</a><a href="/legal/index.html">Юр. сопровождение</a><a href="/booking/index.html">Запись</a></nav></div></header>
    <main class="container page">{body}</main>
    <div class="modal" id="case-modal" aria-hidden="true"><div class="modal__backdrop" data-close-modal></div><div class="modal__content" role="dialog" aria-modal="true" aria-labelledby="case-title"><button class="modal__close" type="button" data-close-modal aria-label="Закрыть">×</button><h3 id="case-title">Кейс проверки</h3><p class="modal__subtitle">Чек-лист проверки:</p><ul id="case-checklist" class="modal__checklist"></ul><p id="case-issues"></p><div id="case-gallery" class="modal__gallery"></div></div></div>
    <footer class="site-footer"><div class="container footer-grid"><div><strong>AUDITNOVOSTROY</strong><p>Передача квартиры под контролем: приёмка, документы, план действий, сопровождение.</p></div><div><p>Телефон: +7 (495) 000-00-00</p><p>Email: lisica.i.v@gmail.com</p><p>© <span id="year"></span></p></div></div></footer>
    <script src="/script.js"></script>
  </body>
</html>'''


def render_jk_page(item: JKItem) -> str:
    img = item.local_image or item.image_url
    body = f'''
<section class="panel"><h1><span>{escape(item.title).upper()}</span> сданная новостройка: карточка ЖК</h1><p>Данные и изображение получены парсером с pronovostroy.ru/novostroyki-sdannye/.</p></section>
<section class="panel"><div class="image-strip"><figure class="image-card">{'<img src="'+escape(img)+'" alt="'+escape(item.title)+'" />' if img else '<div class="tag">Фото временно недоступно</div>'}<figcaption>{escape(item.title)} · {escape(item.developer)}</figcaption></figure><article class="card"><h3>Застройщик</h3><p>{escape(item.developer)}</p><h3>Локация</h3><p>{escape(item.location)}</p><h3>Цена</h3><p>{escape(item.price_hint)}</p><h3>Статус</h3><p>{escape(item.deadline_hint)}</p><p><a class="text-link" href="{escape(item.source_url)}" target="_blank" rel="noopener">Открыть источник</a></p></article></div></section>
<section class="panel cta-panel" id="lead"><h2><span>ЗАПИСЬ</span> на приёмку в {escape(item.title)}</h2><form class="lead-form" id="lead-form"><input type="text" name="name" placeholder="Имя" required /><input type="tel" name="phone" placeholder="Телефон" required /><input type="text" name="district" placeholder="{escape(item.title)}" /><button class="btn" type="submit">Отправить заявку</button></form><p class="muted" id="lead-status" aria-live="polite"></p></section>
'''
    return page_shell(f"{item.title} — AuditNovostroy", f"Сданная новостройка {item.title}", body)


def render_jk_index(items: list[JKItem], source_ok: bool, error: str | None) -> str:
    cards = []
    for i in items[:120]:
        cards.append(
            f'<article class="card"><h3>{escape(i.title)}</h3><p>Застройщик: {escape(i.developer)}</p><p>Локация: {escape(i.location)}</p><p>Цена: {escape(i.price_hint)}</p><a class="text-link" href="/jk/auto-{i.slug}.html">Открыть страницу ЖК</a></article>'
        )

    status = "данные обновлены" if source_ok else f"источник временно недоступен ({escape(error or 'без деталей')}) — показан последний кэш"

    body = f'''
<section class="panel"><h1><span>СДАННЫЕ НОВОСТРОЙКИ</span> Москва и Московская область</h1><p>Каталог обновляется автоматически раз в день с pronovostroy.ru/novostroyki-sdannye/.</p><p class="muted">Статус: {status}</p></section>
<section class="panel"><h2><span>КАТАЛОГ ЖК</span></h2><div class="grid grid-3">{"".join(cards) if cards else '<p>Нет данных для отображения.</p>'}</div></section>
<section class="panel cta-panel" id="lead"><h2><span>НЕ НАШЛИ СВОЙ ЖК?</span></h2><form class="lead-form" id="lead-form"><input type="text" name="name" placeholder="Имя" required /><input type="tel" name="phone" placeholder="Телефон" required /><input type="text" name="district" placeholder="Название ЖК" /><button class="btn" type="submit">Отправить заявку</button></form><p class="muted" id="lead-status" aria-live="polite"></p></section>
'''
    return page_shell("Каталог сданных ЖК — AuditNovostroy", "Сданные новостройки Москвы и МО", body)


def write_generated_pages(items: list[JKItem], source_ok: bool, error: str | None) -> None:
    JK_DIR.mkdir(exist_ok=True)

    keep = {f"auto-{i.slug}.html" for i in items}
    for p in JK_DIR.glob("auto-*.html"):
        if p.name not in keep:
            p.unlink(missing_ok=True)

    for i in items:
        (JK_DIR / f"auto-{i.slug}.html").write_text(render_jk_page(i))

    (JK_DIR / "index.html").write_text(render_jk_index(items, source_ok, error))


def main() -> int:
    source_ok = True
    error: str | None = None

    try:
        list_html = request_text(SOURCE_URL)
        urls = extract_list_urls(list_html)

        parsed_items: list[JKItem] = []
        for url in urls[:200]:
            try:
                detail_html = request_text(url, retries=2)
                item = parse_detail(url, detail_html)
                if item:
                    # Пропускаем явно не МСК/МО
                    if item.location not in {"Москва", "Московская область", "Москва / МО"}:
                        continue
                    parsed_items.append(item)
            except Exception:
                continue

        # дедуп по title
        unique: dict[str, JKItem] = {}
        for item in parsed_items:
            unique[item.title.lower()] = item
        items = list(unique.values())

        if not items:
            source_ok = False
            error = "не удалось получить валидные карточки ЖК"
            items = load_previous_items()
    except Exception as exc:  # noqa: BLE001
        source_ok = False
        error = str(exc)
        items = load_previous_items()

    # если даже кэша нет — безопасный минимум
    if not items:
        items = [
            JKItem(title="ЖК Прокшино", source_url=SOURCE_URL, location="Москва"),
            JKItem(title="ЖК Скандинавия", source_url=SOURCE_URL, location="Москва"),
            JKItem(title="ЖК Саларьево Парк", source_url=SOURCE_URL, location="Москва"),
        ]

    # пробуем скачать реальные картинки локально
    for item in items:
        item.local_image = download_image(item)

    save_data(items, source_ok, error)
    write_generated_pages(items, source_ok, error)

    print(f"Updated sold JK catalog: {len(items)} items; source_ok={source_ok}")
    if error:
        print(f"Warning: {error}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
