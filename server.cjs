const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database.cjs');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-me';

// Register
app.post('/api/auth/signup', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run(
      'INSERT INTO users (email, password) VALUES (?, ?)',
      [email, hashedPassword],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'User already exists' });
          }
          return res.status(500).json({ error: err.message });
        }
        
        const user = { id: this.lastID, email };
        const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
        res.json({ user, session: { access_token: token } });
      }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: { id: user.id, email: user.email }, session: { access_token: token } });
  });
});

// Verify token
app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ user: decoded });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Auth server running on http://localhost:${PORT}`);
});
