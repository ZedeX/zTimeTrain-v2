import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, Task, Carriage, UserPoints, PointRecord, Achievement, UserAchievement, UserLevel, Theme } from '../lib/types';
import { PRESET_TASKS, PRESET_ACHIEVEMENTS, PRESET_THEMES } from '../lib/constants';
import { todayStr } from '../lib/utils';
import { useEventBus } from './useEventBus';
import { getInitialData, getCarriages, batchUpdateCarriages, getAuthToken, setAuthToken } from '../lib/api';
import * as authApi from '../lib/api/auth';

// Create initial app state for when no user is logged in
function createInitialAppState(): AppState {
  return {
    userId: null,
    currentDate: todayStr(),
    tasks: PRESET_TASKS,
    carriages: {},
    undoStack: [],
    lastModified: Date.now(),
    points: null,
    pointRecords: [],
    achievements: PRESET_ACHIEVEMENTS,
    userAchievements: [],
    level: null,
    shareRecords: [],
    themes: PRESET_THEMES,
    unlockedThemeIds: ['default'],
    currentThemeId: 'default',
  };
}

export function useApp() {
  const [state, setState] = useState<AppState>(createInitialAppState());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { emit } = useEventBus();
  const saveCarriagesTimeoutRef = useRef<NodeJS.Timeout>();

  // Check for existing token on mount
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      // Token exists, we could try to validate it, but for now just keep user logged out
      // and let them re-login. In a real app, you'd want to validate the token.
    }
  }, []);

  // Load initial data when user logs in
  const loadUserData = useCallback(async (userId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getInitialData();

      setState({
        ...createInitialAppState(),
        userId,
        tasks: data.tasks,
        carriages: data.carriages,
        points: data.points,
        pointRecords: data.pointRecords,
        achievements: data.achievements.map(a => ({
          id: a.id,
          name: a.name,
          description: a.description,
          icon: a.icon,
          category: a.category,
          rarity: a.rarity,
          isHidden: a.isHidden,
          condition: a.condition,
          rewards: a.rewards,
          createdAt: a.createdAt,
        })),
        userAchievements: data.achievements
          .filter(a => a.userProgress)
          .map(a => ({
            userId: a.userProgress!.userId,
            achievementId: a.userProgress!.achievementId,
            unlockedAt: a.userProgress!.unlockedAt,
            progress: a.userProgress!.progress,
            isNew: a.userProgress!.isNew,
          })),
        level: data.level,
        themes: data.themes.map(t => ({
          id: t.id,
          name: t.name,
          description: t.description,
          price: t.price,
          isUnlockedByDefault: t.isUnlockedByDefault,
          trainStyle: t.trainStyle,
          backgroundStyle: t.backgroundStyle,
        })),
        unlockedThemeIds: data.unlockedThemeIds,
        currentThemeId: data.currentThemeId,
      });
    } catch (err) {
      console.error('Failed to load user data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save carriages to server (debounced)
  const saveCarriagesToServer = useCallback(async (date: string, carriages: Carriage[]) => {
    try {
      await batchUpdateCarriages(date, carriages);
    } catch (err) {
      console.error('Failed to save carriages:', err);
    }
  }, []);

  // Debounced save when carriages change
  useEffect(() => {
    if (state.userId && state.currentDate) {
      const carriagesForDate = state.carriages[state.currentDate];
      if (carriagesForDate) {
        if (saveCarriagesTimeoutRef.current) {
          clearTimeout(saveCarriagesTimeoutRef.current);
        }
        saveCarriagesTimeoutRef.current = setTimeout(() => {
          saveCarriagesToServer(state.currentDate, carriagesForDate);
        }, 1000);
      }
    }
    return () => {
      if (saveCarriagesTimeoutRef.current) {
        clearTimeout(saveCarriagesTimeoutRef.current);
      }
    };
  }, [state.userId, state.currentDate, state.carriages, saveCarriagesToServer]);

  // Load carriages for current date when date changes
  useEffect(() => {
    if (state.userId && state.currentDate && !state.carriages[state.currentDate]) {
      const loadCarriagesForDate = async () => {
        try {
          const carriages = await getCarriages(state.currentDate);
          if (carriages.length > 0) {
            setState(prev => ({
              ...prev,
              carriages: {
                ...prev.carriages,
                [state.currentDate]: carriages,
              },
            }));
          }
        } catch (err) {
          console.error('Failed to load carriages:', err);
        }
      };
      loadCarriagesForDate();
    }
  }, [state.userId, state.currentDate, state.carriages]);

  const updateAppState = useCallback((updater: (state: AppState) => AppState) => {
    setState(prev => {
      const next = updater(prev);
      return { ...next, lastModified: Date.now() };
    });
  }, []);

  const login = useCallback(async (phone: string, password: string) => {
    const result = await authApi.login(phone, password);
    await loadUserData(result.userId);
  }, [loadUserData]);

  const register = useCallback(async (phone: string, password: string) => {
    const result = await authApi.register(phone, password);
    await loadUserData(result.userId);
  }, [loadUserData]);

  const logout = useCallback(() => {
    authApi.logout();
    setState(createInitialAppState());
  }, []);

  const setDate = useCallback((date: string) => {
    updateAppState(s => ({ ...s, currentDate: date }));
  }, [updateAppState]);

  return {
    state,
    updateAppState,
    login,
    register,
    logout,
    setDate,
    isLoading,
    error,
    emit
  };
}
