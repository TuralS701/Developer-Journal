
const form = document.getElementById('journal-form');
const entryText = document.getElementById('entry-text');
const entryCategory = document.getElementById('entry-category');
const entriesList = document.getElementById('entries-list');
const categoryTitle = document.getElementById('current-category-title');

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
      li.innerHTML = `
        <div id="entry-${entry.id}" class="entry-container" style="max-width: 100%; word-wrap: break-word; padding: 10px; border: 1px solid #ccc; margin-bottom: 10px;">
          <p id="entry-text-${entry.id}">${entry.text}</p>
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
  const oldText = textElement ? textElement.innerText : '';

  container.innerHTML = '';

  const textarea = document.createElement('textarea');
  textarea.id = `edit-input-${id}`;
  textarea.rows = 4;
  textarea.style.width = '100%';
  textarea.value = oldText;

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
  const category = entryCategory.value;
  if (text !== '') {
    addEntry(text, category);
    entryText.value = '';
  }
});

function switchCategory(category) {
  currentCategory = category;
  categoryTitle.innerText = `${category} Entries`;
  fetchEntries();
}

fetchEntries();
