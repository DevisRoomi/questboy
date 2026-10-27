import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { initDb } from './db';
import authRoutes from './routes/auth';
import questRoutes from './routes/quests';

const app = new Hono();

// CORS for Vite dev server and Herd domain
app.use(
  '*',
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://questboy.test', '*'],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
);

// Init DB
await initDb();

// Routes
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    app: 'QuestBoy API',
    engine: 'Bun + Hono',
    timestamp: new Date().toISOString(),
  });
});

app.route('/api/auth', authRoutes);
app.route('/api/quests', questRoutes);

const port = Number(process.env.PORT) || 3002;
console.log(`🚀 QuestBoy Hono Server running on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
