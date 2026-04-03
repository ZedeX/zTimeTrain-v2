-- Migration: 0001_init
-- Created: 2026-04-03

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  category TEXT NOT NULL,
  is_preset INTEGER DEFAULT 0,
  is_hidden INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);

-- Carriages table
CREATE TABLE IF NOT EXISTS carriages (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,
  start_time TEXT,
  end_time TEXT,
  task_id TEXT,
  status TEXT DEFAULT 'pending',
  "order" INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (task_id) REFERENCES tasks(id)
);
CREATE INDEX IF NOT EXISTS idx_carriages_user_date ON carriages(user_id, date);

-- User points table
CREATE TABLE IF NOT EXISTS user_points (
  user_id TEXT PRIMARY KEY,
  total INTEGER DEFAULT 0,
  current INTEGER DEFAULT 0,
  spent INTEGER DEFAULT 0,
  last_updated INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Point records table
CREATE TABLE IF NOT EXISTS point_records (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL,
  reason TEXT NOT NULL,
  source_id TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_point_records_user_id ON point_records(user_id);

-- Achievements table (preset data)
CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  category TEXT NOT NULL,
  rarity TEXT NOT NULL,
  is_hidden INTEGER DEFAULT 0,
  condition_type TEXT NOT NULL,
  condition_target INTEGER NOT NULL,
  condition_metadata TEXT,
  reward_points INTEGER,
  reward_theme_id TEXT,
  created_at INTEGER NOT NULL
);

-- User achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  achievement_id TEXT NOT NULL,
  unlocked_at INTEGER,
  progress INTEGER DEFAULT 0,
  is_new INTEGER DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (achievement_id) REFERENCES achievements(id),
  UNIQUE(user_id, achievement_id)
);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);

-- User levels table
CREATE TABLE IF NOT EXISTS user_levels (
  user_id TEXT PRIMARY KEY,
  current_level INTEGER DEFAULT 1,
  current_exp INTEGER DEFAULT 0,
  total_exp INTEGER DEFAULT 0,
  last_level_up_at INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Themes table (preset data)
CREATE TABLE IF NOT EXISTS themes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER,
  is_unlocked_by_default INTEGER DEFAULT 0,
  train_color TEXT NOT NULL,
  train_carriages TEXT NOT NULL,
  background_color TEXT NOT NULL,
  track_color TEXT NOT NULL
);

-- User themes table
CREATE TABLE IF NOT EXISTS user_themes (
  user_id TEXT NOT NULL,
  theme_id TEXT NOT NULL,
  is_current INTEGER DEFAULT 0,
  PRIMARY KEY (user_id, theme_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (theme_id) REFERENCES themes(id)
);

-- Share records table
CREATE TABLE IF NOT EXISTS share_records (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  content_title TEXT NOT NULL,
  content_description TEXT NOT NULL,
  content_image_url TEXT,
  shared_at INTEGER NOT NULL,
  platform TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_share_records_user_id ON share_records(user_id);

-- ============================================
-- Insert preset data
-- ============================================

-- Insert preset achievements
INSERT INTO achievements (id, name, description, icon, category, rarity, is_hidden, condition_type, condition_target, condition_metadata, reward_points, reward_theme_id, created_at) VALUES
('first_carriage', '启程', '完成第一个时间车厢', '🚀', 'task', 'common', 0, 'complete_carriages', 1, NULL, 30, NULL, strftime('%s', 'now') * 1000),
('carriages_10', '时间管理者', '累计完成10个车厢', '⏰', 'task', 'common', 0, 'complete_carriages', 10, NULL, 100, NULL, strftime('%s', 'now') * 1000),
('carriages_50', '时间小能手', '累计完成50个车厢', '💪', 'task', 'rare', 0, 'complete_carriages', 50, NULL, 250, NULL, strftime('%s', 'now') * 1000),
('carriages_100', '时间大师', '累计完成100个车厢', '👑', 'task', 'epic', 0, 'complete_carriages', 100, NULL, 500, NULL, strftime('%s', 'now') * 1000),
('carriages_500', '时间领主', '累计完成500个车厢', '🌌', 'task', 'legendary', 0, 'complete_carriages', 500, NULL, 2000, NULL, strftime('%s', 'now') * 1000),
('carriages_1000', '时间之神', '累计完成1000个车厢', '⚡', 'task', 'legendary', 0, 'complete_carriages', 1000, NULL, 5000, NULL, strftime('%s', 'now') * 1000),
('streak_3', '三天热度？', '连续完成3天', '🔥', 'streak', 'common', 0, 'streak_days', 3, NULL, 50, NULL, strftime('%s', 'now') * 1000),
('streak_7', '周更达人', '连续完成7天', '📅', 'streak', 'rare', 0, 'streak_days', 7, NULL, 150, NULL, strftime('%s', 'now') * 1000),
('streak_30', '月度冠军', '连续完成30天', '🏆', 'streak', 'epic', 0, 'streak_days', 30, NULL, 1000, NULL, strftime('%s', 'now') * 1000),
('streak_100', '百日筑基', '连续完成100天', '💯', 'streak', 'legendary', 0, 'streak_days', 100, NULL, 5000, NULL, strftime('%s', 'now') * 1000),
('streak_365', '时间永恒', '连续完成365天', '⭐', 'streak', 'legendary', 1, 'streak_days', 365, NULL, 10000, NULL, strftime('%s', 'now') * 1000),
('all_categories', '全能选手', '使用过所有分类的任务', '🎯', 'explore', 'rare', 1, 'custom', 1, NULL, 200, NULL, strftime('%s', 'now') * 1000),
('first_share', '分享快乐', '首次分享', '📤', 'social', 'common', 0, 'share_count', 1, NULL, 50, NULL, strftime('%s', 'now') * 1000),
('shares_10', '社交达人', '累计分享10次', '💬', 'social', 'rare', 0, 'share_count', 10, NULL, 300, NULL, strftime('%s', 'now') * 1000),
('shares_50', '社交牛人', '累计分享50次', '📢', 'social', 'epic', 0, 'share_count', 50, NULL, 1000, NULL, strftime('%s', 'now') * 1000);

-- Insert preset themes
INSERT INTO themes (id, name, description, price, is_unlocked_by_default, train_color, train_carriages, background_color, track_color) VALUES
('default', '经典蓝', '默认主题', NULL, 1, '#3b82f6', '["#60a5fa", "#93c5fd"]', '#eff6ff', '#94a3b8'),
('sunset', '日落橙', '温暖的日落主题', 200, 0, '#f97316', '["#fb923c", "#fdba74"]', '#fff7ed', '#ea580c'),
('forest', '森林绿', '清新的森林主题', 500, 0, '#22c55e', '["#4ade80", "#86efac"]', '#f0fdf4', '#16a34a'),
('night', '夜空紫', '神秘的夜空主题', 1000, 0, '#8b5cf6', '["#a78bfa", "#c4b5fd"]', '#f5f3ff', '#7c3aed');
