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
let selectedDate = new Date();
let currentPlan = null;

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

// ─── DATE PICKER ────────────────────────────────
function initDatePicker() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sel = new Date(selectedDate);
  sel.setHours(0, 0, 0, 0);
  const isToday = sel.getTime() === today.getTime();
  const dateStr = selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const label = isToday ? dateStr + ' · Today' : dateStr;
  document.getElementById('date-picker').innerHTML = `
    <div class="date-nav">
      <button class="date-nav-btn" onclick="shiftDate(-1)">‹</button>
      <span class="date-nav-label">${label}</span>
      <button class="date-nav-btn" onclick="shiftDate(1)">›</button>
    </div>`;
}

function shiftDate(delta) {
  selectedDate = new Date(selectedDate);
  selectedDate.setDate(selectedDate.getDate() + delta);
  initDatePicker();
  initChecklist();
  initTodayTraining();
}

// ─── TODAY'S TRAINING DATA ──────────────────────
const TODAY_WORKOUT = {
  0: { type: 'rest', message: 'Rest day. Walk if possible. 10-min mobility flow on the Train page.' },
  4: { type: 'rest', message: 'Rest day. Walk if possible. 10-min mobility flow on the Train page.' },
  2: { type: 'cardio', message: 'Peloton Zone 2 · 35–45 min · 60–70% max HR (~114–133 bpm). Conversational pace.' },
  6: { type: 'cardio', message: 'Peloton · Zone 2 or HIIT. Weeks 1–6: Zone 2. Weeks 7+: alternate.' },
  1: {
    type: 'lift', day: 'a', label: 'Day A · Push', color: 'orange',
    warmup: [
      { name: 'Easy Peloton spin', sets: '3 min · no resistance' },
      { name: 'Arm Circles', sets: '10+10 each dir' },
      { name: 'Band Pull-Apart', sets: '15 reps' },
      { name: 'Wall Slides', sets: '10 reps' },
      { name: 'Thoracic Rotation', sets: '8/side' },
      { name: 'Push-Up Walkout', sets: '5 reps' },
    ],
    exercises: [
      { name: 'DB Floor Press', sets: '3×8–12' },
      { name: 'DB Overhead Press', sets: '3×8–12' },
      { name: 'Incline DB Press', sets: '3×10–12' },
      { name: 'Lateral Raises', sets: '3×12–15' },
      { name: 'Band Tricep Pushdown', sets: '3×12–15' },
      { name: 'Push-Ups', sets: '2×AMRAP' },
    ],
    mobility: [
      { name: 'Doorframe Chest Stretch', sets: '45s' },
      { name: 'Thoracic Extension', sets: '60–90s' },
      { name: "Child's Pose w/Lat Reach", sets: '30s center + each side' },
      { name: 'Pigeon / Figure-4', sets: '30–45s each side' },
    ],
  },
  3: {
    type: 'lift', day: 'b', label: 'Day B · Pull', color: 'pink',
    warmup: [
      { name: 'Easy Peloton spin', sets: '3 min · no resistance' },
      { name: 'Cat-Cow', sets: '10 reps' },
      { name: 'Band Pull-Apart', sets: '15 reps' },
      { name: 'Hip Hinge (broom handle)', sets: '10 reps' },
      { name: 'Scapular Retractions', sets: '15 reps' },
      { name: 'Dead Bug (slow)', sets: '6/side' },
    ],
    exercises: [
      { name: 'DB Bent-Over Row', sets: '3×8–12' },
      { name: 'Band Pull-Apart', sets: '3×15' },
      { name: 'DB Reverse Fly', sets: '3×12' },
      { name: 'Band Seated Row', sets: '3×12–15' },
      { name: 'DB Hammer Curl', sets: '3×10–12' },
      { name: 'DB Shrug', sets: '2×12' },
    ],
    mobility: [
      { name: "Child's Pose w/Lat Reach", sets: '30s center + each side' },
      { name: 'Thoracic Extension', sets: '60–90s' },
      { name: 'Single-Leg Hamstring Stretch', sets: '30–45s each side' },
      { name: 'Pigeon / Figure-4', sets: '30–45s each side' },
    ],
  },
  5: {
    type: 'lift', day: 'c', label: 'Day C · Legs + Core', color: 'green',
    warmup: [
      { name: 'Easy Peloton spin', sets: '3 min · no resistance' },
      { name: 'Glute Bridge', sets: '15 reps' },
      { name: '90/90 Hip Rotations', sets: '8/side' },
      { name: "World's Greatest Stretch", sets: '5/side' },
      { name: 'Band Lateral Walk', sets: '10/side' },
      { name: 'Bodyweight Goblet Squat', sets: '8 reps' },
    ],
    exercises: [
      { name: 'Goblet Squat', sets: '3×10–12' },
      { name: 'Romanian Deadlift', sets: '3×10–12' },
      { name: 'Reverse Lunge', sets: '3×10/leg' },
      { name: 'Band Lateral Walk', sets: '3×10 each' },
      { name: 'Plank', sets: '3×30–45s' },
      { name: 'Dead Bug', sets: '3×8/side' },
    ],
    mobility: [
      { name: 'Pigeon / Figure-4', sets: '45s each side' },
      { name: 'Single-Leg Hamstring Stretch', sets: '30–45s each side' },
      { name: '90/90 Hip Rotations', sets: '8/side' },
      { name: 'Thoracic Extension', sets: '60s' },
    ],
  },
};

// ─── DAILY CHECKLIST (home page) ───────────────
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEK_PLAN = {
  0: [{ label: 'Rest day — walk if possible' }, { label: 'Drink 1 gallon of water' }, { label: 'Hit protein target (185g)' }, { label: 'Track calories' }],
  1: [{ label: 'Complete full workout (warmup · lift · mobility)' }, { label: 'Drink 1 gallon of water' }, { label: 'Hit protein target (185g)' }, { label: 'Track calories' }],
  2: [{ label: 'Peloton Zone 2 (35–45 min)' }, { label: 'Drink 1 gallon of water' }, { label: 'Hit protein target (185g)' }, { label: 'Track calories' }],
  3: [{ label: 'Complete full workout (warmup · lift · mobility)' }, { label: 'Drink 1 gallon of water' }, { label: 'Hit protein target (185g)' }, { label: 'Track calories' }],
  4: [{ label: 'Rest day — walk if possible' }, { label: 'Drink 1 gallon of water' }, { label: 'Hit protein target (185g)' }, { label: 'Track calories' }],
  5: [{ label: 'Complete full workout (warmup · lift · mobility)' }, { label: 'Drink 1 gallon of water' }, { label: 'Hit protein target (185g)' }, { label: 'Track calories' }, { label: 'Weigh in (Friday!)' }],
  6: [{ label: 'Peloton (Zone 2 or HIIT)' }, { label: 'Drink 1 gallon of water' }, { label: 'Hit protein target (185g)' }, { label: 'Track calories' }],
};

function initChecklist() {
  const dayIdx = selectedDate.getDay();
  const key = 'checklist_' + selectedDate.toDateString();
  let checked = JSON.parse(localStorage.getItem(key) || '[]');
  const items = WEEK_PLAN[dayIdx] || WEEK_PLAN[0];
  const wrap = document.getElementById('today-check');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sel = new Date(selectedDate);
  sel.setHours(0, 0, 0, 0);
  const dayLabel = DAYS[dayIdx] + (sel.getTime() === today.getTime() ? ' — Today' : ', ' + selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  wrap.innerHTML = `
    <div class="check-day">
      <div class="check-day-header">
        <div class="check-day-title">${dayLabel}</div>
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

// ─── MOVEMENT / ITEM HELPERS ────────────────────
function exKey(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function getSides(setsStr) {
  if (/center.+(?:each\s+)?side/i.test(setsStr)) return ['Center', 'Left side', 'Right side'];
  if (/each\s+side|\/side\b|per\s+side/i.test(setsStr)) return ['Left side', 'Right side'];
  return null;
}

function parseTimerDuration(setsStr) {
  const minMatch = setsStr.match(/(\d+)\s*min/i);
  if (minMatch) return parseInt(minMatch[1]) * 60;
  const secMatch = setsStr.match(/(\d+)\s*s(?:\b|$)/i);
  if (secMatch) return parseInt(secMatch[1]);
  return 0;
}

function formatTimerLabel(seconds) {
  if (seconds >= 60) return Math.floor(seconds / 60) + ' min';
  return seconds + 's';
}

// ─── SECTION COUNT HELPERS ──────────────────────
function getSectionCounts(section, items) {
  let total = 0, done = 0;
  const dateStr = selectedDate.toDateString();
  items.forEach(item => {
    const k = exKey(item.name);
    const sides = getSides(item.sets);
    const n = sides ? sides.length : 1;
    total += n;
    for (let i = 0; i < n; i++) {
      if (localStorage.getItem('item_done_' + section + '_' + k + '_' + i + '_' + dateStr)) done++;
    }
  });
  return { total, done };
}

function getExSectionCounts(exercises) {
  let total = 0, done = 0;
  exercises.forEach(item => {
    const k = exKey(item.name);
    const n = parseSetCount(item.sets);
    total += n;
    done += getSetsDone(k, n);
  });
  return { total, done };
}

function updateSectionCount(section) {
  if (!currentPlan) return;
  const el = document.getElementById('sec-count-' + section);
  if (!el) return;
  let c;
  if (section === 'ex') {
    c = getExSectionCounts(currentPlan.exercises);
  } else {
    const items = section === 'wu' ? currentPlan.warmup : currentPlan.mobility;
    c = getSectionCounts(section, items);
  }
  el.textContent = c.done + '/' + c.total;
}

// ─── EXERCISE SET TRACKING ──────────────────────
function parseSetCount(setsStr) {
  const m = setsStr.match(/^(\d+)/);
  return m ? parseInt(m[1]) : 1;
}

function parseRepTarget(setsStr) {
  const m = setsStr.match(/[×x](.+)$/);
  return m ? m[1] : '';
}

function getSetsDone(k, numSets) {
  let done = 0;
  const dateStr = selectedDate.toDateString();
  for (let i = 0; i < numSets; i++) {
    if (localStorage.getItem('ex_set_done_' + k + '_' + i + '_' + dateStr)) done++;
  }
  return done;
}

function saveSetWeight(k, idx, val) {
  if (val && val.trim()) {
    const dateStr = selectedDate.toDateString();
    localStorage.setItem('ex_set_weight_' + k + '_' + idx + '_' + dateStr, val.trim());
    localStorage.setItem('ex_weight_' + k, val.trim());
  }
}

function saveSetReps(k, idx, val) {
  if (val) localStorage.setItem('ex_set_reps_' + k + '_' + idx + '_' + selectedDate.toDateString(), val);
}

function markSetDone(k, idx, numSets, e) {
  e.stopPropagation();
  const dateStr = selectedDate.toDateString();
  localStorage.setItem('ex_set_done_' + k + '_' + idx + '_' + dateStr, '1');

  const row = document.getElementById('set-row-' + k + '-' + idx);
  let wVal = '', rVal = '';
  if (row) {
    const wInput = row.querySelector('.set-weight-input');
    const rInput = row.querySelector('.set-reps-input');
    wVal = wInput ? (wInput.value.trim() || wInput.placeholder) : '';
    rVal = rInput ? (rInput.value || rInput.placeholder) : '';
    if (wVal && wVal !== 'wt') saveSetWeight(k, idx, wVal);
    if (rVal && rVal !== 'reps') saveSetReps(k, idx, rVal);
    if (rVal && rVal !== 'reps') localStorage.setItem('ex_last_reps_' + k, rVal);
    row.classList.add('done');
    const btn = row.querySelector('.set-complete-btn');
    if (btn) { btn.textContent = '✓'; btn.classList.add('done'); }
  }

  // Propagate weight and reps to remaining undone sets
  for (let j = idx + 1; j < numSets; j++) {
    const nextRow = document.getElementById('set-row-' + k + '-' + j);
    if (!nextRow || nextRow.classList.contains('done')) continue;
    const nextW = nextRow.querySelector('.set-weight-input');
    const nextR = nextRow.querySelector('.set-reps-input');
    if (nextW && !nextW.value && wVal && wVal !== 'wt') nextW.value = wVal;
    if (nextR && !nextR.value && rVal && rVal !== 'reps') nextR.value = rVal;
  }

  const doneCount = getSetsDone(k, numSets);
  const badge = document.getElementById('sc-' + k);
  if (badge) badge.textContent = doneCount + '/' + numSets;

  updateSectionCount('ex');
  startRest();
}

function toggleSetDone(k, idx, numSets, e) {
  e.stopPropagation();
  const dateStr = selectedDate.toDateString();
  const doneKey = 'ex_set_done_' + k + '_' + idx + '_' + dateStr;
  if (localStorage.getItem(doneKey)) {
    localStorage.removeItem(doneKey);
    const row = document.getElementById('set-row-' + k + '-' + idx);
    if (row) {
      row.classList.remove('done');
      const btn = row.querySelector('.set-complete-btn');
      if (btn) { btn.textContent = 'Done'; btn.classList.remove('done'); }
    }
    const doneCount = getSetsDone(k, numSets);
    const badge = document.getElementById('sc-' + k);
    if (badge) badge.textContent = doneCount > 0 ? doneCount + '/' + numSets : '';
    updateSectionCount('ex');
  } else {
    markSetDone(k, idx, numSets, e);
  }
}

function resetExercise(k, numSets, e) {
  e.stopPropagation();
  const dateStr = selectedDate.toDateString();
  const savedWeight = localStorage.getItem('ex_weight_' + k) || '';
  for (let i = 0; i < numSets; i++) {
    localStorage.removeItem('ex_set_done_' + k + '_' + i + '_' + dateStr);
    localStorage.removeItem('ex_set_reps_' + k + '_' + i + '_' + dateStr);
    localStorage.removeItem('ex_set_weight_' + k + '_' + i + '_' + dateStr);
    const row = document.getElementById('set-row-' + k + '-' + i);
    if (row) {
      row.classList.remove('done');
      const btn = row.querySelector('.set-complete-btn');
      if (btn) { btn.textContent = 'Done'; btn.classList.remove('done'); }
      const wInput = row.querySelector('.set-weight-input');
      const rInput = row.querySelector('.set-reps-input');
      if (wInput) { wInput.value = savedWeight; }
      if (rInput) { rInput.value = ''; }
    }
  }
  const badge = document.getElementById('sc-' + k);
  if (badge) badge.textContent = '';
  updateSectionCount('ex');
}

// ─── WARMUP / MOBILITY ITEM TRACKING ───────────
function toggleItemDone(section, k, sideIdx, e) {
  if (e) e.stopPropagation();
  const dateStr = selectedDate.toDateString();
  const storeKey = 'item_done_' + section + '_' + k + '_' + sideIdx + '_' + dateStr;
  const wasDone = !!localStorage.getItem(storeKey);
  if (wasDone) {
    localStorage.removeItem(storeKey);
  } else {
    localStorage.setItem(storeKey, '1');
  }
  const rowEl = document.getElementById('item-row-' + section + '-' + k + '-' + sideIdx);
  if (rowEl) {
    rowEl.classList.toggle('done', !wasDone);
    const btn = rowEl.querySelector('.item-done-btn');
    if (btn) { btn.textContent = wasDone ? 'Done' : '✓'; btn.classList.toggle('done', !wasDone); }
  }
  // Update per-item badge
  const countEl = document.getElementById('item-count-' + section + '-' + k);
  if (countEl) {
    const total = parseInt(countEl.dataset.total);
    let done = 0;
    for (let i = 0; i < total; i++) {
      if (localStorage.getItem('item_done_' + section + '_' + k + '_' + i + '_' + dateStr)) done++;
    }
    countEl.textContent = done > 0 ? done + '/' + total : '';
  }
  updateSectionCount(section);
}

function toggleExRow(el) {
  if (event && (event.target.tagName === 'INPUT' || event.target.tagName === 'BUTTON')) return;
  el.classList.toggle('expanded');
}

// ─── REST / COUNTDOWN TIMER ─────────────────────
let restTimer = null;
let timerCompleteCallback = null;

function startRest(duration, label, onComplete) {
  if (restTimer) { clearInterval(restTimer); restTimer = null; }
  duration = duration || 60;
  timerCompleteCallback = onComplete || null;
  let remaining = duration;
  const overlay = document.getElementById('rest-timer');
  const countdownEl = document.getElementById('rest-countdown');
  const barEl = document.getElementById('rest-bar');
  const labelEl = document.getElementById('rest-label');
  const btnEl = document.getElementById('rest-done-btn');

  if (labelEl) labelEl.textContent = label || 'Rest';
  if (btnEl) btnEl.textContent = label ? 'Skip' : 'End rest early';

  barEl.style.transition = 'none';
  barEl.style.width = '100%';
  barEl.offsetWidth; // force reflow

  overlay.classList.add('active');
  countdownEl.textContent = remaining;

  barEl.style.transition = 'width 0.95s linear';
  barEl.style.width = ((duration - 1) / duration * 100) + '%';

  restTimer = setInterval(() => {
    remaining--;
    countdownEl.textContent = remaining;
    barEl.style.width = (remaining / duration * 100) + '%';
    if (remaining <= 0) endRest(true);
  }, 1000);
}

function startTimer(seconds, section, k, sideIdx, e) {
  if (e) e.stopPropagation();
  let name = '';
  if (currentPlan) {
    const items = section === 'wu' ? currentPlan.warmup : currentPlan.mobility;
    const item = items.find(it => exKey(it.name) === k);
    if (item) name = item.name;
  }
  startRest(seconds, name, () => {
    const dateStr = selectedDate.toDateString();
    const storeKey = 'item_done_' + section + '_' + k + '_' + sideIdx + '_' + dateStr;
    if (!localStorage.getItem(storeKey)) {
      toggleItemDone(section, k, sideIdx, null);
    }
  });
}

function endRest(natural) {
  if (restTimer) { clearInterval(restTimer); restTimer = null; }
  document.getElementById('rest-timer').classList.remove('active');
  if (natural && timerCompleteCallback) timerCompleteCallback();
  timerCompleteCallback = null;
}

// ─── TODAY'S TRAINING (home page) ──────────────
function initTodayTraining() {
  const today = selectedDate.getDay();
  const plan = TODAY_WORKOUT[today];
  const wrap = document.getElementById('today-training');
  currentPlan = null;
  if (!plan) return;

  if (plan.type === 'rest' || plan.type === 'cardio') {
    wrap.innerHTML = `<div class="training-rest-msg">${plan.message}</div>`;
    return;
  }

  currentPlan = plan;
  const dateStr = selectedDate.toDateString();

  // ── Interactive warmup/mobility rows ──
  const renderInteractiveList = (items, section) => items.map(item => {
    const k = exKey(item.name);
    const sides = getSides(item.sets);
    const timerSecs = parseTimerDuration(item.sets);
    const sideLabels = sides || [''];
    const numSides = sideLabels.length;
    let doneCount = 0;

    const rows = sideLabels.map((label, i) => {
      const isDone = !!localStorage.getItem('item_done_' + section + '_' + k + '_' + i + '_' + dateStr);
      if (isDone) doneCount++;
      const timerBtn = timerSecs
        ? `<button class="item-timer-btn" onclick="startTimer(${timerSecs}, '${section}', '${k}', ${i}, event)">▶ ${formatTimerLabel(timerSecs)}</button>`
        : '';
      return `
        <div class="item-row ${isDone ? 'done' : ''}" id="item-row-${section}-${k}-${i}">
          <span class="item-side-label">${label}</span>
          ${timerBtn}
          <button class="item-done-btn ${isDone ? 'done' : ''}"
            onclick="toggleItemDone('${section}', '${k}', ${i}, event)">
            ${isDone ? '✓' : 'Done'}
          </button>
        </div>`;
    }).join('');

    return `
      <div class="today-ex-row expandable" onclick="toggleExRow(this)">
        <div class="today-ex-main">
          <span class="today-ex-name">${item.name}</span>
          <div class="today-ex-right">
            <span class="today-ex-count" id="item-count-${section}-${k}" data-total="${numSides}">${doneCount > 0 ? doneCount + '/' + numSides : ''}</span>
            <span class="today-ex-sets">${item.sets}</span>
          </div>
        </div>
        <div class="today-ex-drawer">
          <div class="today-ex-drawer-inner">${rows}</div>
        </div>
      </div>`;
  }).join('');

  // ── Exercise rows with set tracking ──
  const renderExerciseList = items => items.map(item => {
    const k = exKey(item.name);
    const numSets = parseSetCount(item.sets);
    const repTarget = parseRepTarget(item.sets);
    const savedWeight = localStorage.getItem('ex_weight_' + k) || '';
    const lastReps = localStorage.getItem('ex_last_reps_' + k) || '';
    const lastText = [savedWeight, lastReps ? lastReps + ' reps' : ''].filter(Boolean).join(' · ');
    const doneCount = getSetsDone(k, numSets);

    const setRows = Array.from({ length: numSets }, (_, i) => {
      const isDone = !!localStorage.getItem('ex_set_done_' + k + '_' + i + '_' + dateStr);
      const savedReps = localStorage.getItem('ex_set_reps_' + k + '_' + i + '_' + dateStr) || '';
      const savedSetWeight = localStorage.getItem('ex_set_weight_' + k + '_' + i + '_' + dateStr) || savedWeight;
      return `
        <div class="set-row ${isDone ? 'done' : ''}" id="set-row-${k}-${i}">
          <span class="set-num">Set ${i + 1}</span>
          <input type="text" inputmode="text" class="set-weight-input" placeholder="${savedSetWeight || 'wt'}"
            ${savedSetWeight ? 'value="' + savedSetWeight + '"' : ''}
            onclick="event.stopPropagation()"
            onchange="saveSetWeight('${k}', ${i}, this.value)">
          <input type="number" inputmode="numeric" class="set-reps-input" placeholder="${savedReps || lastReps || repTarget || 'reps'}"
            ${savedReps ? 'value="' + savedReps + '"' : ''}
            onclick="event.stopPropagation()"
            onchange="saveSetReps('${k}', ${i}, this.value)">
          <button class="set-complete-btn ${isDone ? 'done' : ''}"
            onclick="toggleSetDone('${k}', ${i}, ${numSets}, event)">
            ${isDone ? '✓' : 'Done'}
          </button>
        </div>`;
    }).join('');

    return `
      <div class="today-ex-row expandable" onclick="toggleExRow(this)">
        <div class="today-ex-main">
          <span class="today-ex-name">${item.name}</span>
          <div class="today-ex-right">
            <span class="today-ex-count" id="sc-${k}">${doneCount > 0 ? doneCount + '/' + numSets : ''}</span>
            <span class="today-ex-sets">${item.sets}</span>
          </div>
        </div>
        <div class="today-ex-drawer">
          <div class="today-ex-drawer-inner">
            <div class="drawer-top-bar">
              <span class="last-session">${lastText ? 'Last: ' + lastText : ''}</span>
              <button class="ex-reset-btn" onclick="resetExercise('${k}', ${numSets}, event)">Reset</button>
            </div>
            <div class="set-rows-header">
              <span></span>
              <span class="set-col-label">Weight</span>
              <span class="set-col-label">Reps</span>
              <span></span>
            </div>
            ${setRows}
          </div>
        </div>
      </div>`;
  }).join('');

  // ── Compute section counts for headers ──
  const wuC = getSectionCounts('wu', plan.warmup);
  const exC = getExSectionCounts(plan.exercises);
  const mobC = getSectionCounts('mob', plan.mobility);

  wrap.innerHTML = `
    <div class="accordion">
      <div class="acc-header" onclick="toggleAcc(this)">
        <div class="acc-stripe ${plan.color}"></div>
        <div class="acc-meta">
          <div class="acc-tag">Step 1</div>
          <div class="acc-title-wrap">
            <div class="acc-title">Warm Up</div>
            <div class="acc-sec-count" id="sec-count-wu">${wuC.done}/${wuC.total}</div>
          </div>
        </div>
        <div class="acc-arrow">▾</div>
      </div>
      <div class="acc-body">${renderInteractiveList(plan.warmup, 'wu')}</div>
    </div>
    <div class="accordion">
      <div class="acc-header" onclick="toggleAcc(this)">
        <div class="acc-stripe ${plan.color}"></div>
        <div class="acc-meta">
          <div class="acc-tag">Step 2</div>
          <div class="acc-title-wrap">
            <div class="acc-title">Workout · ${plan.label}</div>
            <div class="acc-sec-count" id="sec-count-ex">${exC.done}/${exC.total}</div>
          </div>
        </div>
        <div class="acc-arrow">▾</div>
      </div>
      <div class="acc-body">${renderExerciseList(plan.exercises)}</div>
    </div>
    <div class="accordion">
      <div class="acc-header" onclick="toggleAcc(this)">
        <div class="acc-stripe green"></div>
        <div class="acc-meta">
          <div class="acc-tag">Step 3</div>
          <div class="acc-title-wrap">
            <div class="acc-title">Mobility</div>
            <div class="acc-sec-count" id="sec-count-mob">${mobC.done}/${mobC.total}</div>
          </div>
        </div>
        <div class="acc-arrow">▾</div>
      </div>
      <div class="acc-body">${renderInteractiveList(plan.mobility, 'mob')}</div>
    </div>`;
}

// ─── WORKOUT MOVEMENT TRACKING (Train page) ────

function getMovCheckKey(day) {
  return 'workout_check_' + day + '_' + new Date().toDateString();
}

function getMovChecked(day) {
  return JSON.parse(localStorage.getItem(getMovCheckKey(day)) || '[]');
}

function toggleMovement(el, day) {
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
  document.querySelectorAll('[data-check-id]').forEach(el => {
    const id = el.dataset.checkId;
    if (!id.startsWith(day + '-')) return;
    const isDone = checked.includes(id);
    el.classList.toggle('done', isDone);
    const box = el.querySelector('.mov-check');
    if (box) box.textContent = isDone ? '✓' : '';
  });

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

// ─── EXERCISE WEIGHTS (Train page) ─────────────

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
initDatePicker();
initChecklist();
initTodayTraining();
initWorkoutChecks();
