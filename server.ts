import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const db = new Database('database.sqlite');

// Initialize DB
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    phone TEXT UNIQUE,
    password TEXT
  )
`);

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/register', (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) {
    return res.status(400).json({ error: 'Phone and password are required' });
  }
  try {
    const id = 'user-' + Math.random().toString(36).substr(2, 9);
    const stmt = db.prepare('INSERT INTO users (id, phone, password) VALUES (?, ?, ?)');
    stmt.run(id, phone, password);
    res.json({ success: true, userId: id });
  } catch (err: any) {
    if (err.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ error: 'Phone number already registered' });
    } else {
      res.status(500).json({ error: 'Database error' });
    }
  }
});

app.post('/api/login', (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) {
    return res.status(400).json({ error: 'Phone and password are required' });
  }
  const stmt = db.prepare('SELECT id FROM users WHERE phone = ? AND password = ?');
  const user = stmt.get(phone, password) as { id: string } | undefined;
  
  if (user) {
    res.json({ success: true, userId: user.id });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

async function startServer() {
  const PORT = 3000;

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
