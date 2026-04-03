import { Carriage } from '../types';
import { get, post } from './client';

export async function getCarriages(date: string): Promise<Carriage[]> {
  return get<Carriage[]>(`/carriages/${date}`);
}

export async function batchUpdateCarriages(
  date: string,
  carriages: Array<Omit<Carriage, 'createdAt' | 'updatedAt'>>
): Promise<void> {
  return post<void>('/carriages', { carriages, date });
}
