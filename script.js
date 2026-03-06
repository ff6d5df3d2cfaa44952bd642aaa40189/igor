const STORAGE_KEY = 'gameboy-screen-image';

function setScreenImage(dataUrl) {
  const screenImage = document.getElementById('screen-image');
  const placeholder = document.getElementById('screen-placeholder');

  if (!screenImage || !placeholder) return;

  if (dataUrl) {
    screenImage.src = dataUrl;
    screenImage.hidden = false;
    placeholder.hidden = true;
  } else {
    screenImage.removeAttribute('src');
    screenImage.hidden = true;
    placeholder.hidden = false;
  }
}

function initPosterPage() {
  const saved = localStorage.getItem(STORAGE_KEY);
  setScreenImage(saved);
}

function initAdminPage() {
  const form = document.getElementById('upload-form');
  const imageInput = document.getElementById('image-input');
  const previewImage = document.getElementById('preview-image');
  const previewPlaceholder = document.getElementById('preview-placeholder');
  const status = document.getElementById('admin-status');
  const clearBtn = document.getElementById('clear-image');

  if (!form || !imageInput || !previewImage || !previewPlaceholder || !status || !clearBtn) return;

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    previewImage.src = saved;
    previewImage.hidden = false;
    previewPlaceholder.hidden = true;
    status.textContent = 'Сейчас используется сохранённая картинка.';
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const file = imageInput.files?.[0];
    if (!file) {
      status.textContent = 'Выберите файл перед сохранением.';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      if (!dataUrl) {
        status.textContent = 'Не удалось прочитать изображение.';
        return;
      }

      localStorage.setItem(STORAGE_KEY, dataUrl);
      previewImage.src = dataUrl;
      previewImage.hidden = false;
      previewPlaceholder.hidden = true;
      status.textContent = 'Готово! Картинка сохранена и видна на главной странице.';
      imageInput.value = '';
    };

    reader.onerror = () => {
      status.textContent = 'Ошибка при чтении файла.';
    };

    reader.readAsDataURL(file);
  });

  clearBtn.addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    previewImage.removeAttribute('src');
    previewImage.hidden = true;
    previewPlaceholder.hidden = false;
    status.textContent = 'Изображение очищено. На главной снова заглушка.';
  });
}

if (document.body.classList.contains('page--poster')) {
  initPosterPage();
}

if (document.body.classList.contains('page--admin')) {
  initAdminPage();
}
