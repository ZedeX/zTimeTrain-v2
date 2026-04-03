import { Achievement } from '../types';
import { get } from './client';

export interface AchievementWithProgress extends Achievement {
  userProgress?: {
    userId: string;
    achievementId: string;
    unlockedAt: number | null;
    progress: number;
    isNew: boolean;
  };
}

export async function getAchievements(): Promise<AchievementWithProgress[]> {
  return get<AchievementWithProgress[]>('/achievements');
}
