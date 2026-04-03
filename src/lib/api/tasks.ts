import { Task } from '../types';
import { get, post, put, del } from './client';

export async function getTasks(): Promise<Task[]> {
  return get<Task[]>('/tasks');
}

export async function createTask(
  task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'isPreset' | 'isHidden'>
): Promise<Task> {
  return post<Task>('/tasks', task);
}

export async function updateTask(
  id: string,
  updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'isPreset'>>
): Promise<void> {
  return put<void>(`/tasks/${id}`, updates);
}

export async function deleteTask(id: string): Promise<void> {
  return del<void>(`/tasks/${id}`);
}
