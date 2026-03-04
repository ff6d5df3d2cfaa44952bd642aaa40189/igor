const yearElement = document.getElementById('year');
if (yearElement) yearElement.textContent = new Date().getFullYear();

const FORMSUBMIT_ENDPOINT = 'https://formsubmit.co/ajax/d10ef71fed428e18c698b79eb2ca5a69';

const sendLead = async (payload) => {
  const response = await fetch(FORMSUBMIT_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('send_failed');
  }

  const result = await response.json();
  if (result.success !== 'true' && result.success !== true) {
    throw new Error('send_failed');
  }
};

const openMailFallback = (payload) => {
  const subject = encodeURIComponent('Новая заявка с лендинга AuditNovostroy');
  const body = encodeURIComponent(
    Object.entries(payload)
      .map(([key, value]) => `${key}: ${value || '-'}`)
      .join('\n'),
  );
  window.location.href = `mailto:lisica.i.v@gmail.com?subject=${subject}&body=${body}`;
};

const forms = document.querySelectorAll('.js-lead-form');
forms.forEach((form) => {
  const phoneInput = form.querySelector('input[name="phone"]');
  const submitButton = form.querySelector('button[type="submit"]');
  const status = form.querySelector('.status');
  const successId = form.dataset.success;
  const successNode = successId ? document.getElementById(successId) : null;

  const setSubmitState = () => {
    if (!submitButton || !phoneInput) return;
    submitButton.disabled = !phoneInput.value.trim();
  };

  setSubmitState();
  if (phoneInput) {
    phoneInput.addEventListener('input', () => {
      form.classList.remove('error');
      setSubmitState();
    });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    const phone = String(payload.phone || '').trim();

    if (!phone) {
      form.classList.add('error');
      if (status) status.textContent = 'Проверьте телефон: поле обязательно для отправки.';
      setSubmitState();
      return;
    }

    const defaultLabel = submitButton ? submitButton.dataset.defaultLabel || submitButton.textContent : '';
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Отправляем...';
    }
    if (status) status.textContent = 'Отправляем заявку...';

    try {
      await sendLead({
        ...payload,
        _subject: 'Новая заявка с лендинга AuditNovostroy',
      });
      if (status) status.textContent = '';
      if (successNode) successNode.hidden = false;
      form.reset();
      setSubmitState();
    } catch {
      if (status) status.textContent = 'Авто-отправка недоступна. Откроем письмо в вашей почте.';
      openMailFallback(payload);
    } finally {
      if (submitButton) submitButton.textContent = defaultLabel;
      setSubmitState();
    }
  });

  if (submitButton) {
    submitButton.dataset.defaultLabel = submitButton.textContent;
  }
});

const faqQuestions = document.querySelectorAll('.faq-q');
faqQuestions.forEach((button) => {
  button.addEventListener('click', () => {
    const item = button.closest('.faq-item');
    if (!item) return;
    item.classList.toggle('open');
  });
});
