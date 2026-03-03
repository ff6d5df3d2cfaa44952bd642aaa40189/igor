const yearElement = document.getElementById('year');
if (yearElement) yearElement.textContent = new Date().getFullYear();

const form = document.querySelector('.lead-form');
if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    alert('Заявка принята. Подготовим план проверки и свяжемся с вами.');
    form.reset();
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
