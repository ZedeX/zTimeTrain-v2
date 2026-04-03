import { UserPoints, PointRecord } from '../types';
import { get, post } from './client';

export async function getPoints(): Promise<UserPoints | null> {
  return get<UserPoints | null>('/points');
}

export async function getPointRecords(): Promise<PointRecord[]> {
  return get<PointRecord[]>('/points/records');
}

export async function addPointRecord(
  record: Omit<PointRecord, 'id' | 'userId' | 'createdAt'>
): Promise<PointRecord> {
  return post<PointRecord>('/points/records', record);
}
