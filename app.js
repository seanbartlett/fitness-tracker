// ─── NAV ───────────────────────────────────────
function goTo(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  const navBtn = document.getElementById('nav-' + id);
  if (navBtn) navBtn.classList.add('active');
  window.scrollTo(0, 0);
}

// ─── ACCORDION ─────────────────────────────────
function toggleAcc(header) {
  const body = header.nextElementSibling;
  const isOpen = header.classList.contains('open');
  header.classList.toggle('open', !isOpen);
  body.classList.toggle('open', !isOpen);
}

// ─── WARMUP TABS ───────────────────────────────
function showDay(day, btn, cls) {
  document.querySelectorAll('.day-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.day-tab').forEach(b => b.classList.remove('act-a', 'act-b', 'act-c'));
  document.getElementById('day-' + day).classList.add('active');
  btn.classList.add(cls);
}

// ─── WEIGHT TRACKER (body weight log) ──────────
const START = 282, GOAL = 222;
let entries = JSON.parse(localStorage.getItem('weight_log') || '[]');

function logWeight() {
  const val = parseFloat(document.getElementById('weight-input').value);
  if (!val || val < 100 || val > 500) return;
  const entry = { date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), weight: val, ts: Date.now() };
  entries.unshift(entry);
  localStorage.setItem('weight_log', JSON.stringify(entries));
  document.getElementById('weight-input').value = '';
  renderLog();
  updateProgress();
}

function renderLog() {
  const el = document.getElementById('log-list');
  if (!entries.length) { el.innerHTML = '<div class="empty-state">No entries yet. Log your first weight above.</div>'; return; }
  el.innerHTML = '<div class="log-list">' + entries.map((e, i) => {
    const prev = entries[i + 1];
    let delta = '', cls = 'same';
    if (prev) {
      const diff = e.weight - prev.weight;
      if (diff < 0) { delta = diff.toFixed(1); cls = 'down'; }
      else if (diff > 0) { delta = '+' + diff.toFixed(1); cls = 'up'; }
      else { delta = '—'; }
    }
    return `<div class="log-entry">
      <div class="log-date">${e.date}</div>
      <div style="display:flex;align-items:center;gap:12px;">
        ${delta ? `<div class="log-delta ${cls}">${delta}</div>` : ''}
        <div class="log-weight">${e.weight} <span style="font-size:13px;color:var(--ink3)">lbs</span></div>
      </div>
    </div>`;
  }).join('') + '</div>';
}

function updateProgress() {
  if (!entries.length) return;
  const current = entries[0].weight;
  const lost = Math.max(0, START - current);
  const totalNeeded = START - GOAL;
  const pct = Math.min(100, (lost / totalNeeded) * 100).toFixed(1);
  const togo = Math.max(0, current - GOAL);

  document.getElementById('progress-wrap').style.display = 'block';
  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('progress-pct').textContent = pct + '% complete';
  document.getElementById('current-display').textContent = current + ' lbs';
  document.getElementById('lost-display').textContent = lost.toFixed(1) + ' lbs';
  document.getElementById('togo-display').textContent = togo.toFixed(1) + ' lbs';

  document.getElementById('hero-current').innerHTML = current + ' <span>lbs</span>';
  document.getElementById('home-progress-fill').style.width = pct + '%';
  document.getElementById('home-progress-pct').textContent = pct + '% complete';
}

// ─── DAILY CHECKLIST (home page) ───────────────
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEK_PLAN = {
  0: [{ label: 'Rest day — walk if possible' }, { label: 'Drink 1 gallon of water' }, { label: 'Hit protein target (185g)' }, { label: 'Track calories' }],
  1: [{ label: 'Push workout (45 min)' }, { label: 'Warm up before lifting' }, { label: 'Mobility after lifting (5 min)' }, { label: 'Drink 1 gallon of water' }, { label: 'Hit protein target (185g)' }, { label: 'Track calories' }],
  2: [{ label: 'Peloton Zone 2 (35–45 min)' }, { label: 'Drink 1 gallon of water' }, { label: 'Hit protein target (185g)' }, { label: 'Track calories' }],
  3: [{ label: 'Pull workout (45 min)' }, { label: 'Warm up before lifting' }, { label: 'Mobility after lifting (5 min)' }, { label: 'Drink 1 gallon of water' }, { label: 'Hit protein target (185g)' }, { label: 'Track calories' }],
  4: [{ label: 'Rest day — walk if possible' }, { label: 'Drink 1 gallon of water' }, { label: 'Hit protein target (185g)' }, { label: 'Track calories' }],
  5: [{ label: 'Legs + Core workout (45 min)' }, { label: 'Warm up before lifting' }, { label: 'Mobility after lifting (5 min)' }, { label: 'Drink 1 gallon of water' }, { label: 'Hit protein target (185g)' }, { label: 'Track calories' }, { label: 'Weigh in (Friday!)' }],
  6: [{ label: 'Peloton (Zone 2 or HIIT)' }, { label: 'Drink 1 gallon of water' }, { label: 'Hit protein target (185g)' }, { label: 'Track calories' }],
};

function initChecklist() {
  const today = new Date().getDay();
  const key = 'checklist_' + new Date().toDateString();
  let checked = JSON.parse(localStorage.getItem(key) || '[]');
  const items = WEEK_PLAN[today] || WEEK_PLAN[0];
  const wrap = document.getElementById('today-check');
  wrap.innerHTML = `
    <div class="check-day">
      <div class="check-day-header">
        <div class="check-day-title">${DAYS[today]} — Today</div>
        <div class="check-day-badge" id="check-badge">${checked.length}/${items.length}</div>
      </div>
      ${items.map((item, i) => `
        <div class="check-item ${checked.includes(i) ? 'done' : ''}" onclick="toggleCheck(${i}, '${key}', ${items.length})">
          <div class="check-box">${checked.includes(i) ? '✓' : ''}</div>
          <div class="check-label">${item.label}</div>
        </div>
      `).join('')}
    </div>`;
}

function toggleCheck(idx, key, total) {
  let checked = JSON.parse(localStorage.getItem(key) || '[]');
  if (checked.includes(idx)) { checked = checked.filter(i => i !== idx); }
  else { checked.push(idx); }
  localStorage.setItem(key, JSON.stringify(checked));
  const items = document.querySelectorAll('.check-item');
  items.forEach((el, i) => {
    const isDone = checked.includes(i);
    el.classList.toggle('done', isDone);
    el.querySelector('.check-box').textContent = isDone ? '✓' : '';
  });
  document.getElementById('check-badge').textContent = checked.length + '/' + total;
}

// ─── WORKOUT MOVEMENT TRACKING ─────────────────

function getMovCheckKey(day) {
  return 'workout_check_' + day + '_' + new Date().toDateString();
}

function getMovChecked(day) {
  return JSON.parse(localStorage.getItem(getMovCheckKey(day)) || '[]');
}

function toggleMovement(el, day) {
  // Don't toggle if the click was on the weight input
  if (event && event.target.classList.contains('ex-weight-input')) return;
  const id = el.dataset.checkId;
  if (!id) return;
  let checked = getMovChecked(day);
  if (checked.includes(id)) {
    checked = checked.filter(x => x !== id);
  } else {
    checked.push(id);
  }
  localStorage.setItem(getMovCheckKey(day), JSON.stringify(checked));
  applyCheckedState(day, checked);
}

function applyCheckedState(day, checked) {
  // Apply .done class to all checkable elements for this day
  document.querySelectorAll('[data-check-id]').forEach(el => {
    const id = el.dataset.checkId;
    if (!id.startsWith(day + '-')) return;
    const isDone = checked.includes(id);
    el.classList.toggle('done', isDone);
    const box = el.querySelector('.mov-check');
    if (box) box.textContent = isDone ? '✓' : '';
  });

  // Update section count badges
  ['wu', 'ex', 'mob'].forEach(section => {
    const countEl = document.getElementById('cnt-' + day + '-' + section);
    if (!countEl) return;
    const prefix = day + '-' + section + '-';
    const total = document.querySelectorAll('[data-check-id^="' + prefix + '"]').length;
    const done = checked.filter(id => id.startsWith(prefix)).length;
    countEl.textContent = done + '/' + total;
  });
}

function initWorkoutChecks() {
  ['a', 'b', 'c'].forEach(day => {
    const checked = getMovChecked(day);
    applyCheckedState(day, checked);
  });
  loadWeights();
}

// ─── EXERCISE WEIGHTS ──────────────────────────

function saveWeight(input) {
  const val = input.value.trim();
  if (val && !isNaN(val)) {
    localStorage.setItem('ex_weight_' + input.dataset.key, val);
  }
}

function loadWeights() {
  document.querySelectorAll('.ex-weight-input').forEach(input => {
    const saved = localStorage.getItem('ex_weight_' + input.dataset.key);
    if (saved) input.value = saved;
  });
}

// ─── INIT ──────────────────────────────────────
renderLog();
updateProgress();
initChecklist();
initWorkoutChecks();
