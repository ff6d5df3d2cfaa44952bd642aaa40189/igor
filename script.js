document.getElementById('year').textContent = new Date().getFullYear();

document.querySelector('.lead-form').addEventListener('submit', (event) => {
  event.preventDefault();
  alert('Спасибо! Мы свяжемся с вами в течение 15 минут.');
});
