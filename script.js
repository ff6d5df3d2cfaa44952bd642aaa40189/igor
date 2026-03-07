const PORTFOLIO_KEY = 'chicken-portfolio-items-v1';
const LEAD_EMAIL = 'lisica.i.v@gmail.com';

const defaultPortfolio = [
  {
    id: 'dish-1',
    title: 'Курица гриль целиком',
    benefit: 'Хрустящая корочка и сочное мясо без сухости',
    time: '50 минут',
    price: '1490 ₽',
    image: '/assets/dish-grilled.svg'
  },
  {
    id: 'dish-2',
    title: 'BBQ крылья',
    benefit: 'Насыщенный дымный вкус и остро-сладкий соус',
    time: '35 минут',
    price: '990 ₽',
    image: '/assets/dish-bbq.svg'
  },
  {
    id: 'dish-3',
    title: 'Фитнес-курица',
    benefit: 'Минимум масла, много белка, лёгкий маринад',
    time: '40 минут',
    price: '1190 ₽',
    image: '/assets/dish-fit.svg'
  }
];

function readPortfolio() {
  const raw = localStorage.getItem(PORTFOLIO_KEY);
  if (!raw) return defaultPortfolio;

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return defaultPortfolio;
    return parsed;
  } catch {
    return defaultPortfolio;
  }
}

function savePortfolio(items) {
  localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(items));
}

function cardTemplate(item, withDetails) {
  return `<article class="${withDetails ? '' : 'carousel-item'}">
    <img src="${item.image}" alt="${item.title}" />
    <div class="meta">
      <h3>${item.title}</h3>
      <p><strong>Преимущество:</strong> ${item.benefit}</p>
      <p><strong>Готовлю:</strong> ${item.time}</p>
      <p><strong>Цена:</strong> ${item.price}</p>
    </div>
  </article>`;
}

function initLanding() {
  const items = readPortfolio();
  const carousel = document.getElementById('portfolio-carousel');
  const prev = document.getElementById('portfolio-prev');
  const next = document.getElementById('portfolio-next');

  if (carousel) {
    carousel.innerHTML = items.map((item) => cardTemplate(item, false)).join('');
  }

  prev?.addEventListener('click', () => {
    carousel?.scrollBy({ left: -320, behavior: 'smooth' });
  });

  next?.addEventListener('click', () => {
    carousel?.scrollBy({ left: 320, behavior: 'smooth' });
  });

  const orderForm = document.getElementById('order-form');
  const status = document.getElementById('order-status');

  orderForm?.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = document.getElementById('lead-name')?.value?.trim() ?? '';
    const phone = document.getElementById('lead-phone')?.value?.trim() ?? '';
    const comment = document.getElementById('lead-comment')?.value?.trim() ?? '';

    const subject = encodeURIComponent('Новая заявка: курица на заказ');
    const body = encodeURIComponent(
      `Имя: ${name}\nТелефон: ${phone}\nКомментарий: ${comment || '—'}\n\nИсточник: лендинг`
    );

    window.location.href = `mailto:${LEAD_EMAIL}?subject=${subject}&body=${body}`;

    if (status) {
      status.textContent = 'Открылось почтовое приложение для отправки заявки.';
    }
  });
}

function initPortfolioPage() {
  const list = document.getElementById('portfolio-list');
  if (!list) return;
  const items = readPortfolio();
  list.innerHTML = items.map((item) => cardTemplate(item, true)).join('');
}

function initAdmin() {
  const form = document.getElementById('admin-form');
  const status = document.getElementById('admin-status');
  const itemsBox = document.getElementById('admin-items');

  const renderAdminItems = () => {
    const items = readPortfolio();
    if (!itemsBox) return;

    itemsBox.innerHTML = items
      .map(
        (item, index) => `<article class="admin-item">
          <img src="${item.image}" alt="${item.title}" />
          <div class="meta">
            <h3>${item.title}</h3>
            <p>${item.price} · ${item.time}</p>
            <button class="btn btn--small" data-remove-index="${index}" type="button">Удалить</button>
          </div>
        </article>`
      )
      .join('');

    itemsBox.querySelectorAll('[data-remove-index]').forEach((button) => {
      button.addEventListener('click', () => {
        const idx = Number(button.getAttribute('data-remove-index'));
        const current = readPortfolio();
        current.splice(idx, 1);
        savePortfolio(current.length ? current : defaultPortfolio);
        renderAdminItems();
      });
    });
  };

  renderAdminItems();

  form?.addEventListener('submit', (event) => {
    event.preventDefault();

    const title = document.getElementById('dish-title')?.value?.trim() ?? '';
    const benefit = document.getElementById('dish-benefit')?.value?.trim() ?? '';
    const time = document.getElementById('dish-time')?.value?.trim() ?? '';
    const price = document.getElementById('dish-price')?.value?.trim() ?? '';
    const imageInput = document.getElementById('dish-image');
    const file = imageInput?.files?.[0];

    if (!title || !benefit || !time || !price || !file) {
      if (status) status.textContent = 'Заполните все поля и загрузите изображение.';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const image = typeof reader.result === 'string' ? reader.result : '';
      if (!image) {
        if (status) status.textContent = 'Не удалось прочитать изображение.';
        return;
      }

      const updated = [
        ...readPortfolio(),
        { id: String(Date.now()), title, benefit, time, price, image }
      ];

      savePortfolio(updated);
      form.reset();
      renderAdminItems();
      if (status) status.textContent = 'Карточка блюда добавлена.';
    };

    reader.onerror = () => {
      if (status) status.textContent = 'Ошибка чтения файла.';
    };

    reader.readAsDataURL(file);
  });
}

if (document.body.classList.contains('site--landing')) initLanding();
if (document.body.classList.contains('site--portfolio')) initPortfolioPage();
if (document.body.classList.contains('site--admin')) initAdmin();
