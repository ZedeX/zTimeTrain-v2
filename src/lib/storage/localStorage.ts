import { AppState } from '../types';
import { PRESET_TASKS, PRESET_ACHIEVEMENTS, PRESET_THEMES } from '../constants';
import { todayStr } from '../utils';

const STORAGE_KEY = 'timetrain_app_state';

export function createInitialAppState(): AppState {
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

export function loadAppState(): AppState {
  if (typeof window === 'undefined') return createInitialAppState();
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return createInitialAppState();
  
  try {
    const parsed = JSON.parse(stored) as AppState;
    // Merge with defaults to ensure new fields are present
    return {
      ...createInitialAppState(),
      ...parsed,
      // Ensure preset tasks and achievements are always up-to-date
      tasks: parsed.tasks?.length ? parsed.tasks : PRESET_TASKS,
      achievements: PRESET_ACHIEVEMENTS,
      themes: PRESET_THEMES,
    };
  } catch (e) {
    console.error('Failed to parse stored app state', e);
    return createInitialAppState();
  }
}

export function saveAppState(state: AppState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
