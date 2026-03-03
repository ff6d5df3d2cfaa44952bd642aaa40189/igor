const yearElement = document.getElementById('year');
if (yearElement) yearElement.textContent = new Date().getFullYear();

const form = document.getElementById('lead-form');
const leadStatus = document.getElementById('lead-status');

// Используем ID endpoint FormSubmit (без явного email в URL)
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

  if (!response.ok) {
    throw new Error('Ошибка отправки');
  }

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

    if (leadStatus) {
      leadStatus.textContent = 'Отправляем заявку...';
    }
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
    } catch (error) {
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

const modal = document.getElementById('case-modal');
const titleElement = document.getElementById('case-title');
const checklistElement = document.getElementById('case-checklist');
const issuesElement = document.getElementById('case-issues');
const galleryElement = document.getElementById('case-gallery');
const closeButtons = document.querySelectorAll('[data-close-modal]');
const triggers = document.querySelectorAll('.case-trigger');

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

const openModal = (trigger) => {
  if (!modal || !titleElement || !issuesElement) return;

  const title = trigger.dataset.caseTitle || 'Кейс проверки';
  const checklist = (trigger.dataset.caseChecklist || '').split('|').filter(Boolean);
  const images = (trigger.dataset.caseImages || '').split('|').filter(Boolean);

  titleElement.textContent = title;
  fillChecklist(checklist);
  fillGallery(images, title);
  issuesElement.textContent = trigger.dataset.caseIssues || '';

  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
};

const closeModal = () => {
  if (!modal) return;
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
};

triggers.forEach((trigger) => {
  trigger.addEventListener('click', () => openModal(trigger));
});

closeButtons.forEach((button) => {
  button.addEventListener('click', closeModal);
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeModal();
});
