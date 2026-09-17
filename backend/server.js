const express = require('express');
const cors = require('cors');
const initSqlJs = require('sql.js');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'tasks.db');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve static frontend build
const frontendBuildPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendBuildPath));

let db;

async function initDB() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      status TEXT DEFAULT 'pending',
      priority TEXT DEFAULT 'medium',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  saveDB();
}

function saveDB() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

function queryOne(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  let row = null;
  if (stmt.step()) {
    row = stmt.getAsObject();
  }
  stmt.free();
  return row;
}

function runQuery(sql, params = []) {
  db.run(sql, params);
  saveDB();
}

// READ all tasks
app.get('/api/tasks', (req, res) => {
  const { status, priority, search } = req.query;
  let query = 'SELECT * FROM tasks WHERE 1=1';
  const params = [];

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  if (priority) {
    query += ' AND priority = ?';
    params.push(priority);
  }
  if (search) {
    query += ' AND (title LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY created_at DESC';
  const tasks = queryAll(query, params);
  res.json(tasks);
});

// READ single task
app.get('/api/tasks/:id', (req, res) => {
  const task = queryOne('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

// CREATE task
app.post('/api/tasks', (req, res) => {
  const { title, description, status, priority } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const id = uuidv4();
  const now = new Date().toISOString();

  runQuery(
    'INSERT INTO tasks (id, title, description, status, priority, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, title, description || '', status || 'pending', priority || 'medium', now, now]
  );

  const task = queryOne('SELECT * FROM tasks WHERE id = ?', [id]);
  res.status(201).json(task);
});

// UPDATE task
app.put('/api/tasks/:id', (req, res) => {
  const existing = queryOne('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
  if (!existing) return res.status(404).json({ error: 'Task not found' });

  const { title, description, status, priority } = req.body;
  const now = new Date().toISOString();

  runQuery(
    'UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, updated_at = ? WHERE id = ?',
    [
      title ?? existing.title,
      description ?? existing.description,
      status ?? existing.status,
      priority ?? existing.priority,
      now,
      req.params.id,
    ]
  );

  const task = queryOne('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
  res.json(task);
});

// DELETE task
app.delete('/api/tasks/:id', (req, res) => {
  const existing = queryOne('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
  if (!existing) return res.status(404).json({ error: 'Task not found' });

  runQuery('DELETE FROM tasks WHERE id = ?', [req.params.id]);
  res.json({ message: 'Task deleted' });
});

// Stats endpoint
app.get('/api/stats', (req, res) => {
  const total = queryOne('SELECT COUNT(*) as count FROM tasks').count;
  const pending = queryOne("SELECT COUNT(*) as count FROM tasks WHERE status = 'pending'").count;
  const inProgress = queryOne("SELECT COUNT(*) as count FROM tasks WHERE status = 'in_progress'").count;
  const completed = queryOne("SELECT COUNT(*) as count FROM tasks WHERE status = 'completed'").count;
  res.json({ total, pending, inProgress, completed });
});

// Serve frontend for any non-API route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
});

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
