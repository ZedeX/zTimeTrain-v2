import { useCallback } from 'react';
import { UserPoints, PointRecord, AppState } from '../lib/types';
import { earnPoints, spendPoints, calculateLevelProgress, getStreakBonusPoints } from '../lib/logic/pointsLogic';
import { checkLevelUp } from '../lib/logic/levelLogic';
import { POINTS_RULES } from '../lib/constants';

interface UsePointsReturn {
  points: UserPoints | null;
  pointRecords: PointRecord[];
  totalPoints: number;
  currentPoints: number;
  levelProgress: ReturnType<typeof calculateLevelProgress> | null;
  earnPointsForCarriage: (carriageId: string) => { points: UserPoints; record: PointRecord } | null;
  earnPointsForStreak: (streakDays: number) => { points: UserPoints; records: PointRecord[] } | null;
  earnPointsForFirstAction: (actionType: string) => { points: UserPoints; record: PointRecord } | null;
  spendPointsOnTheme: (themeId: string, price: number) => { points: UserPoints; record: PointRecord } | null;
}

export function usePoints(
  appState: AppState,
  updateAppState: (updater: (state: AppState) => AppState) => void
): UsePointsReturn {
  const { points, pointRecords } = appState;

  const levelProgress = points ? calculateLevelProgress(points.total) : null;

  const earnPointsForCarriage = useCallback((carriageId: string) => {
    if (!points) return null;

    const alreadyEarned = pointRecords.some(r => r.sourceId === carriageId && r.reason === '完成任务车厢');
    if (alreadyEarned) return null;

    const { updatedPoints, record } = earnPoints(
      points,
      POINTS_RULES.carriageComplete,
      '完成任务车厢',
      carriageId
    );

    updateAppState(state => {
      const newState = {
        ...state,
        points: updatedPoints,
        pointRecords: [...state.pointRecords, record],
      };
      
      // Also update level if points changed
      if (state.level) {
        const levelResult = checkLevelUp(state.level, updatedPoints.total);
        if (levelResult) {
          newState.level = levelResult.newLevel;
        }
      }
      
      return newState;
    });

    return { points: updatedPoints, record };
  }, [points, pointRecords, updateAppState]);

  const earnPointsForStreak = useCallback((streakDays: number) => {
    if (!points) return null;

    const bonus = getStreakBonusPoints(streakDays);
    if (bonus === 0) return null;

    const { updatedPoints, record } = earnPoints(
      points,
      bonus,
      `连续${streakDays}天奖励`
    );

    updateAppState(state => ({
      ...state,
      points: updatedPoints,
      pointRecords: [...state.pointRecords, record],
    }));

    return { points: updatedPoints, records: [record] };
  }, [points, updateAppState]);

  const earnPointsForFirstAction = useCallback((actionType: string) => {
    if (!points) return null;

    let amount: number;
    let reason: string;

    switch (actionType) {
      case 'createTask':
        amount = POINTS_RULES.firstCreateTask;
        reason = '首次创建任务';
        break;
      case 'completeCarriage':
        amount = POINTS_RULES.firstCompleteCarriage;
        reason = '首次完成车厢';
        break;
      case 'share':
        amount = POINTS_RULES.firstShare;
        reason = '首次分享';
        break;
      default:
        return null;
    }

    const { updatedPoints, record } = earnPoints(points, amount, reason);

    updateAppState(state => ({
      ...state,
      points: updatedPoints,
      pointRecords: [...state.pointRecords, record],
    }));

    return { points: updatedPoints, record };
  }, [points, updateAppState]);

  const spendPointsOnTheme = useCallback((themeId: string, price: number) => {
    if (!points) return null;

    try {
      const { updatedPoints, record } = spendPoints(points, price, `解锁主题: ${themeId}`);

      updateAppState(state => ({
        ...state,
        points: updatedPoints,
        pointRecords: [...state.pointRecords, record],
        unlockedThemeIds: [...state.unlockedThemeIds, themeId],
      }));

      return { points: updatedPoints, record };
    } catch {
      return null;
    }
  }, [points, updateAppState]);

  return {
    points,
    pointRecords,
    totalPoints: points?.total ?? 0,
    currentPoints: points?.current ?? 0,
    levelProgress,
    earnPointsForCarriage,
    earnPointsForStreak,
    earnPointsForFirstAction,
    spendPointsOnTheme,
  };
}
