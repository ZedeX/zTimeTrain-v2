import { Task, UserPoints, PointRecord, UserLevel } from '../types';
import { get } from './client';
import type { AchievementWithProgress } from './achievements';
import type { ThemeWithStatus } from './themes';

export interface InitialData {
  tasks: Task[];
  carriages: Record<string, any[]>;
  points: UserPoints | null;
  pointRecords: PointRecord[];
  achievements: AchievementWithProgress[];
  level: UserLevel | null;
  themes: ThemeWithStatus[];
  unlockedThemeIds: string[];
  currentThemeId: string;
}

export async function getInitialData(): Promise<InitialData> {
  return get<InitialData>('/initial-data');
}
