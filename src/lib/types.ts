export interface User {
  id: string;
  username: string;
  password?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Task {
  id: string;
  name: string;
  icon: string;
  color: string;
  category: "study" | "life" | "activity" | "other";
  isPreset: boolean;
  isHidden: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Carriage {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  taskId: string | null;
  status: "pending" | "done" | "failed";
  order: number;
  createdAt: number;
  updatedAt: number;
}

export interface UndoAction {
  type: 'addCarriage' | 'deleteCarriage' | 'assignTask' | 'unassignTask' | 'updateStatus' | 'addTask' | 'updateTask' | 'deleteTask';
  prevState: Partial<AppState>;
  timestamp: number;
}

export interface PointRecord {
  id: string;
  userId: string;
  amount: number;
  type: 'earn' | 'spend';
  reason: string;
  sourceId?: string;
  createdAt: number;
}

export interface UserPoints {
  userId: string;
  total: number;
  current: number;
  spent: number;
  lastUpdated: number;
}

export type AchievementCategory = 'task' | 'streak' | 'explore' | 'social';
export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface AchievementCondition {
  type: 'complete_carriages' | 'streak_days' | 'total_points' | 'share_count' | 'custom';
  target: number;
  metadata?: Record<string, any>;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  isHidden: boolean;
  condition: AchievementCondition;
  rewards: {
    points?: number;
    themeId?: string;
  };
  createdAt: number;
}

export interface UserAchievement {
  userId: string;
  achievementId: string;
  unlockedAt: number;
  progress: number;
  isNew: boolean;
}

export interface LevelConfig {
  level: number;
  name: string;
  icon: string;
  requiredPoints: number;
  privileges?: string[];
}

export interface UserLevel {
  userId: string;
  currentLevel: number;
  currentExp: number;
  totalExp: number;
  lastLevelUpAt?: number;
}

export type ShareType = 'achievement' | 'level' | 'daily' | 'custom';

export interface ShareRecord {
  id: string;
  userId: string;
  type: ShareType;
  content: {
    title: string;
    description: string;
    imageUrl?: string;
  };
  sharedAt: number;
  platform?: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  price?: number;
  isUnlockedByDefault: boolean;
  trainStyle: {
    color: string;
    carriages: string[];
  };
  backgroundStyle: {
    color: string;
    trackColor: string;
  };
}

export interface AppState {
  userId: string | null;
  currentDate: string;
  tasks: Task[];
  carriages: Record<string, Carriage[]>;
  undoStack: UndoAction[];
  lastModified: number;
  points: UserPoints | null;
  pointRecords: PointRecord[];
  achievements: Achievement[];
  userAchievements: UserAchievement[];
  level: UserLevel | null;
  shareRecords: ShareRecord[];
  themes: Theme[];
  unlockedThemeIds: string[];
  currentThemeId: string;
}
