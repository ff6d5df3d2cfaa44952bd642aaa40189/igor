const DATA_FILE = 'catalog_chats_site_ready.json';

const searchInput = document.getElementById('searchInput');
const districtFilter = document.getElementById('districtFilter');
const classFilter = document.getElementById('classFilter');
const statusFilter = document.getElementById('statusFilter');
const catalog = document.getElementById('catalog');
const resultsMeta = document.getElementById('resultsMeta');
const cardTemplate = document.getElementById('cardTemplate');

let complexes = [];

const uniqueValues = (key) => [...new Set(complexes.map((item) => item[key]).filter(Boolean))].sort();

const fillSelect = (select, values) => {
  select.querySelectorAll('option:not([value=""])').forEach((option) => option.remove());

  values.forEach((value) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    select.append(option);
  });
};

const normalizeRecord = (record) => {
  const name =
    record['ЖК'] ||
    record['Название ЖК'] ||
    record['Комплекс'] ||
    record['Группа каталога']?.split('/').pop()?.trim() ||
    '';

  const district = record['Район / локация'] || record['Район'] || 'Не указан';
  const classType = record['Класс'] || record['Тип списка'] || 'Каталог';
  const status = record['Срок сдачи'] || record['Статус'] || record['Стадия'] || 'Не указан';
  const apartments =
    record['Кол-во квартир'] ||
    record['Количество квартир'] ||
    record['Объём'] ||
    record['Застройщик'] ||
    'Нет данных';
  const chatUrl = record['Ссылка на чат'] || record['Ссылка исходная'] || '';

  return {
    name,
    district,
    classType,
    status,
    apartments,
    chatUrl
  };
};

const matchesFilters = (item) => {
  const query = searchInput.value.trim().toLowerCase();

  const byName = !query || item.name.toLowerCase().includes(query);
  const byDistrict = !districtFilter.value || item.district === districtFilter.value;
  const byClass = !classFilter.value || item.classType === classFilter.value;
  const byStatus = !statusFilter.value || item.status === statusFilter.value;

  return byName && byDistrict && byClass && byStatus;
};

const createCard = (item) => {
  const node = cardTemplate.content.firstElementChild.cloneNode(true);

  node.querySelector('h2').textContent = item.name;
  node.querySelector('.badge').textContent = item.classType;

  const facts = node.querySelector('.card__facts');
  [
    `Район: ${item.district}`,
    `Статус: ${item.status}`,
    `Объём: ${item.apartments}`
  ].forEach((text) => {
    const li = document.createElement('li');
    li.textContent = text;
    facts.append(li);
  });

  const link = node.querySelector('.card__chat-link');
  link.href = item.chatUrl;
  link.setAttribute('aria-label', `Открыть чат ${item.name}`);

  return node;
};

const render = () => {
  const filtered = complexes.filter(matchesFilters);
  catalog.replaceChildren();
  resultsMeta.textContent = `Найдено: ${filtered.length}`;

  if (!filtered.length) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent = 'По вашему запросу ничего не найдено. Попробуйте изменить фильтры.';
    catalog.append(empty);
    return;
  }

  filtered.forEach((item) => {
    catalog.append(createCard(item));
  });
};

const init = async () => {
  try {
    const response = await fetch(DATA_FILE, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const rawData = await response.json();
    if (!Array.isArray(rawData)) {
      throw new Error('JSON должен быть массивом объектов');
    }

    complexes = rawData
      .map(normalizeRecord)
      .filter((item) => item.name && item.chatUrl);

    if (!complexes.length) {
      throw new Error('В JSON нет валидных записей с ЖК и ссылкой на чат');
    }

    fillSelect(districtFilter, uniqueValues('district'));
    fillSelect(classFilter, uniqueValues('classType'));
    fillSelect(statusFilter, uniqueValues('status'));

    render();
  } catch (error) {
    catalog.replaceChildren();
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent =
      `Ошибка загрузки ${DATA_FILE}. Проверьте, что файл лежит рядом с index.html и содержит массив объектов.`;
    catalog.append(empty);
    resultsMeta.textContent = 'Найдено: 0';
    console.error(error);
  }
};

[searchInput, districtFilter, classFilter, statusFilter].forEach((input) => {
  input.addEventListener('input', render);
  input.addEventListener('change', render);
});

init();
