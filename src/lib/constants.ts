import { Achievement, LevelConfig, Theme, Task } from './types';

export const PRESET_TASKS: Task[] = [
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

export const TRAIN_LEVELS: LevelConfig[] = [
  { level: 1, name: "蒸汽机车", icon: "🚂", requiredPoints: 0 },
  { level: 2, name: "内燃机车", icon: "🚃", requiredPoints: 100 },
  { level: 3, name: "电力机车", icon: "🚄", requiredPoints: 500 },
  { level: 4, name: "高铁", icon: "🚅", requiredPoints: 1500 },
  { level: 5, name: "磁悬浮", icon: "🚆", requiredPoints: 4000 },
  { level: 6, name: "时光列车", icon: "✨", requiredPoints: 10000 },
];

export const PRESET_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_carriage', name: '启程', description: '完成第一个时间车厢', icon: '🚀', category: 'task', rarity: 'common', isHidden: false, condition: { type: 'complete_carriages', target: 1 }, rewards: { points: 30 }, createdAt: Date.now() },
  { id: 'carriages_10', name: '时间管理者', description: '累计完成10个车厢', icon: '⏰', category: 'task', rarity: 'common', isHidden: false, condition: { type: 'complete_carriages', target: 10 }, rewards: { points: 100 }, createdAt: Date.now() },
  { id: 'carriages_50', name: '时间小能手', description: '累计完成50个车厢', icon: '💪', category: 'task', rarity: 'rare', isHidden: false, condition: { type: 'complete_carriages', target: 50 }, rewards: { points: 250 }, createdAt: Date.now() },
  { id: 'carriages_100', name: '时间大师', description: '累计完成100个车厢', icon: '👑', category: 'task', rarity: 'epic', isHidden: false, condition: { type: 'complete_carriages', target: 100 }, rewards: { points: 500 }, createdAt: Date.now() },
  { id: 'carriages_500', name: '时间领主', description: '累计完成500个车厢', icon: '🌌', category: 'task', rarity: 'legendary', isHidden: false, condition: { type: 'complete_carriages', target: 500 }, rewards: { points: 2000 }, createdAt: Date.now() },
  { id: 'streak_3', name: '三天热度？', description: '连续完成3天', icon: '🔥', category: 'streak', rarity: 'common', isHidden: false, condition: { type: 'streak_days', target: 3 }, rewards: { points: 50 }, createdAt: Date.now() },
  { id: 'streak_7', name: '周更达人', description: '连续完成7天', icon: '📅', category: 'streak', rarity: 'rare', isHidden: false, condition: { type: 'streak_days', target: 7 }, rewards: { points: 150 }, createdAt: Date.now() },
  { id: 'streak_30', name: '月度冠军', description: '连续完成30天', icon: '🏆', category: 'streak', rarity: 'epic', isHidden: false, condition: { type: 'streak_days', target: 30 }, rewards: { points: 1000 }, createdAt: Date.now() },
  { id: 'streak_100', name: '百日筑基', description: '连续完成100天', icon: '💯', category: 'streak', rarity: 'legendary', isHidden: false, condition: { type: 'streak_days', target: 100 }, rewards: { points: 5000 }, createdAt: Date.now() },
  { id: 'streak_365', name: '时间永恒', description: '连续完成365天', icon: '⭐', category: 'streak', rarity: 'legendary', isHidden: true, condition: { type: 'streak_days', target: 365 }, rewards: { points: 10000 }, createdAt: Date.now() },
  { id: 'all_categories', name: '全能选手', description: '使用过所有分类的任务', icon: '🎯', category: 'explore', rarity: 'rare', isHidden: true, condition: { type: 'custom', target: 1 }, rewards: { points: 200 }, createdAt: Date.now() },
  { id: 'first_share', name: '分享快乐', description: '首次分享', icon: '📤', category: 'social', rarity: 'common', isHidden: false, condition: { type: 'share_count', target: 1 }, rewards: { points: 50 }, createdAt: Date.now() },
  { id: 'shares_10', name: '社交达人', description: '累计分享10次', icon: '💬', category: 'social', rarity: 'rare', isHidden: false, condition: { type: 'share_count', target: 10 }, rewards: { points: 300 }, createdAt: Date.now() },
  { id: 'shares_50', name: '社交牛人', description: '累计分享50次', icon: '📢', category: 'social', rarity: 'epic', isHidden: false, condition: { type: 'share_count', target: 50 }, rewards: { points: 1000 }, createdAt: Date.now() }
];

export const POINTS_RULES = {
  carriageComplete: 10,
  streak3: 50,
  streak7: 150,
  streak30: 1000,
  firstCreateTask: 20,
  firstCompleteCarriage: 30,
  firstShare: 50,
};

export const PRESET_THEMES: Theme[] = [
  { id: 'default', name: '经典蓝', description: '默认主题', isUnlockedByDefault: true, trainStyle: { color: '#3b82f6', carriages: ['#60a5fa', '#93c5fd'] }, backgroundStyle: { color: '#eff6ff', trackColor: '#94a3b8' } },
  { id: 'sunset', name: '日落橙', description: '温暖的日落主题', price: 200, isUnlockedByDefault: false, trainStyle: { color: '#f97316', carriages: ['#fb923c', '#fdba74'] }, backgroundStyle: { color: '#fff7ed', trackColor: '#ea580c' } },
  { id: 'forest', name: '森林绿', description: '清新的森林主题', price: 500, isUnlockedByDefault: false, trainStyle: { color: '#22c55e', carriages: ['#4ade80', '#86efac'] }, backgroundStyle: { color: '#f0fdf4', trackColor: '#16a34a' } },
  { id: 'night', name: '夜空紫', description: '神秘的夜空主题', price: 1000, isUnlockedByDefault: false, trainStyle: { color: '#8b5cf6', carriages: ['#a78bfa', '#c4b5fd'] }, backgroundStyle: { color: '#f5f3ff', trackColor: '#7c3aed' } }
];

export const SHARE_COPY = {
  achievement: (name: string, description: string) => `🎉 我在 TimeTrain 解锁了成就「${name}」！${description} —— 来一起管理时间吧~`,
  level: (levelName: string, icon: string, totalExp: number) => `${icon} 我的 TimeTrain 升级到「${levelName}」啦！已累计获得 ${totalExp} 积分！`,
  daily: (carriages: number, streak: number) => `⏰ 今日在 TimeTrain 完成了 ${carriages} 个时间车厢，连续打卡 ${streak} 天！`
};
