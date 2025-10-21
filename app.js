/*
 * While running wrangler dev, the index.html file injects window.API_BASE
 * with the local URL (from .dev.vars, e.g. https://127.0.0.1:8787) and
 * app.js reads that value to call the local API.
 *
 * In production, the index.html either sets window.API_BASE to the
 * production Workers URL or leaves it undefined, and app.js falls back to
 * the hard‑coded production URL if window.API_BASE is missing. -->
 *
 */
const API_BASE =
  typeof window !== 'undefined' && window.API_BASE
    ? window.API_BASE
    : 'https://greetings-and-worlds-api.brian-mabry-edwards.workers.dev';

let greetings = [];
let audiences = [];
let combos = [];

function showSpinner() {
  document.getElementById('loading-spinner').style.display = 'flex';
}

function hideSpinner() {
  document.getElementById('loading-spinner').style.display = 'none';
}

function showError(elementId, message) {
  const errorEl = document.getElementById(elementId);
  if (!errorEl) return;
  errorEl.textContent = message;
  setTimeout(() => {
    errorEl.textContent = '';
  }, 5000);
}

async function fetchAPI(endpoint, options = {}) {
  console.log(`Fetching ${endpoint}...`);
  showSpinner();

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Success:', data);
    return data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  } finally {
    hideSpinner();
  }
}

async function loadGreetings() {
  try {
    const data = await fetchAPI('/api/greetings');
    greetings = data;
    updateGreetingSelect();
  } catch {
    showError('greeting-error', 'Failed to load greetings');
  }
}

async function loadAudiences() {
  try {
    const data = await fetchAPI('/api/audiences');
    audiences = data;
    updateAudienceSelect();
  } catch {
    showError('audience-error', 'Failed to load audiences');
  }
}

async function loadCombos() {
  try {
    const data = await fetchAPI('/api/combos');
    combos = data;
    renderCombos(combos);
  } catch {
    showError('combo-error', 'Failed to load combos');
  }
}

function updateGreetingSelect() {
  const select = document.getElementById('greeting-select');
  select.innerHTML = '<option value="">-- Choose Greeting --</option>';

  greetings.forEach(g => {
    const option = document.createElement('option');
    option.value = g.id;
    option.textContent = g.text;
    select.appendChild(option);
  });
}

function updateAudienceSelect() {
  const select = document.getElementById('audience-select');
  select.innerHTML = '<option value="">-- Choose Audience --</option>';

  audiences.forEach(a => {
    const option = document.createElement('option');
    option.value = a.id;
    option.textContent = a.text;
    select.appendChild(option);
  });
}

function renderCombos(combosToRender) {
  const container = document.getElementById('combos-list');

  if (combosToRender.length === 0) {
    container.innerHTML = '<p class="empty-state">No combos found</p>';
    return;
  }

  container.innerHTML = '';
  combosToRender.forEach(combo => {
    const comboEl = document.createElement('div');
    comboEl.className = 'combo-item';
    comboEl.innerHTML = `
      <div class="combo-text">${combo.greeting_text}, ${combo.audience_text}!</div>
      <div class="combo-meta">Greeting ID: ${combo.greeting_id}, Audience ID: ${combo.audience_id}</div>
    `;
    container.appendChild(comboEl);
  });
}

function filterCombos(query) {
  const filtered = combos.filter(combo => {
    const searchText = `${combo.greeting_text} ${combo.audience_text}`.toLowerCase();
    return searchText.includes(query.toLowerCase());
  });
  renderCombos(filtered);
}

async function addGreeting() {
  const input = document.getElementById('greeting-input');
  const text = input.value.trim();

  if (!text) {
    showError('greeting-error', 'Please enter a greeting');
    return;
  }

  try {
    await fetchAPI('/api/greetings', {
      method: 'POST',
      body: JSON.stringify({ text })
    });

    input.value = '';
    await loadGreetings();
  } catch {
    showError('greeting-error', 'Failed to add greeting');
  }
}

async function addAudience() {
  const input = document.getElementById('audience-input');
  const text = input.value.trim();

  if (!text) {
    showError('audience-error', 'Please enter an audience');
    return;
  }

  try {
    await fetchAPI('/api/audiences', {
      method: 'POST',
      body: JSON.stringify({ text })
    });

    input.value = '';
    await loadAudiences();
  } catch {
    showError('audience-error', 'Failed to add audience');
  }
}

async function init() {
  console.log('Initializing application...');
  await Promise.all([
    loadGreetings(),
    loadAudiences(),
    loadCombos()
  ]);
  console.log('Application ready');
}

if (typeof window !== 'undefined') {
  init();
}

async function createCombo() {
  const greetingId = document.getElementById('greeting-select').value;
  const audienceId = document.getElementById('audience-select').value;

  if (!greetingId || !audienceId) {
    showError('combo-error', 'Please select both greeting and audience');
    return;
  }

  try {
    await fetchAPI('/api/combos', {
      method: 'POST',
      body: JSON.stringify({
        greeting_id: parseInt(greetingId),
        audience_id: parseInt(audienceId)
      })
    });

    document.getElementById('greeting-select').value = '';
    document.getElementById('audience-select').value = '';
    await loadCombos();
  } catch {
    showError('combo-error', 'Failed to create combo (may already exist)');
  }
}

export {
  fetchAPI,
  loadGreetings,
  loadAudiences,
  loadCombos,
  filterCombos,
  addGreeting,
  addAudience,
  createCombo,
  showError
};

export function initApp() {
  document.getElementById('add-greeting-btn')?.addEventListener('click', addGreeting);
  document.getElementById('add-audience-btn')?.addEventListener('click', addAudience);
  document.getElementById('create-combo-btn')?.addEventListener('click', createCombo);
  document.getElementById('greeting-input')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addGreeting();
  });
  document.getElementById('audience-input')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addAudience();
  });
  document.getElementById('filter-input')?.addEventListener('input', (e) => filterCombos(e.target.value));

  // Load initial data
  loadGreetings();
  loadAudiences();
  loadCombos();
}

// Only auto-initialize if not in a test environment
if (typeof process === 'undefined' || process.env.NODE_ENV !== 'test') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
}
