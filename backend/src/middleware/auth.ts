import { createMiddleware } from 'hono/factory';
import { verify } from 'hono/jwt';

export const JWT_SECRET = process.env.JWT_SECRET || 'questboy-super-secret-key-2026';

export const authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, message: 'Unauthorized: Token missing' }, 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = await verify(token, JWT_SECRET, 'HS256');
    c.set('user', payload);
    await next();
  } catch (err: any) {
    return c.json({ success: false, message: `Unauthorized: ${err.message}` }, 401);
  }
});
