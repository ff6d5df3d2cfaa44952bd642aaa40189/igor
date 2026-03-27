const complexes = [
  {
    name: 'ЖК Солнечный Берег',
    district: 'Приморский',
    classType: 'Комфорт',
    status: 'Сдан',
    apartments: '1 420 квартир',
    chatUrl: 'https://t.me/example_sunny_coast'
  },
  {
    name: 'ЖК Северный Парк',
    district: 'Северный',
    classType: 'Бизнес',
    status: 'Строится',
    apartments: '980 квартир',
    chatUrl: 'https://t.me/example_north_park'
  },
  {
    name: 'ЖК Лесная Резиденция',
    district: 'Западный',
    classType: 'Премиум',
    status: 'Сдан',
    apartments: '640 квартир',
    chatUrl: 'https://t.me/example_forest_residence'
  },
  {
    name: 'ЖК Речной Квартал',
    district: 'Центральный',
    classType: 'Комфорт',
    status: 'Ключи в 2026',
    apartments: '1 150 квартир',
    chatUrl: 'https://t.me/example_river_quarter'
  },
  {
    name: 'ЖК Маяк City',
    district: 'Южный',
    classType: 'Бизнес',
    status: 'Строится',
    apartments: '770 квартир',
    chatUrl: 'https://t.me/example_mayak_city'
  },
  {
    name: 'ЖК Зеленые Террасы',
    district: 'Восточный',
    classType: 'Комфорт',
    status: 'Ключи в 2027',
    apartments: '1 890 квартир',
    chatUrl: 'https://t.me/example_green_terraces'
  }
];

const searchInput = document.getElementById('searchInput');
const districtFilter = document.getElementById('districtFilter');
const classFilter = document.getElementById('classFilter');
const statusFilter = document.getElementById('statusFilter');
const catalog = document.getElementById('catalog');
const resultsMeta = document.getElementById('resultsMeta');
const cardTemplate = document.getElementById('cardTemplate');

const uniqueValues = (key) => [...new Set(complexes.map((item) => item[key]))].sort();

const fillSelect = (select, values) => {
  values.forEach((value) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    select.append(option);
  });
};

fillSelect(districtFilter, uniqueValues('district'));
fillSelect(classFilter, uniqueValues('classType'));
fillSelect(statusFilter, uniqueValues('status'));

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

[searchInput, districtFilter, classFilter, statusFilter].forEach((input) => {
  input.addEventListener('input', render);
  input.addEventListener('change', render);
});

render();
