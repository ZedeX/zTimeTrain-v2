import { Theme } from '../types';
import { get, put } from './client';

export interface ThemeWithStatus extends Theme {
  isUnlocked: boolean;
  isCurrent: boolean;
}

export async function getThemes(): Promise<ThemeWithStatus[]> {
  return get<ThemeWithStatus[]>('/themes');
}

export async function setCurrentTheme(themeId: string): Promise<void> {
  return put<void>('/themes/current', { themeId });
}
