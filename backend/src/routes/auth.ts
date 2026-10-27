import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import { query, execute, UserRecord } from '../db';
import { JWT_SECRET, authMiddleware } from '../middleware/auth';

const auth = new Hono();

// REGISTER
auth.post('/register', async (c) => {
  try {
    const { name, email, password, avatar } = await c.req.json();
    if (!name || !email || !password) {
      return c.json({ success: false, message: 'Name, email, and password are required' }, 400);
    }

    // Check existing email
    const existing = await query<UserRecord>('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    if (existing.length > 0) {
      return c.json({ success: false, message: 'Email already registered' }, 400);
    }

    const hashedPassword = await Bun.password.hash(password, { algorithm: 'bcrypt', cost: 10 });
    const selectedAvatar = avatar || 'boy_cap';

    const result = await execute(
      'INSERT INTO users (name, email, password, avatar, level, xp, gold) VALUES (?, ?, ?, ?, 1, 0, 50)',
      [name, email, hashedPassword, selectedAvatar]
    );

    const userPayload = {
      id: result.insertId,
      name,
      email,
      avatar: selectedAvatar,
      level: 1,
      xp: 0,
      gold: 50,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
    };

    const token = await sign(userPayload, JWT_SECRET, 'HS256');

    return c.json({
      success: true,
      message: 'Welcome to QuestBoy!',
      token,
      user: {
        id: result.insertId,
        name,
        email,
        avatar: selectedAvatar,
        level: 1,
        xp: 0,
        gold: 50,
      },
    }, 201);
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

// LOGIN
auth.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    if (!email || !password) {
      return c.json({ success: false, message: 'Email and password required' }, 400);
    }

    const rows = await query<UserRecord>('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
    if (rows.length === 0) {
      return c.json({ success: false, message: 'Invalid email or password' }, 401);
    }

    const user = rows[0];
    const isMatch = await Bun.password.verify(password, user.password);
    if (!isMatch) {
      return c.json({ success: false, message: 'Invalid email or password' }, 401);
    }

    const userPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      level: user.level,
      xp: user.xp,
      gold: user.gold,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
    };

    const token = await sign(userPayload, JWT_SECRET, 'HS256');

    return c.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        level: user.level,
        xp: user.xp,
        gold: user.gold,
      },
    });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

// GET ME
auth.get('/me', authMiddleware, async (c) => {
  try {
    const payload = c.get('user') as any;
    const rows = await query<UserRecord>('SELECT id, name, email, avatar, level, xp, gold, created_at FROM users WHERE id = ? LIMIT 1', [payload.id]);
    if (rows.length === 0) {
      return c.json({ success: false, message: 'User not found' }, 404);
    }

    return c.json({
      success: true,
      user: rows[0],
    });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

export default auth;
