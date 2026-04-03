import { createToken, verifyToken, getTokenFromRequest } from './auth';

export interface Env {
  zTimeTrain: D1Database;
  JWT_SECRET?: string;
}

// Helper: Get JWT secret from env or use default
function getJwtSecret(env: Env): string {
  return env.JWT_SECRET || 'default-dev-secret-change-in-production';
}

// Helper: Get and verify userId from request
async function getAuthenticatedUserId(request: Request, env: Env): Promise<string | null> {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  return await verifyToken(token, getJwtSecret(env));
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle OPTIONS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // User routes (no auth required)
      if (path === '/api/register' && request.method === 'POST') {
        return handleRegister(request, env, corsHeaders);
      }
      if (path === '/api/login' && request.method === 'POST') {
        return handleLogin(request, env, corsHeaders);
      }

      // All other routes require auth
      const userId = await getAuthenticatedUserId(request, env);
      if (!userId) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Task routes
      if (path === '/api/tasks') {
        if (request.method === 'GET') return handleGetTasks(userId, env, corsHeaders);
        if (request.method === 'POST') return handleCreateTask(userId, request, env, corsHeaders);
      }
      if (path.startsWith('/api/tasks/')) {
        const id = path.split('/api/tasks/')[1];
        if (request.method === 'PUT') return handleUpdateTask(userId, id, request, env, corsHeaders);
        if (request.method === 'DELETE') return handleDeleteTask(userId, id, env, corsHeaders);
      }

      // Carriage routes
      if (path.startsWith('/api/carriages/')) {
        const datePart = path.split('/api/carriages/')[1];
        if (request.method === 'GET' && datePart && !datePart.includes('/')) {
          return handleGetCarriages(userId, datePart, env, corsHeaders);
        }
      }
      if (path === '/api/carriages' && request.method === 'POST') {
        return handleBatchUpdateCarriages(userId, request, env, corsHeaders);
      }

      // Points routes
      if (path === '/api/points') {
        if (request.method === 'GET') return handleGetPoints(userId, env, corsHeaders);
      }
      if (path === '/api/points/records') {
        if (request.method === 'GET') return handleGetPointRecords(userId, env, corsHeaders);
        if (request.method === 'POST') return handleAddPointRecord(userId, request, env, corsHeaders);
      }

      // Achievements routes
      if (path === '/api/achievements' && request.method === 'GET') {
        return handleGetAchievements(userId, env, corsHeaders);
      }

      // Level routes
      if (path === '/api/level' && request.method === 'GET') {
        return handleGetLevel(userId, env, corsHeaders);
      }
      if (path === '/api/level/exp' && request.method === 'POST') {
        return handleAddExp(userId, request, env, corsHeaders);
      }

      // Themes routes
      if (path === '/api/themes' && request.method === 'GET') {
        return handleGetThemes(userId, env, corsHeaders);
      }
      if (path === '/api/themes/current' && request.method === 'PUT') {
        return handleSetCurrentTheme(userId, request, env, corsHeaders);
      }

      // Initial data route
      if (path === '/api/initial-data' && request.method === 'GET') {
        return handleGetInitialData(userId, env, corsHeaders);
      }

      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('API Error:', error);
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};

// User handlers
async function handleRegister(request: Request, env: Env, corsHeaders: Record<string, string>) {
  const { phone, password } = await request.json() as { phone: string; password: string };
  if (!phone || !password) {
    return new Response(JSON.stringify({ error: 'Phone and password are required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const id = 'user-' + Math.random().toString(36).substring(2, 11);
  const createdAt = Date.now();

  try {
    await env.zTimeTrain.prepare(
      'INSERT INTO users (id, phone, password, created_at) VALUES (?, ?, ?, ?)'
    ).bind(id, phone, password, createdAt).run();

    // Initialize user's points, level, and default theme
    await env.zTimeTrain.prepare(
      'INSERT INTO user_points (user_id, total, current, spent, last_updated) VALUES (?, 0, 0, 0, ?)'
    ).bind(id, createdAt).run();

    await env.zTimeTrain.prepare(
      'INSERT INTO user_levels (user_id, current_level, current_exp, total_exp) VALUES (?, 1, 0, 0)'
    ).bind(id).run();

    await env.zTimeTrain.prepare(
      'INSERT INTO user_themes (user_id, theme_id, is_current) VALUES (?, ?, 1)'
    ).bind(id, 'default').run();

    // Initialize user achievements
    const achievements = await env.zTimeTrain.prepare('SELECT id FROM achievements').all<{ id: string }>();
    for (const ach of achievements.results || []) {
      const uaId = 'ua-' + Math.random().toString(36).substring(2, 11);
      await env.zTimeTrain.prepare(
        'INSERT INTO user_achievements (id, user_id, achievement_id, progress, is_new) VALUES (?, ?, ?, 0, 1)'
      ).bind(uaId, id, ach.id).run();
    }

    // Create and return token
    const token = await createToken(id, getJwtSecret(env));
    return new Response(JSON.stringify({ success: true, userId: id, token }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    if (err.message?.includes('UNIQUE') || err.cause?.message?.includes('UNIQUE')) {
      return new Response(JSON.stringify({ error: 'Phone number already registered' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    throw err;
  }
}

async function handleLogin(request: Request, env: Env, corsHeaders: Record<string, string>) {
  const { phone, password } = await request.json() as { phone: string; password: string };
  if (!phone || !password) {
    return new Response(JSON.stringify({ error: 'Phone and password are required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const user = await env.zTimeTrain.prepare(
    'SELECT id FROM users WHERE phone = ? AND password = ?'
  ).bind(phone, password).first<{ id: string }>();

  if (user) {
    const token = await createToken(user.id, getJwtSecret(env));
    return new Response(JSON.stringify({ success: true, userId: user.id, token }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } else {
    return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

// Task handlers
async function handleGetTasks(userId: string, env: Env, corsHeaders: Record<string, string>) {
  const { results } = await env.zTimeTrain.prepare(
    'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at'
  ).bind(userId).all<{
    id: string; user_id: string; name: string; icon: string | null; color: string | null;
    category: string; is_preset: number; is_hidden: number; created_at: number; updated_at: number;
  }>();

  const tasks = (results || []).map(row => ({
    id: row.id,
    name: row.name,
    icon: row.icon,
    color: row.color,
    category: row.category as any,
    isPreset: Boolean(row.is_preset),
    isHidden: Boolean(row.is_hidden),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  return new Response(JSON.stringify({ success: true, data: tasks }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleCreateTask(userId: string, request: Request, env: Env, corsHeaders: Record<string, string>) {
  const task = await request.json() as {
    name: string; icon?: string; color?: string; category: string;
  };
  const id = 't-' + Math.random().toString(36).substring(2, 11);
  const now = Date.now();

  await env.zTimeTrain.prepare(
    'INSERT INTO tasks (id, user_id, name, icon, color, category, is_preset, is_hidden, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?, ?)'
  ).bind(id, userId, task.name, task.icon || null, task.color || null, task.category, now, now).run();

  return new Response(JSON.stringify({
    success: true,
    data: { id, ...task, isPreset: false, isHidden: false, createdAt: now, updatedAt: now }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleUpdateTask(userId: string, id: string, request: Request, env: Env, corsHeaders: Record<string, string>) {
  const updates = await request.json() as Partial<{
    name: string; icon?: string; color?: string; category: string; isHidden: boolean;
  }>;
  const now = Date.now();

  const setClauses: string[] = ['updated_at = ?'];
  const params: any[] = [now];

  if (updates.name !== undefined) { setClauses.push('name = ?'); params.push(updates.name); }
  if (updates.icon !== undefined) { setClauses.push('icon = ?'); params.push(updates.icon || null); }
  if (updates.color !== undefined) { setClauses.push('color = ?'); params.push(updates.color || null); }
  if (updates.category !== undefined) { setClauses.push('category = ?'); params.push(updates.category); }
  if (updates.isHidden !== undefined) { setClauses.push('is_hidden = ?'); params.push(updates.isHidden ? 1 : 0); }

  params.push(id, userId);

  const result = await env.zTimeTrain.prepare(
    `UPDATE tasks SET ${setClauses.join(', ')} WHERE id = ? AND user_id = ?`
  ).bind(...params).run();

  if (!result.success) {
    return new Response(JSON.stringify({ error: 'Update failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleDeleteTask(userId: string, id: string, env: Env, corsHeaders: Record<string, string>) {
  await env.zTimeTrain.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?').bind(id, userId).run();

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Carriage handlers
async function handleGetCarriages(userId: string, date: string, env: Env, corsHeaders: Record<string, string>) {
  const { results } = await env.zTimeTrain.prepare(
    'SELECT * FROM carriages WHERE user_id = ? AND date = ? ORDER BY "order"'
  ).bind(userId, date).all<{
    id: string; user_id: string; date: string; start_time: string | null; end_time: string | null;
    task_id: string | null; status: string; order: number; created_at: number; updated_at: number;
  }>();

  const carriages = (results || []).map(row => ({
    id: row.id,
    date: row.date,
    startTime: row.start_time,
    endTime: row.end_time,
    taskId: row.task_id,
    status: row.status as any,
    order: row.order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  return new Response(JSON.stringify({ success: true, data: carriages }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleBatchUpdateCarriages(userId: string, request: Request, env: Env, corsHeaders: Record<string, string>) {
  const { carriages, date } = await request.json() as {
    carriages: Array<{
      id: string; startTime?: string; endTime?: string; taskId?: string | null;
      status: string; order: number;
    }>;
    date: string;
  };

  // Delete existing carriages for this date
  await env.zTimeTrain.prepare('DELETE FROM carriages WHERE user_id = ? AND date = ?').bind(userId, date).run();

  // Insert new carriages
  const now = Date.now();
  for (const c of carriages) {
    await env.zTimeTrain.prepare(
      'INSERT INTO carriages (id, user_id, date, start_time, end_time, task_id, status, "order", created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      c.id, userId, date, c.startTime || null, c.endTime || null,
      c.taskId || null, c.status, c.order, now, now
    ).run();
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Points handlers
async function handleGetPoints(userId: string, env: Env, corsHeaders: Record<string, string>) {
  const row = await env.zTimeTrain.prepare(
    'SELECT * FROM user_points WHERE user_id = ?'
  ).bind(userId).first<{ user_id: string; total: number; current: number; spent: number; last_updated: number; }>();

  const points = row ? {
    userId: row.user_id,
    total: row.total,
    current: row.current,
    spent: row.spent,
    lastUpdated: row.last_updated,
  } : null;

  return new Response(JSON.stringify({ success: true, data: points }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleGetPointRecords(userId: string, env: Env, corsHeaders: Record<string, string>) {
  const { results } = await env.zTimeTrain.prepare(
    'SELECT * FROM point_records WHERE user_id = ? ORDER BY created_at DESC'
  ).bind(userId).all<{
    id: string; user_id: string; amount: number; type: string; reason: string;
    source_id: string | null; created_at: number;
  }>();

  const records = (results || []).map(row => ({
    id: row.id,
    userId: row.user_id,
    amount: row.amount,
    type: row.type as any,
    reason: row.reason,
    sourceId: row.source_id,
    createdAt: row.created_at,
  }));

  return new Response(JSON.stringify({ success: true, data: records }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleAddPointRecord(userId: string, request: Request, env: Env, corsHeaders: Record<string, string>) {
  const record = await request.json() as {
    amount: number; type: string; reason: string; sourceId?: string;
  };
  const id = 'pr-' + Math.random().toString(36).substring(2, 11);
  const now = Date.now();

  await env.zTimeTrain.prepare(
    'INSERT INTO point_records (id, user_id, amount, type, reason, source_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(id, userId, record.amount, record.type, record.reason, record.sourceId || null, now).run();

  // Update user points
  const currentPoints = await env.zTimeTrain.prepare(
    'SELECT * FROM user_points WHERE user_id = ?'
  ).bind(userId).first<{ total: number; current: number; spent: number; }>();

  if (currentPoints) {
    const delta = record.type === 'earn' ? record.amount : -record.amount;
    await env.zTimeTrain.prepare(
      'UPDATE user_points SET total = total + ?, current = current + ?, last_updated = ? WHERE user_id = ?'
    ).bind(Math.max(0, delta), delta, now, userId).run();
  }

  return new Response(JSON.stringify({ success: true, data: { id, ...record, createdAt: now } }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Achievements handlers
async function handleGetAchievements(userId: string, env: Env, corsHeaders: Record<string, string>) {
  const { results: achResults } = await env.zTimeTrain.prepare('SELECT * FROM achievements').all<{
    id: string; name: string; description: string; icon: string | null; category: string; rarity: string;
    is_hidden: number; condition_type: string; condition_target: number; condition_metadata: string | null;
    reward_points: number | null; reward_theme_id: string | null; created_at: number;
  }>();

  const { results: uaResults } = await env.zTimeTrain.prepare(
    'SELECT * FROM user_achievements WHERE user_id = ?'
  ).bind(userId).all<{
    id: string; user_id: string; achievement_id: string; unlocked_at: number | null;
    progress: number; is_new: number;
  }>();

  const uaMap = new Map((uaResults || []).map(ua => [ua.achievement_id, ua]));

  const achievements = (achResults || []).map(ach => {
    const ua = uaMap.get(ach.id);
    return {
      id: ach.id,
      name: ach.name,
      description: ach.description,
      icon: ach.icon,
      category: ach.category as any,
      rarity: ach.rarity as any,
      isHidden: Boolean(ach.is_hidden),
      condition: {
        type: ach.condition_type as any,
        target: ach.condition_target,
        metadata: ach.condition_metadata ? JSON.parse(ach.condition_metadata) : undefined,
      },
      rewards: {
        points: ach.reward_points ?? undefined,
        themeId: ach.reward_theme_id ?? undefined,
      },
      createdAt: ach.created_at,
      userProgress: ua ? {
        userId: ua.user_id,
        achievementId: ua.achievement_id,
        unlockedAt: ua.unlocked_at,
        progress: ua.progress,
        isNew: Boolean(ua.is_new),
      } : undefined,
    };
  });

  return new Response(JSON.stringify({ success: true, data: achievements }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Level handlers
async function handleGetLevel(userId: string, env: Env, corsHeaders: Record<string, string>) {
  const row = await env.zTimeTrain.prepare(
    'SELECT * FROM user_levels WHERE user_id = ?'
  ).bind(userId).first<{
    user_id: string; current_level: number; current_exp: number; total_exp: number; last_level_up_at: number | null;
  }>();

  const level = row ? {
    userId: row.user_id,
    currentLevel: row.current_level,
    currentExp: row.current_exp,
    totalExp: row.total_exp,
    lastLevelUpAt: row.last_level_up_at ?? undefined,
  } : null;

  return new Response(JSON.stringify({ success: true, data: level }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleAddExp(userId: string, request: Request, env: Env, corsHeaders: Record<string, string>) {
  const { exp } = await request.json() as { exp: number };

  await env.zTimeTrain.prepare(
    'UPDATE user_levels SET current_exp = current_exp + ?, total_exp = total_exp + ? WHERE user_id = ?'
  ).bind(exp, exp, userId).run();

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Themes handlers
async function handleGetThemes(userId: string, env: Env, corsHeaders: Record<string, string>) {
  const { results: themeResults } = await env.zTimeTrain.prepare('SELECT * FROM themes').all<{
    id: string; name: string; description: string | null; price: number | null;
    is_unlocked_by_default: number; train_color: string; train_carriages: string;
    background_color: string; track_color: string;
  }>();

  const { results: userThemeResults } = await env.zTimeTrain.prepare(
    'SELECT * FROM user_themes WHERE user_id = ?'
  ).bind(userId).all<{ user_id: string; theme_id: string; is_current: number; }>();

  const userThemeMap = new Map((userThemeResults || []).map(ut => [ut.theme_id, ut]));

  const themes = (themeResults || []).map(theme => {
    const ut = userThemeMap.get(theme.id);
    return {
      id: theme.id,
      name: theme.name,
      description: theme.description ?? undefined,
      price: theme.price ?? undefined,
      isUnlockedByDefault: Boolean(theme.is_unlocked_by_default),
      trainStyle: {
        color: theme.train_color,
        carriages: JSON.parse(theme.train_carriages),
      },
      backgroundStyle: {
        color: theme.background_color,
        trackColor: theme.track_color,
      },
      isUnlocked: Boolean(ut || theme.is_unlocked_by_default),
      isCurrent: Boolean(ut?.is_current),
    };
  });

  return new Response(JSON.stringify({ success: true, data: themes }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleSetCurrentTheme(userId: string, request: Request, env: Env, corsHeaders: Record<string, string>) {
  const { themeId } = await request.json() as { themeId: string };

  // Set all to not current
  await env.zTimeTrain.prepare(
    'UPDATE user_themes SET is_current = 0 WHERE user_id = ?'
  ).bind(userId).run();

  // Check if user has this theme unlocked
  const existing = await env.zTimeTrain.prepare(
    'SELECT * FROM user_themes WHERE user_id = ? AND theme_id = ?'
  ).bind(userId, themeId).first();

  if (existing) {
    await env.zTimeTrain.prepare(
      'UPDATE user_themes SET is_current = 1 WHERE user_id = ? AND theme_id = ?'
    ).bind(userId, themeId).run();
  } else {
    await env.zTimeTrain.prepare(
      'INSERT INTO user_themes (user_id, theme_id, is_current) VALUES (?, ?, 1)'
    ).bind(userId, themeId).run();
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Initial data route - gets all data for a user in one request
async function handleGetInitialData(userId: string, env: Env, corsHeaders: Record<string, string>) {
  // Fetch tasks
  const { results: taskResults } = await env.zTimeTrain.prepare(
    'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at'
  ).bind(userId).all<any>();

  // Fetch points
  const pointsRow = await env.zTimeTrain.prepare(
    'SELECT * FROM user_points WHERE user_id = ?'
  ).bind(userId).first<any>();

  // Fetch point records
  const { results: pointRecordResults } = await env.zTimeTrain.prepare(
    'SELECT * FROM point_records WHERE user_id = ? ORDER BY created_at DESC'
  ).bind(userId).all<any>();

  // Fetch level
  const levelRow = await env.zTimeTrain.prepare(
    'SELECT * FROM user_levels WHERE user_id = ?'
  ).bind(userId).first<any>();

  // Fetch achievements
  const { results: achResults } = await env.zTimeTrain.prepare('SELECT * FROM achievements').all<any>();
  const { results: uaResults } = await env.zTimeTrain.prepare(
    'SELECT * FROM user_achievements WHERE user_id = ?'
  ).bind(userId).all<any>();

  // Fetch themes
  const { results: themeResults } = await env.zTimeTrain.prepare('SELECT * FROM themes').all<any>();
  const { results: userThemeResults } = await env.zTimeTrain.prepare(
    'SELECT * FROM user_themes WHERE user_id = ?'
  ).bind(userId).all<any>();

  // Format data
  const tasks = (taskResults || []).map(row => ({
    id: row.id, name: row.name, icon: row.icon, color: row.color,
    category: row.category, isPreset: Boolean(row.is_preset), isHidden: Boolean(row.is_hidden),
    createdAt: row.created_at, updatedAt: row.updated_at,
  }));

  const points = pointsRow ? {
    userId: pointsRow.user_id, total: pointsRow.total, current: pointsRow.current,
    spent: pointsRow.spent, lastUpdated: pointsRow.last_updated,
  } : null;

  const pointRecords = (pointRecordResults || []).map(row => ({
    id: row.id, userId: row.user_id, amount: row.amount, type: row.type,
    reason: row.reason, sourceId: row.source_id, createdAt: row.created_at,
  }));

  const level = levelRow ? {
    userId: levelRow.user_id, currentLevel: levelRow.current_level,
    currentExp: levelRow.current_exp, totalExp: levelRow.total_exp,
    lastLevelUpAt: levelRow.last_level_up_at ?? undefined,
  } : null;

  const uaMap = new Map((uaResults || []).map(ua => [ua.achievement_id, ua]));
  const achievements = (achResults || []).map(ach => {
    const ua = uaMap.get(ach.id);
    return {
      id: ach.id, name: ach.name, description: ach.description, icon: ach.icon,
      category: ach.category, rarity: ach.rarity, isHidden: Boolean(ach.is_hidden),
      condition: {
        type: ach.condition_type, target: ach.condition_target,
        metadata: ach.condition_metadata ? JSON.parse(ach.condition_metadata) : undefined,
      },
      rewards: { points: ach.reward_points ?? undefined, themeId: ach.reward_theme_id ?? undefined },
      createdAt: ach.created_at,
      userProgress: ua ? {
        userId: ua.user_id, achievementId: ua.achievement_id, unlockedAt: ua.unlocked_at,
        progress: ua.progress, isNew: Boolean(ua.is_new),
      } : undefined,
    };
  });

  const userThemeMap = new Map((userThemeResults || []).map(ut => [ut.theme_id, ut]));
  const themes = (themeResults || []).map(theme => ({
    id: theme.id, name: theme.name, description: theme.description ?? undefined,
    price: theme.price ?? undefined, isUnlockedByDefault: Boolean(theme.is_unlocked_by_default),
    trainStyle: { color: theme.train_color, carriages: JSON.parse(theme.train_carriages) },
    backgroundStyle: { color: theme.background_color, trackColor: theme.track_color },
  }));

  const unlockedThemeIds = (userThemeResults || []).map(ut => ut.theme_id);
  const currentThemeId = (userThemeResults || []).find(ut => ut.is_current)?.theme_id || 'default';

  // Get preset tasks if user has none
  const finalTasks = tasks.length > 0 ? tasks : [
    { id: 't1', name: '数学', icon: '📐', color: '#FFB84D', category: 'study', isPreset: true, isHidden: false, createdAt: Date.now(), updatedAt: Date.now() },
    { id: 't2', name: '语文', icon: '📖', color: '#4DA6FF', category: 'study', isPreset: true, isHidden: false, createdAt: Date.now(), updatedAt: Date.now() },
    { id: 't3', name: '英语', icon: '🔤', color: '#FF7A45', category: 'study', isPreset: true, isHidden: false, createdAt: Date.now(), updatedAt: Date.now() },
    { id: 't4', name: '阅读', icon: '📚', color: '#52C41A', category: 'study', isPreset: true, isHidden: false, createdAt: Date.now(), updatedAt: Date.now() },
    { id: 't5', name: '吃饭', icon: '🍚', color: '#FFC53D', category: 'life', isPreset: true, isHidden: false, createdAt: Date.now(), updatedAt: Date.now() },
    { id: 't6', name: '洗漱', icon: '🧼', color: '#36CFC9', category: 'life', isPreset: true, isHidden: false, createdAt: Date.now(), updatedAt: Date.now() },
    { id: 't7', name: '睡觉', icon: '😴', color: '#85A5FF', category: 'life', isPreset: true, isHidden: false, createdAt: Date.now(), updatedAt: Date.now() },
    { id: 't8', name: '运动', icon: '🏃', color: '#FF4D4F', category: 'activity', isPreset: true, isHidden: false, createdAt: Date.now(), updatedAt: Date.now() },
    { id: 't9', name: '劳动', icon: '🧹', color: '#A0D911', category: 'activity', isPreset: true, isHidden: false, createdAt: Date.now(), updatedAt: Date.now() },
    { id: 't10', name: '游戏', icon: '🎮', color: '#722ED1', category: 'activity', isPreset: true, isHidden: false, createdAt: Date.now(), updatedAt: Date.now() },
    { id: 't11', name: '其他', icon: '📝', color: '#d4d4d4', category: 'other', isPreset: true, isHidden: false, createdAt: Date.now(), updatedAt: Date.now() },
  ];

  // Insert preset tasks for new user
  if (tasks.length === 0) {
    for (const t of finalTasks) {
      await env.zTimeTrain.prepare(
        'INSERT INTO tasks (id, user_id, name, icon, color, category, is_preset, is_hidden, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 1, 0, ?, ?)'
      ).bind(t.id, userId, t.name, t.icon, t.color, t.category, t.createdAt, t.updatedAt).run();
    }
  }

  return new Response(JSON.stringify({
    success: true,
    data: {
      tasks: finalTasks,
      carriages: {},
      points,
      pointRecords,
      achievements,
      level,
      themes,
      unlockedThemeIds: unlockedThemeIds.length > 0 ? unlockedThemeIds : ['default'],
      currentThemeId,
    },
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
