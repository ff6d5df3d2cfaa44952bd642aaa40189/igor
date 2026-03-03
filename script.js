const yearElement = document.getElementById('year');
if (yearElement) yearElement.textContent = new Date().getFullYear();

const form = document.getElementById('lead-form');
const leadStatus = document.getElementById('lead-status');
const FORMSUBMIT_ENDPOINT = 'https://formsubmit.co/ajax/d10ef71fed428e18c698b79eb2ca5a69';

const sendLeadToEmail = async (payload) => {
  const response = await fetch(FORMSUBMIT_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error('Ошибка отправки');

  const result = await response.json();
  if (result.success !== 'true' && result.success !== true) {
    throw new Error('Ошибка отправки');
  }
};

const openMailFallback = ({ name, phone, district }) => {
  const subject = encodeURIComponent('Новая заявка с лендинга');
  const body = encodeURIComponent(
    `Имя: ${name}\nТелефон: ${phone}\nЖК / адрес: ${district || '-'}\nИсточник: лендинг`,
  );
  window.location.href = `mailto:lisica.i.v@gmail.com?subject=${subject}&body=${body}`;
};

if (form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const submitButton = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);

    const name = String(formData.get('name') || '').trim();
    const phone = String(formData.get('phone') || '').trim();
    const district = String(formData.get('district') || '').trim();

    if (leadStatus) leadStatus.textContent = 'Отправляем заявку...';
    if (submitButton) submitButton.disabled = true;

    try {
      await sendLeadToEmail({
        name,
        phone,
        district,
        _subject: 'Новая заявка с лендинга',
      });
      if (leadStatus) {
        leadStatus.textContent = 'Заявка отправлена. Мы свяжемся с вами в ближайшее время.';
      }
      form.reset();
    } catch {
      if (leadStatus) {
        leadStatus.textContent =
          'Авто-отправка недоступна. Откроем письмо в вашей почтовой программе.';
      }
      openMailFallback({ name, phone, district });
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
}

const caseModal = document.getElementById('case-modal');
const titleElement = document.getElementById('case-title');
const checklistElement = document.getElementById('case-checklist');
const issuesElement = document.getElementById('case-issues');
const galleryElement = document.getElementById('case-gallery');
const closeCaseButtons = document.querySelectorAll('[data-close-modal]');
const caseTriggers = document.querySelectorAll('.case-trigger');

const fillChecklist = (items) => {
  if (!checklistElement) return;
  checklistElement.innerHTML = '';
  items.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    checklistElement.appendChild(li);
  });
};

const fillGallery = (images, title) => {
  if (!galleryElement) return;
  galleryElement.innerHTML = '';
  images.forEach((src, index) => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = `${title}: фото нарушения ${index + 1}`;
    galleryElement.appendChild(img);
  });
};

const openCaseModal = (trigger) => {
  if (!caseModal || !titleElement || !issuesElement) return;

  const title = trigger.dataset.caseTitle || 'Кейс проверки';
  const checklist = (trigger.dataset.caseChecklist || '').split('|').filter(Boolean);
  const images = (trigger.dataset.caseImages || '').split('|').filter(Boolean);

  titleElement.textContent = title;
  fillChecklist(checklist);
  fillGallery(images, title);
  issuesElement.textContent = trigger.dataset.caseIssues || '';

  caseModal.classList.add('is-open');
  caseModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
};

const closeCaseModal = () => {
  if (!caseModal) return;
  caseModal.classList.remove('is-open');
  caseModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
};

caseTriggers.forEach((trigger) => {
  trigger.addEventListener('click', () => openCaseModal(trigger));
});

closeCaseButtons.forEach((button) => {
  button.addEventListener('click', closeCaseModal);
});

// Каталог сданных ЖК на главной
const jkCatalogList = document.getElementById('jk-catalog-home-list');
const jkCatalogStatus = document.getElementById('jk-catalog-home-status');

const jkModal = document.getElementById('jk-modal');
const jkModalTitle = document.getElementById('jk-modal-title');
const jkModalImage = document.getElementById('jk-modal-image');
const jkModalDeveloper = document.getElementById('jk-modal-developer');
const jkModalLocation = document.getElementById('jk-modal-location');
const jkModalLink = document.getElementById('jk-modal-link');
const closeJkButtons = document.querySelectorAll('[data-close-jk-modal]');

const closeJkModal = () => {
  if (!jkModal) return;
  jkModal.classList.remove('is-open');
  jkModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
};

const openJkModal = (item) => {
  if (!jkModal || !jkModalTitle || !jkModalImage || !jkModalDeveloper || !jkModalLocation || !jkModalLink) {
    return;
  }

  jkModalTitle.textContent = item.title || 'Жилой комплекс';
  jkModalImage.src = item.image_url || '';
  jkModalImage.alt = item.title || 'ЖК';
  jkModalDeveloper.textContent = item.developer || 'Застройщик уточняется';
  jkModalLocation.textContent = item.location || 'Москва / МО';
  jkModalLink.href = item.source_url || '#';

  jkModal.classList.add('is-open');
  jkModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
};

closeJkButtons.forEach((btn) => btn.addEventListener('click', closeJkModal));

const renderJkCatalog = (items) => {
  if (!jkCatalogList) return;
  jkCatalogList.innerHTML = '';

  items.slice(0, 9).forEach((item) => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <img class="jk-thumb" src="${item.image_url || ''}" alt="${item.title || 'ЖК'}" />
      <h3>${item.title || 'ЖК'}</h3>
      <p>Застройщик: ${item.developer || 'уточняется'}</p>
      <p>Локация: ${item.location || 'Москва / МО'}</p>
      <button type="button" class="btn btn--ghost">Открыть карточку</button>
    `;

    const button = card.querySelector('button');
    if (button) {
      button.addEventListener('click', () => openJkModal(item));
    }

    jkCatalogList.appendChild(card);
  });
};

const loadJkCatalog = async () => {
  if (!jkCatalogList) return;
  try {
    const response = await fetch('/data/jk_catalog.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Не удалось загрузить каталог');

    const data = await response.json();
    renderJkCatalog(Array.isArray(data.items) ? data.items : []);

    if (jkCatalogStatus) {
      const status = data.source_ok ? 'данные обновлены автоматически' : 'показаны кэш-данные';
      jkCatalogStatus.textContent = `Каталог: ${status}. Обновлено: ${data.updated_at || 'н/д'}`;
    }
  } catch {
    if (jkCatalogStatus) {
      jkCatalogStatus.textContent = 'Каталог временно недоступен. Попробуйте позже.';
    }
  }
};

loadJkCatalog();

window.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  closeCaseModal();
  closeJkModal();
});
