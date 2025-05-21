// === app.js ===
const form = document.getElementById('journal-form');
const entryText = document.getElementById('entry-text');
const entriesList = document.getElementById('entries-list');
const categoryTitle = document.getElementById('current-category-title');
const globalToggleBtn = document.getElementById('global-toggle');

let currentCategory = 'HTML';
let allEntries = [];

async function fetchEntries() {
  const response = await fetch('/api/entries');
  allEntries = await response.json();
  renderEntries();
}

function renderEntries() {
  entriesList.innerHTML = '';
  allEntries
    .filter(entry => entry.category === currentCategory)
    .forEach((entry) => {
      const li = document.createElement('li');
      const encoded = encodeURIComponent(entry.text);

      li.innerHTML = `
        <div id="entry-${entry.id}" class="entry-container" style="max-width: 100%; word-wrap: break-word; padding: 10px; border: 1px solid #ccc; margin-bottom: 10px;">
          <div>
            <div id="entry-text-${entry.id}" data-raw="${encoded}" data-mode="html">${entry.text}</div>
          </div>
          <button onclick="startEdit(${entry.id})">Edit</button>
          <button onclick="deleteEntry(${entry.id})">Delete</button>
        </div>
      `;

      entriesList.appendChild(li);
    });
}

async function addEntry(text, category) {
  const response = await fetch('/api/entries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, category })
  });

  if (!response.ok) {
    console.error('Failed to add entry');
    return;
  }

  await fetchEntries();
}

async function deleteEntry(id) {
  await fetch(`/api/entries/${id}`, { method: 'DELETE' });
  fetchEntries();
}

function startEdit(id) {
  const container = document.getElementById(`entry-${id}`);
  const textElement = document.getElementById(`entry-text-${id}`);
  const rawText = decodeURIComponent(textElement.getAttribute('data-raw') || '');

  container.innerHTML = '';

  const textarea = document.createElement('textarea');
  textarea.id = `edit-input-${id}`;
  textarea.rows = 8;
  textarea.style.width = '100%';
  textarea.value = rawText;

  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Save';
  saveBtn.onclick = () => saveEdit(id);

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.onclick = () => fetchEntries();

  container.appendChild(textarea);
  container.appendChild(document.createElement('br'));
  container.appendChild(saveBtn);
  container.appendChild(cancelBtn);
}

async function saveEdit(id) {
  const input = document.getElementById(`edit-input-${id}`);
  const newText = input.value.trim();

  if (newText) {
    await fetch(`/api/entries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: newText })
    });
    showToast('✅ Note updated!');
    await fetchEntries();
    highlightEntry(id);
  }
}

function highlightEntry(id) {
  const container = document.getElementById(`entry-${id}`);
  if (container) {
    container.style.backgroundColor = '#d4edda';
    setTimeout(() => {
      container.style.backgroundColor = '';
    }, 1500);
  }
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.innerText = message;
  toast.style.position = 'fixed';
  toast.style.bottom = '20px';
  toast.style.right = '20px';
  toast.style.backgroundColor = '#333';
  toast.style.color = 'white';
  toast.style.padding = '10px 20px';
  toast.style.borderRadius = '6px';
  toast.style.zIndex = '9999';
  toast.style.opacity = '0.95';
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 2000);
}

form.addEventListener('submit', function(e) {
  e.preventDefault();
  const text = entryText.value.trim();
  if (text !== '') {
    addEntry(text, currentCategory); // use the selected category tab
    entryText.value = 'Theme:\n';
  }
});

function switchCategory(category) {
  currentCategory = category;
  categoryTitle.innerText = `${category} Entries`;
  fetchEntries();
}

globalToggleBtn.addEventListener('click', () => {
  const allEntries = document.querySelectorAll('[id^="entry-text-"]');
  allEntries.forEach(el => {
    const isHtml = el.getAttribute('data-mode') === 'html';
    const raw = decodeURIComponent(el.getAttribute('data-raw'));

    if (isHtml) {
      el.innerHTML = raw
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>');
      el.setAttribute('data-mode', 'plain');
    } else {
      el.innerHTML = raw;
      el.setAttribute('data-mode', 'html');
    }
  });
});

fetchEntries();
