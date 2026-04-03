import { UserLevel } from '../types';
import { get, post } from './client';

export async function getLevel(): Promise<UserLevel | null> {
  return get<UserLevel | null>('/level');
}

export async function addExp(exp: number): Promise<void> {
  return post<void>('/level/exp', { exp });
}
