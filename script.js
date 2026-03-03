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
