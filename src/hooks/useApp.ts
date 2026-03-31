import { useState, useEffect, useCallback } from 'react';
import { AppState } from '../lib/types';
import { loadAppState, saveAppState } from '../lib/storage/localStorage';
import { useEventBus } from './useEventBus';

export function useApp() {
  const [state, setState] = useState<AppState>(loadAppState());
  const { emit } = useEventBus();

  // Save state to localStorage whenever it changes
  useEffect(() => {
    saveAppState(state);
  }, [state]);

  const updateAppState = useCallback((updater: (state: AppState) => AppState) => {
    setState(prev => {
      const next = updater(prev);
      return { ...next, lastModified: Date.now() };
    });
  }, []);

  const login = useCallback((userId: string) => {
    updateAppState(s => ({
      ...s,
      userId,
      points: s.points || { userId, total: 0, current: 0, spent: 0, lastUpdated: Date.now() },
      level: s.level || { userId, currentLevel: 1, currentExp: 0, totalExp: 0 }
    }));
  }, [updateAppState]);

  const logout = useCallback(() => {
    updateAppState(s => ({ ...s, userId: null }));
  }, [updateAppState]);

  const setDate = useCallback((date: string) => {
    updateAppState(s => ({ ...s, currentDate: date }));
  }, [updateAppState]);

  return {
    state,
    updateAppState,
    login,
    logout,
    setDate,
    emit
  };
}
