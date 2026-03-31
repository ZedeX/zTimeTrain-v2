import type { UserLevel, LevelConfig } from '../types';
import { TRAIN_LEVELS } from '../constants';

export function createInitialUserLevel(userId: string): UserLevel {
  return {
    userId,
    currentLevel: 1,
    currentExp: 0,
    totalExp: 0,
  };
}

export function calculateLevel(totalPoints: number): {
  level: number;
  currentExp: number;
  nextLevelExp: number;
  progressPercent: number;
  levelConfig: LevelConfig;
} {
  let currentLevelIndex = 0;

  for (let i = 0; i < TRAIN_LEVELS.length; i++) {
    if (totalPoints >= TRAIN_LEVELS[i].requiredPoints) {
      currentLevelIndex = i;
    } else {
      break;
    }
  }

  const currentLevelConfig = TRAIN_LEVELS[currentLevelIndex];
  const nextLevelConfig = TRAIN_LEVELS[currentLevelIndex + 1];

  const currentExp = totalPoints - currentLevelConfig.requiredPoints;
  const nextLevelExp = nextLevelConfig
    ? nextLevelConfig.requiredPoints - currentLevelConfig.requiredPoints
    : 0;
  const progressPercent = nextLevelConfig
    ? Math.min(100, (currentExp / nextLevelExp) * 100)
    : 100;

  return {
    level: currentLevelConfig.level,
    currentExp,
    nextLevelExp,
    progressPercent,
    levelConfig: currentLevelConfig,
  };
}

export function checkLevelUp(
  oldLevel: UserLevel,
  newTotalPoints: number
): {
  didLevelUp: boolean;
  newLevel: UserLevel;
  oldLevelConfig: LevelConfig;
  newLevelConfig: LevelConfig;
} | null {
  const oldCalculated = calculateLevel(oldLevel.totalExp);
  const newCalculated = calculateLevel(newTotalPoints);

  if (newCalculated.level > oldCalculated.level) {
    const newUserLevel: UserLevel = {
      ...oldLevel,
      currentLevel: newCalculated.level,
      currentExp: newCalculated.currentExp,
      totalExp: newTotalPoints,
      lastLevelUpAt: Date.now(),
    };

    return {
      didLevelUp: true,
      newLevel: newUserLevel,
      oldLevelConfig: oldCalculated.levelConfig,
      newLevelConfig: newCalculated.levelConfig,
    };
  }

  if (newTotalPoints !== oldLevel.totalExp) {
    const updatedLevel: UserLevel = {
      ...oldLevel,
      currentExp: newCalculated.currentExp,
      totalExp: newTotalPoints,
    };
    return {
      didLevelUp: false,
      newLevel: updatedLevel,
      oldLevelConfig: oldCalculated.levelConfig,
      newLevelConfig: newCalculated.levelConfig,
    };
  }

  return null;
}

export function getLevelConfig(level: number): LevelConfig {
  const config = TRAIN_LEVELS.find(l => l.level === level);
  if (config) return config;
  return TRAIN_LEVELS[TRAIN_LEVELS.length - 1];
}

export function getLevelProgressBarData(userLevel: UserLevel): {
  current: number;
  max: number;
  percent: number;
  text: string;
} {
  const calculated = calculateLevel(userLevel.totalExp);
  return {
    current: calculated.currentExp,
    max: calculated.nextLevelExp || 1,
    percent: calculated.progressPercent,
    text: `${userLevel.totalExp} / ${calculated.nextLevelExp ? calculated.levelConfig.requiredPoints + calculated.nextLevelExp : 'MAX'}`,
  };
}
