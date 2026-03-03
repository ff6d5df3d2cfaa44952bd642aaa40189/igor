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
const checksElement = document.getElementById('case-checks');
const issuesElement = document.getElementById('case-issues');
const closeButtons = document.querySelectorAll('[data-close-modal]');
const triggers = document.querySelectorAll('.case-trigger');

const openModal = (trigger) => {
  if (!modal || !titleElement || !checksElement || !issuesElement) return;

  titleElement.textContent = trigger.dataset.caseTitle || 'Кейс проверки';
  checksElement.textContent = trigger.dataset.caseChecks || '';
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
