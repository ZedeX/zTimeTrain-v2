import { useCallback, useMemo } from 'react';
import type { AppState, Achievement, UserAchievement } from '../lib/types';
import {
  updateAchievementProgress,
  checkUnlockedAchievements,
  getVisibleAchievements,
  markAchievementAsRead,
  getAchievementProgress,
} from '../lib/logic/achievementLogic';

interface UseAchievementsReturn {
  allAchievements: Achievement[];
  userAchievements: UserAchievement[];
  visibleAchievements: Achievement[];
  newAchievements: UserAchievement[];
  hasNewAchievements: boolean;
  getProgressForAchievement: (achievementId: string) => ReturnType<typeof getAchievementProgress>;
  handleEvent: (eventType: string, eventData: any) => void;
  markAsRead: (achievementId: string) => void;
  markAllAsRead: () => void;
}

export function useAchievements(
  appState: AppState,
  updateAppState: (updater: (state: AppState) => AppState) => void
): UseAchievementsReturn {
  const { achievements, userAchievements } = appState;

  const visibleAchievements = useMemo(() =>
    getVisibleAchievements(achievements, userAchievements),
    [achievements, userAchievements]
  );

  const newAchievements = useMemo(() =>
    checkUnlockedAchievements(userAchievements, achievements),
    [userAchievements, achievements]
  );

  const hasNewAchievements = newAchievements.length > 0;

  const getProgressForAchievement = useCallback((achievementId: string) => {
    const achievement = achievements.find(a => a.id === achievementId);
    const userAchievement = userAchievements.find(ua => ua.achievementId === achievementId);
    if (!achievement) {
      return { current: 0, target: 1, percent: 0, isUnlocked: false };
    }
    return getAchievementProgress(userAchievement, achievement);
  }, [achievements, userAchievements]);

  const handleEvent = useCallback((eventType: string, eventData: any) => {
    if (!appState.userId) return;

    const updated = updateAchievementProgress(
      appState.userId,
      userAchievements,
      achievements,
      eventType,
      eventData
    );

    updateAppState(state => ({
      ...state,
      userAchievements: updated,
    }));
  }, [appState.userId, userAchievements, achievements, updateAppState]);

  const markAsRead = useCallback((achievementId: string) => {
    updateAppState(state => ({
      ...state,
      userAchievements: state.userAchievements.map(ua =>
        ua.achievementId === achievementId ? markAchievementAsRead(ua) : ua
      ),
    }));
  }, [updateAppState]);

  const markAllAsRead = useCallback(() => {
    updateAppState(state => ({
      ...state,
      userAchievements: state.userAchievements.map(ua =>
        ua.isNew ? markAchievementAsRead(ua) : ua
      ),
    }));
  }, [updateAppState]);

  return {
    allAchievements: achievements,
    userAchievements,
    visibleAchievements,
    newAchievements,
    hasNewAchievements,
    getProgressForAchievement,
    handleEvent,
    markAsRead,
    markAllAsRead,
  };
}
