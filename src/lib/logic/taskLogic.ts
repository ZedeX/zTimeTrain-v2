import { Task } from '../types';
import { generateId } from '../utils';

export function addTask(tasks: Task[], task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'isPreset' | 'isHidden'>): Task[] {
  const newTask: Task = {
    ...task,
    id: generateId(),
    isPreset: false,
    isHidden: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  return [...tasks, newTask];
}

export function updateTask(tasks: Task[], id: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'isPreset'>>): Task[] {
  return tasks.map(t => t.id === id ? { ...t, ...updates, updatedAt: Date.now() } : t);
}

export function hideTask(tasks: Task[], id: string): Task[] {
  return tasks.map(t => t.id === id ? { ...t, isHidden: true, updatedAt: Date.now() } : t);
}

export function deleteTask(tasks: Task[], id: string): Task[] {
  return tasks.filter(t => t.id !== id);
}
