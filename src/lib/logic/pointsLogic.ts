import { UserPoints, PointRecord, LevelConfig } from '../types';
import { TRAIN_LEVELS, POINTS_RULES } from '../constants';
import { generateId } from '../utils';

export function generatePointRecordId(): string {
  return `point-${generateId()}`;
}

export function createInitialUserPoints(userId: string): UserPoints {
  return {
    userId,
    total: 0,
    current: 0,
    spent: 0,
    lastUpdated: Date.now(),
  };
}

export function earnPoints(
  currentPoints: UserPoints,
  amount: number,
  reason: string,
  sourceId?: string
): { updatedPoints: UserPoints; record: PointRecord } {
  const record: PointRecord = {
    id: generatePointRecordId(),
    userId: currentPoints.userId,
    amount,
    type: 'earn',
    reason,
    sourceId,
    createdAt: Date.now(),
  };

  const updatedPoints: UserPoints = {
    ...currentPoints,
    total: currentPoints.total + amount,
    current: currentPoints.current + amount,
    lastUpdated: Date.now(),
  };

  return { updatedPoints, record };
}

export function spendPoints(
  currentPoints: UserPoints,
  amount: number,
  reason: string
): { updatedPoints: UserPoints; record: PointRecord } {
  if (currentPoints.current < amount) {
    throw new Error('Insufficient points');
  }

  const record: PointRecord = {
    id: generatePointRecordId(),
    userId: currentPoints.userId,
    amount: -amount,
    type: 'spend',
    reason,
    createdAt: Date.now(),
  };

  const updatedPoints: UserPoints = {
    ...currentPoints,
    current: currentPoints.current - amount,
    spent: currentPoints.spent + amount,
    lastUpdated: Date.now(),
  };

  return { updatedPoints, record };
}

export function calculateLevelProgress(totalPoints: number): {
  level: number;
  currentExp: number;
  nextLevelExp: number;
  progressPercent: number;
  levelConfig: LevelConfig;
} {
  let currentLevel = 1;
  let currentLevelConfig = TRAIN_LEVELS[0];

  for (let i = 0; i < TRAIN_LEVELS.length; i++) {
    if (totalPoints >= TRAIN_LEVELS[i].requiredPoints) {
      currentLevel = TRAIN_LEVELS[i].level;
      currentLevelConfig = TRAIN_LEVELS[i];
    } else {
      break;
    }
  }

  const nextLevelIndex = TRAIN_LEVELS.findIndex(l => l.level === currentLevel + 1);
  const nextLevelConfig = nextLevelIndex !== -1 ? TRAIN_LEVELS[nextLevelIndex] : null;

  const currentExp = totalPoints - currentLevelConfig.requiredPoints;
  const nextLevelExp = nextLevelConfig
    ? nextLevelConfig.requiredPoints - currentLevelConfig.requiredPoints
    : 0;
  const progressPercent = nextLevelConfig
    ? Math.min(100, (currentExp / nextLevelExp) * 100)
    : 100;

  return {
    level: currentLevel,
    currentExp,
    nextLevelExp,
    progressPercent,
    levelConfig: currentLevelConfig,
  };
}

export function getStreakBonusPoints(streakDays: number): number {
  if (streakDays >= 30) return POINTS_RULES.streak30;
  if (streakDays >= 7) return POINTS_RULES.streak7;
  if (streakDays >= 3) return POINTS_RULES.streak3;
  return 0;
}
