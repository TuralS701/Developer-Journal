// ==== server.js ====
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

const entriesFile = path.join(__dirname, 'entries.json');

app.use(express.static('public'));
app.use(express.json());

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

app.get('/api/entries', (req, res) => {
  const entries = JSON.parse(fs.readFileSync(entriesFile, 'utf-8'));
  res.json(entries);
});

app.post('/api/entries', (req, res) => {
  const { text, category } = req.body;
  if (!text || !category) return res.status(400).json({ error: 'Missing fields' });

  const entries = JSON.parse(fs.readFileSync(entriesFile, 'utf-8'));
  const id = Date.now();
  entries.push({ id, text, category });
  fs.writeFileSync(entriesFile, JSON.stringify(entries, null, 2));
  res.json({ message: 'Entry added', id });
});

app.delete('/api/entries/:id', (req, res) => {
  const id = parseInt(req.params.id);
  let entries = JSON.parse(fs.readFileSync(entriesFile, 'utf-8'));
  const initialLength = entries.length;
  entries = entries.filter(entry => entry.id !== id);
  if (entries.length === initialLength) {
    return res.status(404).json({ error: 'Not found' });
  }
  fs.writeFileSync(entriesFile, JSON.stringify(entries, null, 2));
  res.json({ message: 'Deleted' });
});

app.put('/api/entries/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { text } = req.body;
  const entries = JSON.parse(fs.readFileSync(entriesFile, 'utf-8'));
  const index = entries.findIndex(entry => entry.id === id);

  if (index !== -1 && text) {
    entries[index].text = text;
    fs.writeFileSync(entriesFile, JSON.stringify(entries, null, 2));
    res.json({ message: 'Updated' });
  } else {
    res.status(400).json({ error: 'Invalid ID or text' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});