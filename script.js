const poster = document.getElementById('poster');
const autoBtn = document.getElementById('auto-btn');
const arcadeBtn = document.getElementById('arcade-btn');
const lever = document.getElementById('lever');

const startRun = () => {
  if (!poster) return;
  poster.classList.remove('run');
  void poster.offsetWidth;
  poster.classList.add('run');
};

[autoBtn, arcadeBtn, lever].forEach((control) => {
  if (!control) return;
  control.addEventListener('click', startRun);
});
