const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Nuestra "base de datos", un JSON:
const DB_PATH = path.join(__dirname, '../users.json');

function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ users: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// CRUD REST ROUTES

// GET /users — Devuelve todos los usuarios
router.get('/', (req, res) => {
  const { users } = readDB();
  res.json({ count: users.length, users });
});

// GET /users/:id — Busca un usuario por ID
router.get('/:id', (req, res) => {
  const { users } = readDB();
  const user = users.find((u) => u.id === req.params.id);

  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// POST /users — Crea un nuevo usuario
router.post('/', (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' });
  }

  const db = readDB();

  if (db.users.some((u) => u.email === email)) {
    return res.status(409).json({ error: 'Email already exists' });
  }

  const newUser = {
    id: uuidv4(),
    name,
    email,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  writeDB(db);

  res.status(201).json(newUser);
});

// PUT /users/:id — Reemplaza un usuario (Por completo)
router.put('/:id', (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' });
  }

  const db = readDB();
  const index = db.users.findIndex((u) => u.id === req.params.id);

  if (index === -1) return res.status(404).json({ error: 'User not found' });

  const emailTaken = db.users.some((u) => u.email === email && u.id !== req.params.id);
  if (emailTaken) return res.status(409).json({ error: 'Email already in use' });

  db.users[index] = {
    ...db.users[index],
    name,
    email,
    updatedAt: new Date().toISOString(),
  };

  writeDB(db);
  res.json(db.users[index]);
});

// PATCH /users/:id — Modificamos parte de un usuario (Por ID)
router.patch('/:id', (req, res) => {
  const db = readDB();
  const index = db.users.findIndex((u) => u.id === req.params.id);

  if (index === -1) return res.status(404).json({ error: 'User not found' });

  const { name, email } = req.body;

  if (email) {
    const emailTaken = db.users.some((u) => u.email === email && u.id !== req.params.id);
    if (emailTaken) return res.status(409).json({ error: 'Email already in use' });
  }

  db.users[index] = {
    ...db.users[index],
    ...(name && { name }),
    ...(email && { email }),
    updatedAt: new Date().toISOString(),
  };

  writeDB(db);
  res.json(db.users[index]);
});

// DELETE /users/:id — Borramos un usuario
router.delete('/:id', (req, res) => {
  const db = readDB();
  const index = db.users.findIndex((u) => u.id === req.params.id);

  if (index === -1) return res.status(404).json({ error: 'User not found' });

  const [deleted] = db.users.splice(index, 1);
  writeDB(db);

  res.json({ message: 'User deleted', user: deleted });
});

// DELETE /users — Borramos todos los usuarios
router.delete('/', (req, res) => {
  writeDB({ users: [] });
  res.json({ message: 'All users deleted' });
});

module.exports = router;
