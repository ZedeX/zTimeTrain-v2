// Drizzle ORM schema for Cloudflare D1
import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, uniqueIndex, index } from 'drizzle-orm/sqlite-core';

// Users table
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  phone: text('phone').unique().notNull(),
  password: text('password').notNull(),
  createdAt: integer('created_at').notNull(),
});

// Tasks table
export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  icon: text('icon'),
  color: text('color'),
  category: text('category').notNull(), // "study" | "life" | "activity" | "other"
  isPreset: integer('is_preset', { mode: 'boolean' }).default(false),
  isHidden: integer('is_hidden', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
}, (table) => [
  index('idx_tasks_user_id').on(table.userId),
]);

// Carriages table
export const carriages = sqliteTable('carriages', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  date: text('date').notNull(), // YYYY-MM-DD
  startTime: text('start_time'),
  endTime: text('end_time'),
  taskId: text('task_id').references(() => tasks.id),
  status: text('status').default('pending'), // "pending" | "done" | "failed"
  order: integer('order').notNull(),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
}, (table) => [
  index('idx_carriages_user_date').on(table.userId, table.date),
]);

// User points table
export const userPoints = sqliteTable('user_points', {
  userId: text('user_id').primaryKey().references(() => users.id),
  total: integer('total').default(0),
  current: integer('current').default(0),
  spent: integer('spent').default(0),
  lastUpdated: integer('last_updated').notNull(),
});

// Point records table
export const pointRecords = sqliteTable('point_records', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  amount: integer('amount').notNull(),
  type: text('type').notNull(), // "earn" | "spend"
  reason: text('reason').notNull(),
  sourceId: text('source_id'),
  createdAt: integer('created_at').notNull(),
}, (table) => [
  index('idx_point_records_user_id').on(table.userId),
]);

// Achievements table (preset data)
export const achievements = sqliteTable('achievements', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  icon: text('icon'),
  category: text('category').notNull(), // "task" | "streak" | "explore" | "social"
  rarity: text('rarity').notNull(), // "common" | "rare" | "epic" | "legendary"
  isHidden: integer('is_hidden', { mode: 'boolean' }).default(false),
  conditionType: text('condition_type').notNull(),
  conditionTarget: integer('condition_target').notNull(),
  conditionMetadata: text('condition_metadata'), // JSON
  rewardPoints: integer('reward_points'),
  rewardThemeId: text('reward_theme_id'),
  createdAt: integer('created_at').notNull(),
});

// User achievements table
export const userAchievements = sqliteTable('user_achievements', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  achievementId: text('achievement_id').notNull().references(() => achievements.id),
  unlockedAt: integer('unlocked_at'),
  progress: integer('progress').default(0),
  isNew: integer('is_new', { mode: 'boolean' }).default(true),
}, (table) => [
  index('idx_user_achievements_user_id').on(table.userId),
  uniqueIndex('idx_user_achievement_unique').on(table.userId, table.achievementId),
]);

// User levels table
export const userLevels = sqliteTable('user_levels', {
  userId: text('user_id').primaryKey().references(() => users.id),
  currentLevel: integer('current_level').default(1),
  currentExp: integer('current_exp').default(0),
  totalExp: integer('total_exp').default(0),
  lastLevelUpAt: integer('last_level_up_at'),
});

// Themes table (preset data)
export const themes = sqliteTable('themes', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: integer('price'),
  isUnlockedByDefault: integer('is_unlocked_by_default', { mode: 'boolean' }).default(false),
  trainColor: text('train_color').notNull(),
  trainCarriages: text('train_carriages').notNull(), // JSON array
  backgroundColor: text('background_color').notNull(),
  trackColor: text('track_color').notNull(),
});

// User themes table
export const userThemes = sqliteTable('user_themes', {
  userId: text('user_id').notNull().references(() => users.id),
  themeId: text('theme_id').notNull().references(() => themes.id),
  isCurrent: integer('is_current', { mode: 'boolean' }).default(false),
}, (table) => [
  uniqueIndex('idx_user_theme_pk').on(table.userId, table.themeId),
]);

// Share records table
export const shareRecords = sqliteTable('share_records', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  type: text('type').notNull(), // "achievement" | "level" | "daily" | "custom"
  contentTitle: text('content_title').notNull(),
  contentDescription: text('content_description').notNull(),
  contentImageUrl: text('content_image_url'),
  sharedAt: integer('shared_at').notNull(),
  platform: text('platform'),
}, (table) => [
  index('idx_share_records_user_id').on(table.userId),
]);
