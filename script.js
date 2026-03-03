const yearElement = document.getElementById('year');
if (yearElement) yearElement.textContent = new Date().getFullYear();

const form = document.querySelector('.lead-form');
if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    alert('Спасибо! Специалист свяжется с вами в ближайшее время.');
    form.reset();
  });
}
