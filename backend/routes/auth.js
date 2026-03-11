const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function getAdminEmailSet() {
  return new Set(
    String(process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((email) => normalizeEmail(email))
      .filter(Boolean)
  );
}

function resolveRoleForUser(user = {}) {
  const adminEmailSet = getAdminEmailSet();
  const email = normalizeEmail(user.email);
  return adminEmailSet.has(email) ? 'admin' : 'customer';
}

function getJwtConfig() {
  const secret = String(process.env.JWT_SECRET || '').trim();
  if (!secret) {
    return null;
  }

  return {
    secret,
    expiresIn: String(process.env.JWT_EXPIRE || '7d').trim(),
  };
}

function createAuthPayload(user = {}) {
  const role = resolveRoleForUser(user);
  return {
    sub: user.user_id,
    email: user.email,
    role,
  };
}

function signAuthToken(payload) {
  const jwtConfig = getJwtConfig();
  if (!jwtConfig) {
    const error = new Error('Server misconfiguration: JWT_SECRET is not set');
    error.status = 500;
    throw error;
  }

  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
  });
}

function sanitizeUser(user = {}) {
  return {
    id: user.user_id,
    username: user.username,
    email: user.email,
    role: resolveRoleForUser(user),
  };
}

async function findUserByEmail(pool, email) {
  const [rows] = await pool.execute(
    `SELECT user_id, username, email, password_hash
     FROM users
     WHERE LOWER(email) = ?
     LIMIT 1`,
    [normalizeEmail(email)]
  );

  return rows[0] || null;
}

async function verifyPassword(user, inputPassword) {
  const passwordHash = String(user?.password_hash || '');
  if (!passwordHash) {
    return false;
  }

  if (passwordHash.startsWith('$2a$') || passwordHash.startsWith('$2b$') || passwordHash.startsWith('$2y$')) {
    return bcrypt.compare(inputPassword, passwordHash);
  }

  return inputPassword === passwordHash;
}

router.post('/signup', async (req, res) => {
  const pool = req.app.locals.pool;
  const firstName = String(req.body?.firstName || '').trim();
  const lastName = String(req.body?.lastName || '').trim();
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || '');

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ error: 'firstName, lastName, email, and password are required' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  try {
    const existingUser = await findUserByEmail(pool, email);
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const username = `${firstName} ${lastName}`.trim();

    const [insertResult] = await pool.execute(
      `INSERT INTO users (username, email, password_hash)
       VALUES (?, ?, ?)`,
      [username, email, passwordHash]
    );

    const createdUser = {
      user_id: insertResult.insertId,
      username,
      email,
      password_hash: passwordHash,
    };

    const payload = createAuthPayload(createdUser);
    const token = signAuthToken(payload);

    return res.status(201).json({
      token,
      user: sanitizeUser(createdUser),
    });
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message || 'Failed to create account' });
  }
});

router.post('/login', async (req, res) => {
  const pool = req.app.locals.pool;
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || '');

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  try {
    const user = await findUserByEmail(pool, email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await verifyPassword(user, password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const payload = createAuthPayload(user);
    const token = signAuthToken(payload);

    return res.json({
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message || 'Login failed' });
  }
});

router.post('/admin/login', async (req, res) => {
  const pool = req.app.locals.pool;
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || '');

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  try {
    const user = await findUserByEmail(pool, email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await verifyPassword(user, password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const role = resolveRoleForUser(user);
    if (role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: admin access required' });
    }

    const payload = createAuthPayload(user);
    const token = signAuthToken(payload);

    return res.json({
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message || 'Admin login failed' });
  }
});

module.exports = router;
