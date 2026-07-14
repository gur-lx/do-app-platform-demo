// Because the app.yaml routes the API component under the /api path
// prefix on the same app domain, we can call it with a relative path —
// no CORS setup or hardcoded URLs needed once deployed on App Platform.
const API_BASE = '/api/entries';

const form = document.getElementById('entry-form');
const titleInput = document.getElementById('title');
const contentInput = document.getElementById('content');
const entriesList = document.getElementById('entries');
const statusEl = document.getElementById('status');

async function loadEntries() {
  statusEl.textContent = '';
  try {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    const entries = await res.json();
    renderEntries(entries);
  } catch (err) {
    statusEl.textContent = `Could not load entries: ${err.message}`;
  }
}

function renderEntries(entries) {
  entriesList.innerHTML = '';
  if (entries.length === 0) {
    entriesList.innerHTML = '<li>No entries yet. Add your first one above.</li>';
    return;
  }
  for (const entry of entries) {
    const li = document.createElement('li');
    li.innerHTML = `
      <h3>${escapeHtml(entry.title)}</h3>
      <p>${escapeHtml(entry.content || '')}</p>
      <time>${new Date(entry.created_at).toLocaleString()}</time>
      <button class="delete-btn" data-id="${entry.id}">Delete</button>
    `;
    entriesList.appendChild(li);
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  statusEl.textContent = '';
  const title = titleInput.value.trim();
  const content = contentInput.value.trim();
  if (!title) return;

  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content })
    });
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    titleInput.value = '';
    contentInput.value = '';
    loadEntries();
  } catch (err) {
    statusEl.textContent = `Could not save entry: ${err.message}`;
  }
});

entriesList.addEventListener('click', async (e) => {
  if (!e.target.classList.contains('delete-btn')) return;
  const id = e.target.dataset.id;
  try {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    loadEntries();
  } catch (err) {
    statusEl.textContent = `Could not delete entry: ${err.message}`;
  }
});

loadEntries();
