import { useCallback, useMemo } from 'react';
import type { AppState, UserLevel, LevelConfig } from '../lib/types';
import {
  calculateLevel,
  checkLevelUp,
  getLevelConfig,
  getLevelProgressBarData,
} from '../lib/logic/levelLogic';
import { TRAIN_LEVELS } from '../lib/constants';

interface UseLevelReturn {
  userLevel: UserLevel | null;
  currentLevel: number;
  levelConfig: LevelConfig;
  levelProgress: ReturnType<typeof calculateLevel> | null;
  progressBarData: ReturnType<typeof getLevelProgressBarData> | null;
  allLevelConfigs: LevelConfig[];
  updateForPoints: (newTotalPoints: number) => { didLevelUp: boolean; oldConfig: LevelConfig; newConfig: LevelConfig } | null;
}

export function useLevel(
  appState: AppState,
  updateAppState: (updater: (state: AppState) => AppState) => void
): UseLevelReturn {
  const { level, points } = appState;

  const levelProgress = useMemo(() =>
    points ? calculateLevel(points.total) : null,
    [points]
  );

  const levelConfig = useMemo(() =>
    level ? getLevelConfig(level.currentLevel) : getLevelConfig(1),
    [level]
  );

  const progressBarData = useMemo(() =>
    level ? getLevelProgressBarData(level) : null,
    [level]
  );

  const updateForPoints = useCallback((newTotalPoints: number) => {
    if (!level || !appState.userId) return null;

    const result = checkLevelUp(level, newTotalPoints);
    if (!result) return null;

    updateAppState(state => ({
      ...state,
      level: result.newLevel,
    }));

    if (result.didLevelUp) {
      return {
        didLevelUp: true,
        oldConfig: result.oldLevelConfig,
        newConfig: result.newLevelConfig,
      };
    }

    return null;
  }, [level, appState.userId, updateAppState]);

  return {
    userLevel: level,
    currentLevel: level?.currentLevel ?? 1,
    levelConfig,
    levelProgress,
    progressBarData,
    allLevelConfigs: TRAIN_LEVELS,
    updateForPoints,
  };
}
