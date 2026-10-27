import { Hono } from 'hono';
import { query, execute, QuestRecord, UserRecord } from '../db';
import { authMiddleware } from '../middleware/auth';

const quests = new Hono();

// Apply auth to all quest routes
quests.use('*', authMiddleware);

// XP calculation helper: Level * 100 XP
function calculateLevel(currentXp: number): { level: number; currentLevelXp: number; nextLevelXp: number } {
  // Level formula: level = Math.floor(Math.sqrt(currentXp / 50)) + 1 or simple tier:
  // Level 1: 0-100, Level 2: 101-250, Level 3: 251-450, etc.
  let level = 1;
  let threshold = 100;
  let remaining = currentXp;

  while (remaining >= threshold) {
    remaining -= threshold;
    level++;
    threshold = level * 100;
  }

  return {
    level,
    currentLevelXp: remaining,
    nextLevelXp: threshold,
  };
}

// GET /quests
quests.get('/', async (c) => {
  try {
    const user = c.get('user') as any;
    const status = c.req.query('status');

    let sql = 'SELECT * FROM quests WHERE user_id = ?';
    const params: any[] = [user.id];

    if (status && (status === 'todo' || status === 'completed')) {
      sql += ' AND status = ?';
      params.push(status);
    }
    sql += ' ORDER BY id DESC';

    const items = await query<QuestRecord>(sql, params);
    return c.json({ success: true, data: items });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

// POST /quests
quests.post('/', async (c) => {
  try {
    const user = c.get('user') as any;
    const { title, category = 'game', difficulty = 'easy', due_date } = await c.req.json();

    if (!title || !title.trim()) {
      return c.json({ success: false, message: 'Quest title is required' }, 400);
    }

    let xp = 25;
    let gold = 10;
    if (difficulty === 'medium') {
      xp = 50;
      gold = 25;
    } else if (difficulty === 'boss') {
      xp = 120;
      gold = 60;
    }

    const result = await execute(
      'INSERT INTO quests (user_id, title, category, difficulty, xp_reward, gold_reward, status, due_date) VALUES (?, ?, ?, ?, ?, ?, "todo", ?)',
      [user.id, title.trim(), category, difficulty, xp, gold, due_date || null]
    );

    const created = await query<QuestRecord>('SELECT * FROM quests WHERE id = ?', [result.insertId]);
    return c.json({ success: true, data: created[0] }, 201);
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

// PATCH /quests/:id/toggle
quests.patch('/:id/toggle', async (c) => {
  try {
    const userPayload = c.get('user') as any;
    const id = Number(c.req.param('id'));

    const items = await query<QuestRecord>('SELECT * FROM quests WHERE id = ? AND user_id = ? LIMIT 1', [id, userPayload.id]);
    if (items.length === 0) {
      return c.json({ success: false, message: 'Quest not found' }, 404);
    }

    const quest = items[0];
    const newStatus = quest.status === 'completed' ? 'todo' : 'completed';

    await execute('UPDATE quests SET status = ? WHERE id = ?', [newStatus, id]);

    // Fetch user profile to update XP & Gold
    const uRows = await query<UserRecord>('SELECT * FROM users WHERE id = ? LIMIT 1', [userPayload.id]);
    const u = uRows[0];

    let newXp = u.xp;
    let newGold = u.gold;

    if (newStatus === 'completed') {
      newXp += quest.xp_reward;
      newGold += quest.gold_reward;
    } else {
      newXp = Math.max(0, newXp - quest.xp_reward);
      newGold = Math.max(0, newGold - quest.gold_reward);
    }

    const lvlData = calculateLevel(newXp);
    const leveledUp = newStatus === 'completed' && lvlData.level > u.level;

    await execute('UPDATE users SET xp = ?, gold = ?, level = ? WHERE id = ?', [
      newXp,
      newGold,
      lvlData.level,
      u.id,
    ]);

    return c.json({
      success: true,
      data: {
        quest: { ...quest, status: newStatus },
        user: {
          id: u.id,
          xp: newXp,
          gold: newGold,
          level: lvlData.level,
          currentLevelXp: lvlData.currentLevelXp,
          nextLevelXp: lvlData.nextLevelXp,
          leveledUp,
        },
      },
    });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

// DELETE /quests/:id
quests.delete('/:id', async (c) => {
  try {
    const userPayload = c.get('user') as any;
    const id = Number(c.req.param('id'));

    const res = await execute('DELETE FROM quests WHERE id = ? AND user_id = ?', [id, userPayload.id]);
    if (res.affectedRows === 0) {
      return c.json({ success: false, message: 'Quest not found' }, 404);
    }

    return c.json({ success: true, message: 'Quest deleted' });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

// GET /stats
quests.get('/summary/stats', async (c) => {
  try {
    const userPayload = c.get('user') as any;
    const uRows = await query<UserRecord>('SELECT * FROM users WHERE id = ? LIMIT 1', [userPayload.id]);
    const u = uRows[0];

    const statsRows = await query<any>(
      `SELECT 
        COUNT(*) as total, 
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count,
        SUM(CASE WHEN status = 'todo' THEN 1 ELSE 0 END) as todo_count
       FROM quests WHERE user_id = ?`,
      [u.id]
    );

    const lvlData = calculateLevel(u.xp);

    return c.json({
      success: true,
      stats: {
        user: {
          id: u.id,
          name: u.name,
          email: u.email,
          avatar: u.avatar,
          level: lvlData.level,
          xp: u.xp,
          currentLevelXp: lvlData.currentLevelXp,
          nextLevelXp: lvlData.nextLevelXp,
          gold: u.gold,
        },
        totalQuests: Number(statsRows[0].total) || 0,
        completedQuests: Number(statsRows[0].completed_count) || 0,
        todoQuests: Number(statsRows[0].todo_count) || 0,
      },
    });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

export default quests;
